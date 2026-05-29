/**
 * NiceGuyAPI v4.0 — AI Agent Gateway (Vercel Serverless)
 *
 * OpenAI-compatible chat completions via OpenRouter.
 * One API key for 23+ AI models.
 * Now with autonomous Agent capabilities: web search, web fetch, calculator.
 *
 * Uses jsonblob.com for simple persistent storage (free tier).
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try { const Stripe = require('stripe'); stripe = new Stripe(process.env.STRIPE_SECRET_KEY); }
  catch (e) { console.warn('[NiceGuyAPI] Stripe not available'); }
}

// ── Tier Configuration ────────────────────────────────────────────────────
const TIERS = {
  free:     { name: 'Free',     price: 0,  monthly_requests: 14,  rate_limit_per_minute: 5,  rate_limit_per_day: 10,  max_tokens_per_request: 4096,  allows_agent: false, allows_image_gen: false, allows_song_gen: false, allows_games_apps: false },
  pro:      { name: 'Pro',      price: 6,  monthly_requests: 40,  rate_limit_per_minute: 20, rate_limit_per_day: 200, max_tokens_per_request: 32768, allows_agent: true,  allows_image_gen: true,  allows_song_gen: true,  allows_games_apps: false },
  premium:  { name: 'Premium',  price: 27, monthly_requests: 500, rate_limit_per_minute: 60, rate_limit_per_day: 1000, max_tokens_per_request: 131072, allows_agent: true,  allows_image_gen: true,  allows_song_gen: true,  allows_games_apps: true },
};

function apiError(res, status, message, type, extra = {}) {
  return res.status(status).json({ error: { message, type, ...extra } });
}

// ── Persistent Storage via JSONBlob ────────────────────────────────────────
let localCache = null;

async function loadDb() {
  if (localCache) return localCache;
  try {
    const blobId = process.env.JSONBLOB_ID;
    if (blobId) {
      const r = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`);
      if (r.ok) { localCache = await r.json(); return localCache; }
    }
  } catch (e) { console.warn('[NiceGuyAPI] DB load error:', e.message); }
  localCache = { keys: {}, byEmail: {}, byPrefix: {}, billing: {}, agent_history: {} };
  return localCache;
}

async function saveDb(db) {
  localCache = db;
  try {
    const blobId = process.env.JSONBLOB_ID;
    if (blobId) {
      await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });
    }
  } catch (e) { console.warn('[NiceGuyAPI] DB save error:', e.message); }
}

// ── Agent Tools ────────────────────────────────────────────────────────────

async function toolWebSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await r.text();
    // Extract search results (simple regex parse)
    const results = [];
    const titleRe = /<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    const snippetRe = /<a class="result__snippet"[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = titleRe.exec(html)) !== null && results.length < 5) {
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      const link = match[1];
      results.push({ title, link });
    }
    let i = 0;
    while ((match = snippetRe.exec(html)) !== null && i < results.length) {
      results[i].snippet = match[1].replace(/<[^>]+>/g, '').trim();
      i++;
    }
    if (results.length === 0) return 'No search results found.';
    return results.map((r, idx) => `${idx + 1}. ${r.title}\n   ${r.link}\n   ${r.snippet || ''}`).join('\n\n');
  } catch (e) {
    return `Search error: ${e.message}`;
  }
}

async function toolWebFetch(url) {
  try {
    let fetchUrl = url;
    if (!fetchUrl.startsWith('http')) fetchUrl = 'https://' + fetchUrl;
    const r = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text();
    // Strip HTML tags for readable output
    const stripped = text
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return stripped.substring(0, 3000);
  } catch (e) {
    return `Fetch error: ${e.message}`;
  }
}

function toolCalculate(expression) {
  try {
    // Safe math evaluator — only allow numbers and operators
    const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, '');
    if (!sanitized.trim()) return 'Invalid expression';
    // Replace ^ with ** for exponentiation
    const expr = sanitized.replace(/\^/g, '**');
    const result = Function('"use strict"; return (' + expr + ')')();
    return `${expression} = ${result}`;
  } catch (e) {
    return `Calculation error: ${e.message}`;
  }
}

// Agent tool definitions for the LLM
const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information. Use when you need up-to-date info, news, prices, facts, or anything beyond your training data.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query — be specific and concise' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_fetch',
      description: 'Fetch and read the full content of a URL. Use when you need to extract detailed information from a specific webpage. Pass the full URL.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL to fetch (e.g., https://example.com)' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Evaluate a mathematical expression. Supports +, -, *, /, %, ^ (power), parentheses.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression, e.g., "2^10 * 3.14" or "(150 + 275) / 2"' },
        },
        required: ['expression'],
      },
    },
  },
];

// ── Agent Runner ───────────────────────────────────────────────────────────
// Executes a ReAct-style agent loop: LLM thinks → calls tools → thinks → final answer

const AGENT_SYSTEM_PROMPT = `You are NiceGuyAPI Agent, an autonomous AI assistant with access to real-time tools. You can search the web, fetch web pages, and perform calculations.

When you need information beyond your knowledge:
1. Use web_search for current info, news, prices, facts
2. Use web_fetch to read specific webpages
3. Use calculate for math

Guidelines:
- Always use tools when the question involves current events, specific facts, or math
- After getting tool results, synthesize a clear, helpful answer
- If search results have a useful link, use web_fetch on it for more detail
- Be concise but thorough in your final response
- If you have enough info from your own knowledge, answer directly without tools

Format your thinking naturally. The tool results will be injected into the conversation for you.`;

async function runAgent(messages, model, apiKey, historyLimit = 6) {
  // Build conversation with system prompt + recent history + current messages
  const db = await loadDb();
  const historyKey = apiKey.id;
  const history = db.agent_history[historyKey] || [];

  // Construct messages for the agent
  const agentMessages = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    ...history.slice(-historyLimit * 2), // last N exchanges
    ...messages,
  ];

  let totalToolCalls = 0;
  const maxIterations = 5;

  for (let iter = 0; iter < maxIterations; iter++) {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://mrghostguy.github.io/niceguyapi/',
        'X-Title': 'NiceGuyAPI Agent',
      },
      body: JSON.stringify({
        model,
        messages: agentMessages,
        tools: AGENT_TOOLS,
        tool_choice: 'auto',
        max_tokens: apiKey.tier_config.max_tokens_per_request,
      }),
    });

    if (!orRes.ok) {
      const errText = await orRes.text();
      return { error: true, status: orRes.status, body: errText };
    }

    const data = await orRes.json();
    const choice = data.choices?.[0];
    if (!choice) return { error: true, status: 502, body: JSON.stringify(data) };

    const assistantMsg = choice.message;

    // Check if LLM wants to call tools
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      totalToolCalls += assistantMsg.tool_calls.length;
      agentMessages.push(assistantMsg);

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        assistantMsg.tool_calls.map(async (tc) => {
          const fn = tc.function;
          const args = JSON.parse(fn.arguments || '{}');
          let result;

          switch (fn.name) {
            case 'web_search':
              result = await toolWebSearch(args.query);
              break;
            case 'web_fetch':
              result = await toolWebFetch(args.url);
              break;
            case 'calculate':
              result = toolCalculate(args.expression);
              break;
            default:
              result = `Unknown tool: ${fn.name}`;
          }

          return {
            tool_call_id: tc.id,
            role: 'tool',
            content: String(result).substring(0, 4000), // cap tool output
          };
        })
      );

      agentMessages.push(...toolResults);
      // Continue loop — LLM will see tool results and decide what to do next
      continue;
    }

    // No tool calls — this is the final answer
    const finalContent = assistantMsg.content || '';

    // Save conversation history (last N turns)
    const newHistory = [
      ...history,
      ...messages.filter(m => m.role === 'user').map(m => ({ role: 'user', content: m.content })),
      { role: 'assistant', content: finalContent },
    ].slice(-historyLimit * 2);
    db.agent_history[historyKey] = newHistory;
    await saveDb(db);

    // Build usage info
    const usage = data.usage || {};
    return {
      error: false,
      data: {
        id: data.id || `chatcmpl-${uuidv4()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: finalContent, finish_reason: choice.finish_reason },
        }],
        usage: {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
          _agent_tool_calls: totalToolCalls,
        },
      },
    };
  }

  // Max iterations reached — return what we have
  return {
    error: false,
    data: {
      id: `chatcmpl-${uuidv4()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: "I've gathered the information through multiple searches. Let me compile my findings for you above.",
          finish_reason: 'length',
        },
      }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, _agent_tool_calls: totalToolCalls },
    },
  };
}

// ── App ────────────────────────────────────────────────────────────────────
const app = express();

app.post('/v1/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = (process.env.STRIPE_WEBHOOK_SECRET && stripe)
      ? stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(req.body);
  } catch (err) { return res.status(400).json({ error: 'Webhook verification failed' }); }
  if (event.type === 'checkout.session.completed') {
    const db = await loadDb();
    const session = event.data.object;
    const billing = db.billing[session.id];
    if (billing && billing.status === 'pending') {
      const keyRec = db.keys[billing.api_key_id];
      if (keyRec) {
        if (session.metadata?.type === 'refill') {
          keyRec.monthly_limit += parseInt(session.metadata.amount || '10', 10);
        } else if (keyRec.pending_tier) {
          const tc = TIERS[keyRec.pending_tier];
          keyRec.tier = keyRec.pending_tier;
          keyRec.pending_tier = null;
          keyRec.monthly_limit = tc.monthly_requests;
        }
        billing.status = 'completed';
        billing.completed_at = new Date().toISOString();
        await saveDb(db);
      }
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok', version: '4.0.0', timestamp: new Date().toISOString(),
    storage: process.env.JSONBLOB_ID ? 'persistent' : 'memory-only',
    agent: true,
  });
});

// ── Root ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'NiceGuyAPI', version: '4.0.0',
    description: 'AI Model Gateway with autonomous Agent capabilities. OpenAI-compatible.',
    base_url: '/v1',
    pricing: { free: '$0/mo — 14 req', pro: '$6/mo — 40 req (Agent)', premium: '$27/mo — 500 req (Agent+)' },
    endpoints: {
      'GET /health': 'Health check', 'POST /v1/signup': 'Create account',
      'GET /v1/models': 'List models', 'POST /v1/chat/completions': 'Chat or Agent',
      'POST /v1/agent': 'Explicit agent endpoint', 'GET /v1/usage': 'Usage stats',
      'POST /v1/stripe/webhook': 'Stripe',
    },
    features: {
      agent_tools: ['web_search — real-time web search', 'web_fetch — read any webpage', 'calculate — safe math evaluation'],
      agent_memory: 'Conversation history persisted per API key (last 6 turns)',
      agent_llm_calls: 'Up to 5 LLM round-trips per agent request',
    },
    auth: 'X-API-Key header on all /v1 requests (except signup)',
  });
});

// ── Signup ─────────────────────────────────────────────────────────────────
app.post('/v1/signup', async (req, res) => {
  const { email, tier } = req.body;
  if (!email || !email.includes('@')) return apiError(res, 400, 'Valid email required', 'invalid_request');
  const selectedTier = TIERS[tier] ? tier : 'free';
  const db = await loadDb();
  const emailKey = email + ':' + selectedTier;
  if (db.byEmail[emailKey]) return apiError(res, 409, 'Account already exists.', 'duplicate_account');
  const id = uuidv4();
  const rawKey = 'nga_live_' + crypto.randomBytes(24).toString('hex');
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.substring(0, 12);
  const tc = TIERS[selectedTier];
  db.keys[id] = { id, key_hash: keyHash, key_prefix: keyPrefix, email, tier: selectedTier, pending_tier: null,
    active: 1, monthly_limit: tc.monthly_requests, monthly_used: 0, total_requests: 0,
    created_at: new Date().toISOString(), last_used_at: null, billing_period_start: new Date().toISOString() };
  db.byEmail[emailKey] = id;
  db.byPrefix[keyPrefix] = id;
  await saveDb(db);
  res.status(201).json({ id, email, tier: selectedTier, api_key: rawKey,
    monthly_limit: tc.monthly_requests, monthly_used: 0,
    features: { agent: tc.allows_agent, image_generation: tc.allows_image_gen, song_generation: tc.allows_song_gen, games_apps: tc.allows_games_apps },
    message: `${tc.name} API key ready!${tc.allows_agent ? ' Agent tools included!' : ''}` });
});

// ── Auth ───────────────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  const key = (req.headers['x-api-key'] || '').replace(/^Bearer\s+/i, '').trim();
  if (!key) return apiError(res, 401, 'Missing X-API-Key header', 'authentication_error');
  const db = await loadDb();
  const prefix = key.substring(0, 12);
  const id = db.byPrefix[prefix];
  if (!id) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  const record = db.keys[id];
  if (!record || !record.active) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  if (!await bcrypt.compare(key, record.key_hash)) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  const tc = TIERS[record.tier] || TIERS.free;
  const periodStart = new Date(record.billing_period_start);
  const now = new Date();
  if (now.getMonth() !== periodStart.getMonth() || now.getFullYear() !== periodStart.getFullYear()) {
    record.monthly_used = 0; record.monthly_limit = tc.monthly_requests; record.billing_period_start = now.toISOString();
  }
  if (record.monthly_used >= record.monthly_limit)
    return apiError(res, 429, `Monthly limit reached (${record.monthly_used}/${record.monthly_limit}). Upgrade at https://mrghostguy.github.io/niceguyapi/`, 'rate_limit',
      { limit: record.monthly_limit, used: record.monthly_used, upgrade_url: 'https://mrghostguy.github.io/niceguyapi/' });
  req.apiKey = { ...record, effective_tier: record.tier, effective_limit: record.monthly_limit, tier_config: tc };
  req._db = db;
  next();
}

// ── Models ─────────────────────────────────────────────────────────────────
const FREE_MODELS = [
  { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B' },
  { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron Super 120B' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron Nano 30B' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B' },
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B VL' },
  { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', name: 'Nemotron Omni 30B' },
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air' },
  { id: 'moonshotai/kimi-k2.6:free', name: 'Kimi K2.6' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B' },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Dolphin Mistral 24B' },
  { id: 'liquid/lfm-2.5-1.2b-thinking:free', name: 'LFM 2.5 Thinking' },
  { id: 'liquid/lfm-2.5-1.2b-instruct:free', name: 'LFM 2.5 Instruct' },
  { id: 'poolside/laguna-m.1:free', name: 'Laguna M.1' },
  { id: 'poolside/laguna-xs.2:free', name: 'Laguna XS.2' },
];
const PREMIUM_MODELS = [
  { id: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];

app.get('/v1/models', authenticate, (req, res) => {
  const models = req.apiKey.effective_tier === 'free' ? FREE_MODELS : [...FREE_MODELS, ...PREMIUM_MODELS];
  res.json({ object: 'list', data: models.map(m => ({ id: m.id, object: 'model', created: Date.now(), owned_by: 'niceguyapi' })) });
});

// ── Chat (normal passthrough) ──────────────────────────────────────────────
app.post('/v1/chat/completions', authenticate, async (req, res) => {
  const { messages, model, stream, agent } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return apiError(res, 400, 'Messages array is required', 'invalid_request');

  // If agent=true, route to agent runner
  if (agent === true || agent === 'true') {
    const tc = req.apiKey.tier_config;
    if (!tc.allows_agent) {
      return apiError(res, 403, 'Agent mode requires Pro or Premium. Upgrade at https://mrghostguy.github.io/niceguyapi/', 'tier_error',
        { upgrade_url: 'https://mrghostguy.github.io/niceguyapi/' });
    }
    return handleAgent(req, res);
  }

  const requestedModel = model || 'openai/gpt-oss-120b:free';
  const isFreeModel = requestedModel.includes(':free');
  if (!isFreeModel && req.apiKey.effective_tier === 'free')
    return apiError(res, 403, 'Premium models require Premium subscription. https://mrghostguy.github.io/niceguyapi/', 'tier_error');
  if (!OPENROUTER_KEY)
    return apiError(res, 503, 'AI service not configured.', 'service_unavailable');

  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://mrghostguy.github.io/niceguyapi/',
        'X-Title': 'NiceGuyAPI',
      },
      body: JSON.stringify({ model: requestedModel, messages, stream: false }),
    });
    if (!orRes.ok) {
      const errData = await orRes.json().catch(() => ({}));
      return res.status(orRes.status).json(errData);
    }
    const data = await orRes.json();
    // Update usage
    req.apiKey.monthly_used++;
    req.apiKey.total_requests++;
    req.apiKey.last_used_at = new Date().toISOString();
    const db = req._db;
    if (db) { db.keys[req.apiKey.id] = req.apiKey; await saveDb(db); }
    delete data.uuid; delete data.session;
    res.json(data);
  } catch (err) {
    apiError(res, 502, 'Upstream error: ' + err.message, 'upstream_error');
  }
});

// ── Agent Endpoint ─────────────────────────────────────────────────────────
// POST /v1/agent — explicit agent endpoint
// Also accessible via POST /v1/chat/completions with agent: true
async function handleAgent(req, res) {
  const { messages, model } = req.body;
  const requestedModel = model || 'openai/gpt-oss-120b:free';

  if (!OPENROUTER_KEY)
    return apiError(res, 503, 'AI service not configured.', 'service_unavailable');

  try {
    const result = await runAgent(messages, requestedModel, req.apiKey);

    if (result.error) {
      return res.status(result.status).json(JSON.parse(result.body));
    }

    // Update usage (1 agent call = 1 API request)
    req.apiKey.monthly_used++;
    req.apiKey.total_requests++;
    req.apiKey.last_used_at = new Date().toISOString();
    const db = req._db;
    if (db) { db.keys[req.apiKey.id] = req.apiKey; await saveDb(db); }

    res.json(result.data);
  } catch (err) {
    apiError(res, 502, 'Agent error: ' + err.message, 'agent_error');
  }
}

app.post('/v1/agent', authenticate, handleAgent);

// ── Usage ──────────────────────────────────────────────────────────────────
app.post('/v1/agent/reset', authenticate, async (req, res) => {
  const db = await loadDb();
  delete db.agent_history[req.apiKey.id];
  await saveDb(db);
  res.json({ message: 'Agent conversation history cleared.' });
});

app.get('/v1/usage', authenticate, (req, res) => {
  const k = req.apiKey;
  const tc = TIERS[k.effective_tier];
  const models = k.effective_tier === 'free' ? FREE_MODELS : [...FREE_MODELS, ...PREMIUM_MODELS];
  res.json({
    email: k.email, tier: k.effective_tier,
    monthly_limit: k.effective_limit, monthly_used: k.monthly_used,
    monthly_remaining: Math.max(0, k.effective_limit - k.monthly_used),
    total_requests: k.total_requests || 0,
    features: {
      agent: tc.allows_agent,
      agent_tools: tc.allows_agent ? ['web_search', 'web_fetch', 'calculate'] : [],
      image_generation: tc.allows_image_gen, song_generation: tc.allows_song_gen,
      games_apps: tc.allows_games_apps,
    },
    rate_limit: { per_minute: tc.rate_limit_per_minute, per_day: tc.rate_limit_per_day },
    available_models: models.length,
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => apiError(res, 404, `Route ${req.method} ${req.path} not found`, 'not_found'));

// ── Export ─────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  try { app(req, res); }
  catch (e) { console.error('[NiceGuyAPI] Error:', e); if (!res.headersSent) res.status(500).json({ error: { message: 'Internal server error', type: 'server_error' } }); }
};
