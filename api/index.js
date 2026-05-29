/**
 * NiceGuyAPI v3.5 — AI Model Gateway (Vercel Serverless)
 * OpenAI-compatible chat completions via OpenRouter.
 * One API key for 17+ AI models.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ADMIN_SECRET = process.env.NICEGUYAPI_SECRET || 'niceguy-dev-secret';

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (e) { console.warn('[NiceGuyAPI] Stripe not available'); }
}

// ── Tier Configuration ────────────────────────────────────────────────────

const TIERS = {
  free:  { name: 'Free',  price: 0,  monthly_requests: 14,  rate_limit_per_minute: 5,  rate_limit_per_day: 10,  max_tokens_per_request: 4096,  allows_games_apps: false, allows_image_gen: false, allows_song_gen: false },
  pro:   { name: 'Pro',   price: 6,  monthly_requests: 40,  rate_limit_per_minute: 20, rate_limit_per_day: 200, max_tokens_per_request: 32768, allows_games_apps: false, allows_image_gen: true,  allows_song_gen: true },
  premium: { name: 'Premium', price: 27, monthly_requests: 500, rate_limit_per_minute: 60, rate_limit_per_day: 1000, max_tokens_per_request: 131072, allows_games_apps: true, allows_image_gen: true, allows_song_gen: true },
};

function apiError(res, status, message, type, extra = {}) {
  return res.status(status).json({ error: { message, type, ...extra } });
}

// ── In-Memory Database ────────────────────────────────────────────────────
// Note: Vercel serverless is stateless. For production, use a persistent DB.
// This in-memory store works for testing and low-traffic usage.

const db = {
  keys: new Map(),      // id -> key record
  byEmail: new Map(),   // email+tier -> id
  byPrefix: new Map(),  // prefix -> id
  billing: new Map(),   // stripe_session_id -> billing record
};

function dbInit() {
  // Seed an admin key if needed
  if (!db.byPrefix.has('nga_live_ad')) {
    const adminKey = 'nga_live_admin_' + crypto.randomBytes(16).toString('hex');
    const id = uuidv4();
    db.keys.set(id, {
      id, key_hash: null, key_prefix: 'nga_live_ad',
      email: 'admin@niceguyapi', tier: 'premium', pending_tier: null,
      active: 1, monthly_limit: 999999, monthly_used: 0, total_requests: 0,
      created_at: new Date().toISOString(), last_used_at: null, billing_period_start: new Date().toISOString(),
      _raw_key: adminKey,
    });
    db.byPrefix.set('nga_live_ad', id);
    console.log('[NiceGuyAPI] Admin key:', adminKey);
  }
}

dbInit();

// ── App Setup ──────────────────────────────────────────────────────────────

const app = express();

app.post('/v1/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && stripe) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) { return res.status(400).json({ error: 'Webhook verification failed' }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const billing = db.billing.get(session.id);
    if (billing && billing.status === 'pending') {
      const keyRec = db.keys.get(billing.api_key_id);
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
      }
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

// ── Health Check ───────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '3.5.0', timestamp: new Date().toISOString() });
});

// ── Root Docs ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    name: 'NiceGuyAPI', version: '3.5.0',
    description: 'One API for every AI provider. OpenAI-compatible.',
    base_url: '/v1',
    pricing: { free: '$0/mo — 14 requests', pro: '$6/mo — 40 requests', premium: '$27/mo — 500 requests' },
    endpoints: {
      'GET /health': 'Health check', 'POST /v1/signup': 'Create account',
      'GET /v1/models': 'List models', 'POST /v1/chat/completions': 'Chat',
      'GET /v1/usage': 'Usage stats', 'POST /v1/stripe/webhook': 'Stripe',
    },
    auth: 'X-API-Key header on all /v1 requests (except signup)',
  });
});

// ── Signup ────────────────────────────────────────────────────────────────

app.post('/v1/signup', signupLimiter, async (req, res) => {
  const { email, tier } = req.body;
  if (!email || !email.includes('@')) return apiError(res, 400, 'Valid email required', 'invalid_request');
  const selectedTier = TIERS[tier] ? tier : 'free';
  const emailKey = email + ':' + selectedTier;
  if (db.byEmail.has(emailKey)) {
    return apiError(res, 409, 'Account already exists. Use your existing API key.', 'duplicate_account');
  }
  const id = uuidv4();
  const rawKey = 'nga_live_' + crypto.randomBytes(24).toString('hex');
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.substring(0, 12);
  const tc = TIERS[selectedTier];
  const record = {
    id, key_hash: keyHash, key_prefix: keyPrefix,
    email, tier: selectedTier, pending_tier: null,
    active: 1, monthly_limit: tc.monthly_requests, monthly_used: 0, total_requests: 0,
    created_at: new Date().toISOString(), last_used_at: null,
    billing_period_start: new Date().toISOString(),
  };
  db.keys.set(id, record);
  db.byEmail.set(emailKey, id);
  db.byPrefix.set(keyPrefix, id);

  res.status(201).json({
    id, email, tier: selectedTier, api_key: rawKey,
    monthly_limit: tc.monthly_requests, monthly_used: 0,
    message: `${tc.name} API key ready! Use it immediately.`,
  });
});

// ── Auth Middleware ───────────────────────────────────────────────────────

async function authenticate(req, res, next) {
  const key = (req.headers['x-api-key'] || '').replace(/^Bearer\s+/i, '').trim();
  if (!key) return apiError(res, 401, 'Missing X-API-Key header', 'authentication_error');
  const prefix = key.substring(0, 12);
  const id = db.byPrefix.get(prefix);
  if (!id) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  const record = db.keys.get(id);
  if (!record || !record.active) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  if (record._raw_key) {
    if (key !== record._raw_key) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  } else {
    if (!await bcrypt.compare(key, record.key_hash)) return apiError(res, 401, 'Invalid API key', 'authentication_error');
  }
  const tc = TIERS[record.tier] || TIERS.free;
  const periodStart = new Date(record.billing_period_start);
  const now = new Date();
  if (now.getMonth() !== periodStart.getMonth() || now.getFullYear() !== periodStart.getFullYear()) {
    record.monthly_used = 0;
    record.monthly_limit = tc.monthly_requests;
    record.billing_period_start = now.toISOString();
  }
  if (record.monthly_used >= record.monthly_limit) {
    return apiError(res, 429, `Monthly limit reached (${record.monthly_used}/${record.monthly_limit}). Upgrade at https://mrghostguy.github.io/niceguyapi/`, 'rate_limit',
      { limit: record.monthly_limit, used: record.monthly_used, upgrade_url: 'https://mrghostguy.github.io/niceguyapi/' });
  }
  req.apiKey = { ...record, effective_tier: record.tier, effective_limit: record.monthly_limit, tier_config: tc };
  next();
}

// ── Models ────────────────────────────────────────────────────────────────

const FREE_MODELS = [
  { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B' },
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

// ── Chat Completions ──────────────────────────────────────────────────────

app.post('/v1/chat/completions', authenticate, async (req, res) => {
  const { messages, model } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return apiError(res, 400, 'Messages array is required', 'invalid_request');
  const requestedModel = model || 'deepseek/deepseek-v4-flash:free';
  const isFreeModel = requestedModel.includes(':free');
  if (!isFreeModel && req.apiKey.effective_tier === 'free')
    return apiError(res, 403, 'Premium models require Premium subscription. https://mrghostguy.github.io/niceguyapi/', 'tier_error');
  if (!process.env.OPENROUTER_API_KEY)
    return apiError(res, 503, 'AI service not configured. Set OPENROUTER_API_KEY.', 'service_unavailable');

  const startTime = Date.now();
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mrghostguy.github.io/niceguyapi/',
        'X-Title': 'NiceGuyAPI',
      },
      body: JSON.stringify({ model: requestedModel, messages }),
    });
    if (!orRes.ok) {
      const errData = await orRes.json().catch(() => ({}));
      return res.status(orRes.status).json(errData);
    }
    const data = await orRes.json();
    const latency = Date.now() - startTime;
    req.apiKey.monthly_used++;
    req.apiKey.total_requests++;
    req.apiKey.last_used_at = new Date().toISOString();
    delete data.uuid;
    delete data.session;
    res.json(data);
  } catch (err) {
    apiError(res, 502, 'Upstream error: ' + err.message, 'upstream_error');
  }
});

// ── Usage ─────────────────────────────────────────────────────────────────

app.get('/v1/usage', authenticate, (req, res) => {
  const k = req.apiKey;
  const tc = TIERS[k.effective_tier];
  const models = k.effective_tier === 'free' ? FREE_MODELS : [...FREE_MODELS, ...PREMIUM_MODELS];
  res.json({
    email: k.email, tier: k.effective_tier,
    monthly_limit: k.effective_limit, monthly_used: k.monthly_used,
    monthly_remaining: Math.max(0, k.effective_limit - k.monthly_used),
    total_requests: k.total_requests || 0,
    features: { image_generation: tc.allows_image_gen, song_generation: tc.allows_song_gen, games_apps: tc.allows_games_apps },
    rate_limit: { per_minute: tc.rate_limit_per_minute, per_day: tc.rate_limit_per_day },
    available_models: models.length,
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────

app.use((req, res) => apiError(res, 404, `Route ${req.method} ${req.path} not found`, 'not_found'));

// ── Export ────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  try {
    app(req, res);
  } catch (e) {
    console.error('[NiceGuyAPI] Handler error:', e);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Internal server error', type: 'server_error' } });
    }
  }
};

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`NiceGuyAPI running on :${PORT}`));
}
