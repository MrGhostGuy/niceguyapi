# NiceGuyAPI — One API for Every AI Model

Access **23+ AI models** through a single OpenAI-compatible endpoint. DeepSeek, Claude, GPT-4o, Gemini, Llama, Qwen3 and more.

**Live production URL:** `https://niceguyapi-repo.vercel.app/v1`

## Quick Start

```bash
# cURL — works with any model, any language
curl https://niceguyapi-repo.vercel.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: nga_live_..." \
  -d '{
    "model": "deepseek/deepseek-v3-0324:free",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Python
import requests
res = requests.post(
  "https://niceguyapi-repo.vercel.app/v1/chat/completions",
  headers={"X-API-Key": "nga_live_..."},
  json={"model": "anthropic/claude-sonnet-4-20250514",
        "messages": [{"role": "user", "content": "Hello!"}]}
)
```

Drop-in replacement for OpenAI — just change the base URL and key.

## 🔥 Launch Sale — Up to 50% Off

| Plan | Price | Requests | Context | Rate Limit | Features |
|------|-------|----------|---------|------------|----------|
| **Hobbyist** | $0/mo | 100/mo | 75K tokens | 5 req/min | 23+ free models, chat history |
| **Builder** | ~~$18~~ **$9**/mo | 500/mo | 145K tokens | 20 req/min | All free models, image gen, song gen, AI Agent (web search + fetch), 6-turn memory |
| **Developer** | ~~$59~~ **$29**/mo | 2,500/mo | 315K tokens | 60 req/min | ALL models (Claude, GPT-4o, Gemini), full Agent with calculator, app/game/website creation, hosting, priority routing |
| **Studio** | ~~$159~~ **$79**/mo | 10,000/mo | 750K tokens | 120 req/min | Everything in Dev + custom agents (999), massive agent memory, priority support |

No credit card needed for Hobbyist. Cancel anytime.

## What You Get

- **23+ AI models** — DeepSeek V3, Claude Sonnet, GPT-4o, Gemini 2.0, Llama 3.3, Qwen3, Gemma, + 16 more
- **Built-in AI Agent** — Agent mode with web search, web fetch, and calculator tools. The AI autonomously plans and executes multi-step tasks *(Builder tier+)*
- **Image Generation** — Create custom images, graphics, logos *(Builder tier+)*
- **Song / Audio Generation** — Generate music, jingles, beats *(Builder tier+)*
- **App, Game & Website Creation** — Build and host with AI assistance *(Developer tier+)*
- **OpenClaw Integration** — Use as the AI backend for OpenClaw, a free open-source personal AI assistant
- **Conversation Memory** — Remembers up to 6 turns per API key
- **OpenAI Compatible** — Same response format as OpenAI. Switch by changing one line of code

## API

| Endpoint | Description |
|----------|-------------|
| `POST /v1/signup` | Create account, get instant API key |
| `GET /v1/models` | List all available models with pricing info |
| `POST /v1/chat/completions` | Chat with any model (OpenAI-compatible) |
| `POST /v1/chat/agent` | Agent mode — multi-step task execution (Builder+) |
| `GET /v1/usage` | Check usage, limits, and remaining requests |
| `POST /v1/keys/rotate` | Regenerate your API key |
| `POST /v1/stripe/webhook` | Stripe webhook for automatic tier management |

### Authentication

All requests require your API key in the `X-API-Key` header:

```
X-API-Key: nga_live_your_key_here
```

## Who Is This For?

- **Developers** — Ship AI features without managing 5 different API keys
- **OpenClaw Users** — Best-in-class AI backend for your personal assistant
- **Content Creators** — Write, generate images, create music through one API
- **Indie Hackers** — Start free (100 req/mo), scale when you need more
- **Businesses** — Process data, automate workflows, analyze feedback

## Why Not Just Use OpenAI Directly?

| | OpenAI Direct | Anthropic Direct | ⚡ NiceGuyAPI |
|---|---|---|---|
| API Keys to Manage | 1 | 1 | **1 (all models)** |
| Models Available | GPT only | Claude only | **23+ models** |
| Free Tier | ✗ Limited | ✗ None | **100 req/mo, no CC** |
| Agent Mode | ✗ Extra cost | ✗ Extra cost | **Included Builder+** |
| Context Window | 128K | 200K | **Up to 750K** |
| Switch Models in Code | Different SDK | Different SDK | **Change one string** |

## Self-Hosting

```bash
git clone https://github.com/MrGhostGuy/niceguyapi.git
cd niceguyapi
npm install
npm start
```

Environment variables:
- `PORT` — server port (default 3000)
- `NICEGUYAPI_SECRET` — admin secret for key management
- `OPENROUTER_API_KEY` — OpenRouter API key (get one free at openrouter.ai)
- `STRIPE_SECRET_KEY` — Stripe secret key (optional, for paid tiers)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret (optional)

## Tech Stack

- **Runtime:** Vercel serverless (Node.js / Express)
- **Storage:** JSONBlob serverless storage
- **Payments:** Stripe (live mode, webhook-driven tier management)
- **Models:** 23+ via OpenRouter

## Links

- 🌐 **Website:** [niceguyapi.com](https://mrghostguy.github.io/niceguyapi/)
- 📖 **Full Docs:** [How-To page](https://mrghostguy.github.io/niceguyapi/#howto)
- 💰 **Dashboard:** [Dashboard](https://mrghostguy.github.io/niceguyapi/#dashboard)
- 📧 **Email:** niceguyapi@proton.me

## License

MIT © [MrGhostGuy](https://github.com/MrGhostGuy)
