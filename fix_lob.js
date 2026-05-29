const fs = require('fs');
let code = fs.readFileSync('api/index.js', 'utf8');

// Fix: add agent tier check to handleAgent
const old = `async function handleAgent(req, res) {
  const { messages, model } = req.body;
  const requestedModel = model || 'openai/gpt-oss-120b:free';

  if (!OPENROUTER_KEY)
    return apiError(res, 503, 'AI service not configured.', 'service_unavailable');`;

const newCode = `async function handleAgent(req, res) {
  const { messages, model } = req.body;
  const requestedModel = model || 'openai/gpt-oss-120b:free';

  if (!req.apiKey.tier_config.allows_agent)
    return apiError(res, 403, 'Agent mode requires Pro or Premium. Upgrade at https://mrghostguy.github.io/niceguyapi/', 'tier_error',
      { upgrade_url: 'https://mrghostguy.github.io/niceguyapi/' });

  if (!OPENROUTER_KEY)
    return apiError(res, 503, 'AI service not configured.', 'service_unavailable');`;

if (code.includes(old)) {
  code = code.replace(old, newCode);
  fs.writeFileSync('api/index.js', code);
  console.log('✅ Fixed agent tier check');
} else {
  console.log('❌ Pattern not found');
  const idx = code.indexOf('async function handleAgent');
  if (idx >= 0) {
    console.log('Found at:', idx);
    console.log('Context:', code.substring(idx, idx + 300));
  }
}
