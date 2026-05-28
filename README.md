# NiceGuyAPI — One API for Every AI Model

Access 17+ AI models through a single OpenAI-compatible endpoint. DeepSeek, Claude, GPT-4o, Gemini and more.

## Quick Start

```bash
export OPENAI_API_KEY="gsk_live_xxx"
export OPENAI_BASE_URL="https://niceguyapi.onrender.com/v1"

# That's it — use any OpenAI SDK
```

## Pricing

| Plan | Price | Requests | Models |
|------|-------|----------|--------|
| Free | $0/mo | 14/mo | 5 free models |
| Pro | $6/mo | 40/mo | All 17+ free models; image + song generation |
| Premium | $27/mo | 500/mo | All models including Claude, GPT-4o, Gemini; game + app + website creation + hosting |

## API

- `POST /v1/signup` — Create account, get API key
- `GET /v1/models` — List available models
- `POST /v1/chat/completions` — Chat with any model (OpenAI-compatible)
- `GET /v1/usage` — Check usage and limits
- `POST /v1/keys/rotate` — Regenerate your API key

## Self-Hosting

```bash
cd server
npm install
npm start
```

Environment variables:
- `PORT` — server port (default 3000)
- `NICEGUYAPI_SECRET` — admin secret
- `OPENROUTER_API_KEY` — OpenRouter API key
- `STRIPE_SECRET_KEY` — Stripe secret key (optional, for payments)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret (optional)
