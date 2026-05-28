#!/usr/bin/env python3
"""Build the complete NiceGuyAPI landing page."""

# Read the existing CSS from the current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    existing = f.read()

# Extract CSS (everything through </style>)
style_end = existing.find('</style>')
if style_end == -1:
    print("ERROR: No </style> tag found")
    exit(1)

css = existing[:style_end + 8]
print(f"Extracted CSS: {len(css)} bytes")

# Now build the complete HTML
html = css + '''
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="#" class="nav-logo" onclick="showTab(\'home\'); return false;">\u26a1 NiceGuyAPI</a>
    <div class="nav-tabs">
      <button class="nav-tab active" id="tab-home" onclick="showTab(\'home\')">Home</button>
      <button class="nav-tab" id="tab-chat" onclick="showTab(\'chat\')"><span>\U0001f4ac </span>Try Chat</button>
      <button class="nav-tab" id="tab-guide" onclick="showTab(\'guide\')"><span>\U0001f4d6 </span>How-To</button>
      <button class="nav-tab" id="tab-faq" onclick="showTab(\'faq\')"><span>\u2753 </span>FAQ</button>
    </div>
    <a href="#signup" class="nav-cta" onclick="showTab(\'home\')">Get API Key</a>
  </div>
</nav>

<div class="container">

  <!-- HOME TAB -->
  <div class="tab-content active" id="content-home">

    <div class="hero">
      <div class="badge badge-green">\u25cf Live &amp; Ready</div>
      <h1>One API. Every AI Model.</h1>
      <p>Chat with DeepSeek, Claude, GPT-4o, Gemini and 17+ more through a single endpoint. Try it free \u2014 no credit card required.</p>
      <div style="margin-top:12px;"><span class="badge badge-amber">\U0001f525 Launch Sale \u2014 Up to 50% Off \u2014 Limited Time</span></div>
      <div class="hero-badges">
        <span class="model-pill free">DeepSeek</span>
        <span class="model-pill free">Llama 3.3</span>
        <span class="model-pill free">Qwen3</span>
        <span class="model-pill free">GPT-OSS</span>
        <span class="model-pill free">Gemma</span>
        <span class="model-pill premium">Claude Sonnet</span>
        <span class="model-pill premium">GPT-4o</span>
        <span class="model-pill premium">Gemini 2.0</span>
      </div>
    </div>

    <div class="signup-inline" id="signup">
      <h2>Get Your Free API Key</h2>
      <p class="sub">Start in seconds. No credit card required for free tier.</p>
      <div class="signup-row">
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email">
        <select id="plan">
          <option value="free">Free \u2014 14 req/mo \u2014 $0</option>
          <option value="pro">Pro \u2014 40 req/mo \u2014 $6/mo</option>
          <option value="premium">Premium \u2014 500 req/mo \u2014 $27/mo</option>
        </select>
        <button class="btn btn-primary" id="signup-btn" onclick="handleSignup()">Get Key</button>
      </div>
      <div class="signup-msg" id="signup-msg"></div>
      <div class="key-result" id="key-result">
        <label>Your API Key</label>
        <div class="key-val">
          <span id="api-key"></span>
          <button class="copy-btn" onclick="copyKey()">Copy</button>
        </div>
        <p class="next-steps">This key is saved to your browser. Check email for a backup link.</p>
        <p class="saved-note">Saved! Your key works immediately. Enjoy your free <span id="free-tier-req">14</span> requests this month.</p>
      </div>
    </div>

    <!-- TRY CHAT CTA -->
    <div class="chat-section" style="margin-top:-20px;margin-bottom:50px;text-align:center;">
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="showTab(\'chat\')" style="font-size:16px;padding:16px 36px;">\U0001f4ac Try the Free Chat \u2192</button>
        <button class="btn btn-primary" onclick="showTab(\'guide\')" style="background:rgba(255,255,255,0.06);color:#9ca3af;font-size:16px;padding:16px 36px;border:1px solid rgba(255,255,255,0.12);">\U0001f4d6 Setup Guide</button>
      </div>
      <p style="width:100%;margin-top:10px;font-size:13px;color:#6b7280;">No API key needed to try the chat. No credit card ever.</p>
    </div>

    <!-- USE CASES -->
    <div class="section">
      <h2>Who Is This For?</h2>
      <p class="sub">Whether you are a developer, creator, or just curious \u2014 there is something here for you.</p>
      <div class="usecases-grid">
        <div class="usecase-card">
          <div class="icon">\U0001f9e0</div>
          <h3>Chat Assistant</h3>
          <p>Ask questions, get explanations, brainstorm ideas, or just have a conversation. Like talking to a genius friend who never sleeps.</p>
          <span class="tier-tag free">\u2713 Free tier</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\u270d\ufe0f</div>
          <h3>Content Creator</h3>
          <p>Write blog posts, social media captions, emails, product descriptions, and more. Pick the AI that matches your voice best.</p>
          <span class="tier-tag free">\u2713 Free tier</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f4bb</div>
          <h3>Coding Assistant</h3>
          <p>Get help with code, debug errors, build apps, or learn programming. Premium tier unlocks Claude and GPT-4o \u2014 the best coding AIs.</p>
          <span class="tier-tag premium">\u2605 Premium tier</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f3a8</div>
          <h3>Image Generation</h3>
          <p>Create custom images, graphics, logos, or artwork. Just describe what you want and the AI generates it.</p>
          <span class="tier-tag free">\u2713 Pro &amp; Premium</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f3b5</div>
          <h3>Song Generation</h3>
          <p>Generate music, jingles, beats, or full songs. Perfect for content creators who need original audio.</p>
          <span class="tier-tag free">\u2713 Pro &amp; Premium</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f3d7\ufe0f</div>
          <h3>Build Apps &amp; Games</h3>
          <p>Create custom apps, games, and websites with AI assistance. Premium tier includes hosting so you can share them with the world.</p>
          <span class="tier-tag premium">\u2605 Premium only</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f50c</div>
          <h3>OpenClaw Integration</h3>
          <p>Use NiceGuyAPI as the AI backend for OpenClaw \u2014 a free, open-source AI assistant you control. Full setup guide included.</p>
          <span class="tier-tag free">\u2713 All tiers</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f52c</div>
          <h3>Research &amp; Learning</h3>
          <p>Explore any topic, get summaries of complex subjects, or study for exams. Access to multiple models means different perspectives.</p>
          <span class="tier-tag free">\u2713 Free tier</span>
        </div>
        <div class="usecase-card">
          <div class="icon">\U0001f4bc</div>
          <h3>Business Automation</h3>
          <p>Process data, generate reports, draft proposals, analyze feedback \u2014 automate repetitive knowledge work with a single API.</p>
          <span class="tier-tag premium">\u2605 Premium tier</span>
        </div>
      </div>
    </div>

    <!-- FEATURES -->
    <div class="section">
      <h2>Why NiceGuyAPI?</h2>
      <p class="sub">One key. One endpoint. Every AI model you will ever need.</p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">\U0001f511</div>
          <h3>One Key, All Models</h3>
          <p>No need to sign up for 5 different services. One API key gives you access to 17+ models from DeepSeek, Claude, GPT, Gemini and more.</p>
        </div>
        <div class="feature-card">
          <div class="icon">\U0001f50c</div>
          <h3>OpenAI Compatible</h3>
          <p>Drop-in replacement for OpenAI\'s API. If your code already uses OpenAI, switch to NiceGuyAPI by changing the base URL and key. Done.</p>
        </div>
        <div class="feature-card">
          <div class="icon">\U0001f193</div>
          <h3>Genuinely Free Tier</h3>
          <p>14 free requests per month \u2014 no credit card. Try everything, no risk. Enough to chat and see what the API can do.</p>
        </div>
        <div class="feature-card">
          <div class="icon">\U0001f4b0</div>
          <h3>Pricing That Makes Sense</h3>
          <p>Pro at $6/mo for 40 requests. Premium at $27/mo for 500 requests. The best value per request of any AI API gateway.</p>
        </div>
        <div class="feature-card">
          <div class="icon">\u26a1</div>
          <h3>Fast Responses</h3>
          <p>Powered by OpenRouter\'s global infrastructure. Low latency, high availability. Premium tier gets priority routing.</p>
        </div>
        <div class="feature-card">
          <div class="icon">\U0001f512</div>
          <h3>Secure by Default</h3>
          <p>API keys are bcrypt-hashed. HTTPS everywhere. Rate limiting protects your account. No data stored beyond usage counts.</p>
        </div>
      </div>
    </div>

    <!-- PRICING -->
    <div class="section" id="pricing">
      <h2>Simple, Honest Pricing</h2>
      <p class="sub">Start free. Upgrade only when you need more. Cancel anytime.</p>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Free</h3>
          <div class="tagline">Try it out \u2014 no commitment</div>
          <div class="price">$0<span>/mo</span></div>
          <ul>
            <li>14 requests per month</li>
            <li>5 free AI models</li>
            <li>Rate limit: 5 req/min</li>
            <li>Save chat history</li>
            <li>Perfect for trying it out</li>
          </ul>
          <div class="btn" style="width:100%;margin-top:8px;background:rgba(255,255,255,0.06);color:#9ca3af;border:1px solid rgba(255,255,255,0.12);">Current Plan</div>
        </div>
        <div class="pricing-card popular">
          <h3>Pro</h3>
          <span class="discount-badge">50% OFF LAUNCH SALE</span>
          <div class="tagline">For regular AI users</div>
          <div class="price"><span class="original">$12</span>$6<span>/mo</span></div>
          <ul>
            <li>40 requests per month</li>
            <li>17+ free AI models</li>
            <li>Rate limit: 20 req/min</li>
            <li>Image generation</li>
            <li>Song generation</li>
            <li>32K max tokens per request</li>
          </ul>
          <button class="btn btn-primary" style="width:100%;margin-top:8px;" onclick="document.getElementById(\'plan\').value=\'pro\';handleSignup()">Get Pro \u2014 $6/mo</button>
        </div>
        <div class="pricing-card premium-highlight">
          <h3>Premium</h3>
          <span class="discount-badge" style="background:rgba(251,191,36,0.15);color:#fbbf24;">45% OFF LAUNCH SALE</span>
          <div class="tagline">\u26a1 500 requests \u2014 for developers</div>
          <div class="price"><span class="original">$49</span>$27<span>/mo</span></div>
          <ul>
            <li>\U0001f525 500 requests per month</li>
            <li>ALL models including Claude, GPT-4o, Gemini</li>
            <li>Rate limit: 60 req/min</li>
            <li>Image + song generation</li>
            <li>App, game &amp; website creation</li>
            <li>Hosting included</li>
            <li>131K max tokens per request</li>
          </ul>
          <button class="btn btn-primary" style="width:100%;margin-top:8px;background:linear-gradient(135deg, #f59e0b, #d97706);" onclick="document.getElementById(\'plan\').value=\'premium\';handleSignup()">Get Premium \u2014 $27/mo</button>
        </div>
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <div class="section">
      <h2>How It Works</h2>
      <p class="sub">Three steps from zero to chatting with AI.</p>
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Get Your Key</h3>
          <p>Enter your email, pick a plan, and get an instant API key. No credit card for free tier.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Make a Request</h3>
          <p>Send one simple HTTP request. Pick any model \u2014 DeepSeek, Claude, GPT-4o, Gemini \u2014 they all work the same way.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>Get a Response</h3>
          <p>Get back a standard OpenAI-format response. Use it in OpenClaw, your app, your website \u2014 anywhere.</p>
        </div>
      </div>
    </div>

    <!-- CODE EXAMPLE -->
    <div class="section">
      <h2>See How Simple It Is</h2>
      <p class="sub">One request. Any model. Here is a cURL example:</p>
      <div class="code-block"><span class="c"># Ask anything to any AI model</span>
curl https://niceguyapi.onrender.com/v1/chat/completions <span class="k">\\</span>
  -H <span class="s">"Content-Type: application/json"</span> <span class="k">\\</span>
  -H <span class="s">"X-API-Key: nga_live_..."</span> <span class="k">\\</span>
  -d <span class="s">\'{
    "model": "deepseek/deepseek-v4-flash:free",
    "messages": [{"role": "user", "content": "Hello!"}]
  }\'</span>

<span class="c"># Works with Python too:</span>
<span class="k">import</span> requests
res = requests.post(
    <span class="s">"https://niceguyapi.onrender.com/v1/chat/completions"</span>,
    headers={<span class="s">"X-API-Key"</span>: <span class="s">"nga_live_..."</span>},
    json={<span class="s">"model"</span>: <span class="s">"anthropic/claude-sonnet-4-20250514"</span>,
          <span class="s">"messages"</span>: [{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"Hello!"}]}
)</div>
      <p style="text-align:center;margin-top:16px;"><a href="#" onclick="showTab(\'guide\');return false;" style="color:#818cf8;font-size:14px;">\U0001f4d6 Full setup guide with OpenClaw integration \u2192</a></p>
    </div>

    <!-- TRY CHAT SECTION -->
    <div class="section" style="text-align:center;">
      <h2>Try It Right Now</h2>
      <p class="sub">Chat with AI directly on this page. No signup needed.</p>
      <button class="btn btn-primary" onclick="showTab(\'chat\')" style="font-size:18px;padding:18px:40px;">\U0001f4ac Open Free Chat \u2192</button>
    </div>

  </div>
  <!-- END HOME TAB -->

  <!-- CHAT TAB -->
  <div class="tab-content" id="content-chat">
    <div class="chat-section" style="margin-top:20px;">
      <div class="chat-gate" id="chat-gate">
        <div class="badge badge-green" style="margin-bottom:12px;">\u25cf Live Demo</div>
        <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;color:#e8e8ec;">Try the AI Chat</h2>
        <p>Enter your email to get a temporary free key and start chatting. Your messages are linked to your account.</p>
        <div class="email-nudge" style="margin-top:16px;">
          <input type="email" id="chat-email" placeholder="you@example.com" autocomplete="email">
          <button class="btn btn-primary" id="chat-start-btn" onclick="startChat()">Start Chatting \u2192</button>
        </div>
        <div id="chat-gate-msg" style="margin-top:10px;font-size:13px;color:#6b7280;"></div>
      </div>
      <div class="chat-container" id="chat-container">
        <div class="chat-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="chat-title">AI Chat</span>
            <span class="chat-badge free" id="chat-tier-badge">Free</span>
            <span class="chat-meta" id="chat-usage">0/14</span>
          </div>
          <button class="chat-reset" onclick="resetChat()">Reset</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Ask anything..." autocomplete="off">
          <button class="btn btn-primary" id="chat-send-btn" onclick="sendChat()">Send</button>
        </div>
      </div>
    </div>
  </div>
  <!-- END CHAT TAB -->

  <!-- GUIDE TAB -->
  <div class="tab-content" id="content-guide">
    <div style="margin-top:20px;">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;color:#e8e8ec;">Getting Started Guide</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">Everything you need to start using NiceGuyAPI, even if you have never used an API before.</p>
      <div class="guide-grid">
        <div class="guide-card">
          <h3><span class="num">1</span>Get Your API Key (30 seconds)</h3>
          <p>Go to the <a href="#" onclick="showTab(\'home\');return false;" style="color:#818cf8;">Home tab</a> and enter your email. Select "Free" and click "Get Key." Your key will appear on screen and be saved to your browser.</p>
          <div class="tip">\U0001f4a1 Your key starts with <strong>nga_live_</strong> or <strong>nga_test_</strong>. Copy it and keep it safe \u2014 it is your password.</div>
        </div>
        <div class="guide-card">
          <h3><span class="num">2</span>Try It in Your Browser (1 minute \u2014 no code!)</h3>
          <p>You can test your API key right now without writing any code. Just paste this URL into your browser (replace YOUR_KEY with your key):</p>
          <div class="code-block" style="font-size:11px;">https://niceguyapi.onrender.com/v1/models?key=YOUR_KEY</div>
          <p>This will show you all the AI models available on your plan. If you see a list of models \u2014 your key works!</p>
          <div class="tip">\U0001f4a1 No code editor? No problem. You can use <strong>curl</strong> from any terminal, or use a free tool like <strong>ReqBin</strong> (reqbin.com) to test APIs from your browser.</div>
        </div>
        <div class="guide-card">
          <h3><span class="num">3</span>Use It with cURL (Terminal)</h3>
          <p>Open your computer\'s terminal (Command Prompt on Windows, Terminal on Mac/Linux) and paste this:</p>
          <div class="code-block">curl https://niceguyapi.onrender.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: nga_live_YOUR_KEY" \\
  -d \'{"model":"deepseek/deepseek-v4-flash:free","messages":[{"role":"user","content":"Say hello!"}]}\'</div>
          <p>You should get a JSON response with "Hello!" from the AI. If you do \u2014 everything is working perfectly.</p>
        </div>
        <div class="guide-card">
          <h3><span class="num">4</span>Use It with Python</h3>
          <p>Install Python from <a href="https://python.org" style="color:#818cf8;" target="_blank">python.org</a> if you do not have it. Then run:</p>
          <div class="code-block">pip install requests</div>
          <p>Then create a file called <strong>chat.py</strong> with this content:</p>
          <div class="code-block">import requests

API_KEY = "nga_live_YOUR_KEY"
BASE_URL = "https://niceguyapi.onrender.com"

while True:
    msg = input("You: ")
    if msg.lower() == "quit":
        break
    res = requests.post(f"{BASE_URL}/v1/chat/completions",
        headers={"X-API-Key": API_KEY},
        json={"model": "deepseek/deepseek-v4-flash:free",
              "messages": [{"role": "user", "content": msg}]})
    data = res.json()
    print("AI:", data["choices"][0]["message"]["content"])</div>
          <p>Run it with: <strong>python chat.py</strong></p>
        </div>
        <div class="guide-card">
          <h3><span class="num">5</span>Use It with OpenClaw (Advanced)</h3>
          <p>OpenClaw is a free, open-source AI assistant platform you self-host. NiceGuyAPI works as the AI model provider.</p>
          <p><strong>Step 1:</strong> Install OpenClaw from <a href="https://docs.openclaw.ai" style="color:#818cf8;" target="_blank">docs.openclaw.ai</a></p>
          <div class="code-block"># Install OpenClaw (requires Node.js)
npm install -g openclaw

# Set your NiceGuyAPI key as the model provider
openclaw config set model.baseUrl https://niceguyapi.onrender.com/v1
openclaw config set model.apiKey nga_live_YOUR_KEY
openclaw config set model.name deepseek/deepseek-v4-flash:free

# Start OpenClaw
openclaw start</div>
          <p><strong>Step 2:</strong> OpenClaw will now use NiceGuyAPI for all AI requests. You can change the model in the config to any model available on your tier.</p>
          <div class="tip">\U0001f4a1 Pro and Premium users can set the model to <strong>anthropic/claude-sonnet-4-20250514</strong> or <strong>openai/gpt-4o</strong> for the best experience.</div>
          <div class="warn">\u26a0\ufe0f Keep your API key secret. Never share it or post it publicly. If someone steals it, they use your request quota.</div>
        </div>
        <div class="guide-card">
          <h3><span class="num">6</span>Manage Your Usage</h3>
          <p>Check how many requests you have left:</p>
          <div class="code-block">curl https://niceguyapi.onrender.com/v1/usage \\
  -H "X-API-Key: nga_live_YOUR_KEY"</div>
          <p>This returns your current usage, monthly limit, tier info, and available models.</p>
        </div>
        <div class="guide-card">
          <h3><span class="num">7</span>Pick the Right Model</h3>
          <p>Different models are better at different tasks:</p>
          <div class="code-block">Free Tier Models (no credit card):
  \u2022 deepseek/deepseek-v4-flash:free \u2014 Best all-around
  \u2022 meta-llama/llama-3.3-70b-instruct:free \u2014 Great for reasoning
  \u2022 qwen/qwen3-coder:free \u2014 Best for coding

Premium Models (requires Premium plan):
  \u2022 anthropic/claude-sonnet-4-20250514 \u2014 Best overall AI
  \u2022 openai/gpt-4o \u2014 Great for creative tasks
  \u2022 google/gemini-2.0-flash \u2014 Fast and capable</div>
          <div class="tip">\U0001f4a1 Start with <strong>deepseek/deepseek-v4-flash:free</strong>. It is fast, smart, and free. Switch models if you need something specific.</div>
        </div>
      </div>
    </div>
  </div>
  <!-- END GUIDE TAB -->

  <!-- FAQ TAB -->
  <div class="tab-content" id="content-faq">
    <div style="margin-top:20px;">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;color:#e8e8ec;">Frequently Asked Questions</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">Everything you need to know before getting started.</p>
      <div class="faq-list">
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>What is NiceGuyAPI?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">NiceGuyAPI is an AI model gateway. It gives you one API key that works with 17+ AI models \u2014 including DeepSeek, Claude, GPT-4o, Gemini, and more. Instead of signing up for 5 different services and managing 5 different keys, you get one key that works everywhere.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>Do I need to know how to code?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">You need basic computer skills to use the API directly (we provide step-by-step instructions). But you can also use the <strong>Try Chat</strong> tab on this page to talk to AI without any coding at all. Just enter your email and start chatting.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>What does "14 requests per month" mean?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">Each time you send a message to the AI, that is one request. The free plan gives you 14 messages per month. This is enough to try everything and see if NiceGuyAPI is right for you. For more, Pro gives 40 requests and Premium gives 500 per month.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>Why does Premium have 500 requests?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">Premium is built for developers and power users who integrate the API into apps, tools, and workflows. At 500 requests per month for $27, you get outstanding value \u2014 plus access to Claude, GPT-4o, Gemini, and our creation tools (images, songs, apps, games, and hosting).</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>What is OpenClaw and how do I use it?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">OpenClaw is a free, open-source AI assistant platform. You install it on your computer and it connects to AI models \u2014 like NiceGuyAPI. Think of it as your personal AI assistant that you fully control. Our <a href="#" onclick="showTab(\'guide\');return false;" style="color:#818cf8;">setup guide</a> walks you through the entire process step by step.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>Can I change plans later?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">Yes! Upgrade or downgrade anytime. When you upgrade, your new request limit kicks in immediately. Payments are handled securely through Stripe.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>What happens when I run out of requests?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">You will get a friendly error message when you hit your limit. You can either wait until your next billing cycle (resets on the 1st of each month), or upgrade to a higher tier. Free users can also buy pay-as-you-go refills.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>What payment methods do you accept?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">We accept all major credit and debit cards through Stripe. Payments are secure and automatic \u2014 cancel anytime with no penalties.</div>
        </div>
        <div class="faq-item">
          <div class="faq-q" onclick="toggleFaq(this)"><span>Can I get a refund?</span><span class="arrow">\u25bc</span></div>
          <div class="faq-a">Since the free tier gives you full access to test the service, there are no refunds. But you can cancel anytime and will not be charged again.</div>
        </div>
      </div>
    </div>
  </div>
  <!-- END FAQ TAB -->

</div>

<footer>
  <p>\u26a1 NiceGuyAPI v3.5 \u2014 One API for Every AI Model</p>
  <p style="margin-top:4px;">Powered by <a href="https://openrouter.ai" target="_blank">OpenRouter</a> | <a href="https://github.com/MrGhostGuy/stax-agent/tree/master/niceguyapi" target="_blank">GitHub</a></p>
</footer>

<script>
var API_BASE = \'https://niceguyapi.onrender.com\';

function showTab(name) {
  [\'home\',\'chat\',\'guide\',\'faq\'].forEach(function(t){
    var c = document.getElementById(\'content-\'+t);
    var b = document.getElementById(\'tab-\'+t);
    if(c) c.className = \'tab-content\' + (t===name?\' active\':\'\');
    if(b) b.className = \'nav-tab\' + (t===name?\' active\':\'\');
  });
  window.scrollTo({top:0,behavior:\'smooth\'});
}

function toggleFaq(el) {
  var arrow = el.querySelector(\'.arrow\');
  var ans = el.nextElementSibling;
  var isOpen = ans.classList.contains(\'open\');
  document.querySelectorAll(\'.faq-a\').forEach(function(a){a.classList.remove(\'open\');});
  document.querySelectorAll(\'.faq-q .arrow\').forEach(function(a){a.classList.remove(\'open\');});
  if(!isOpen){ans.classList.add(\'open\');arrow.classList.add(\'open\');}
}

async function handleSignup() {
  var email = document.getElementById(\'email\').value.trim();
  var plan = document.getElementById(\'plan\').value;
  var msg = document.getElementById(\'signup-msg\');
  var btn = document.getElementById(\'signup-btn\');
  if(!email || !email.includes(\'@\')){msg.innerHTML=\'<span class="error">Please enter a valid email.</span>\';return;}
  btn.disabled=true;btn.textContent=\'Creating key...\';msg.innerHTML=\'\';
  try{
    var res = await fetch(API_BASE+\'/v1/signup\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({email:email,tier:plan})});
    var data = await res.json();
    if(res.ok && data.api_key){
      localStorage.setItem(\'niceguyapi_key\',data.api_key);
      localStorage.setItem(\'niceguyapi_email\',email);
      localStorage.setItem(\'niceguyapi_tier\',data.tier||plan);
      document.getElementById(\'api-key\').textContent=data.api_key;
      document.getElementById(\'key-result\').style.display=\'block\';
      var tr={free:\'14\',pro:\'40\',premium:\'500\'};
      document.getElementById(\'free-tier-req\').textContent=tr[plan]||\'14\';
      msg.innerHTML=\'<span class="success">Your key is ready! Save it above.</span>\';
      if(plan!==\'free\' && data.stripe_url){window.location.href=data.stripe_url;}
    }else{
      msg.innerHTML=\'<span class="error">\'+(data.error?.message||\'Something went wrong. Try again.\')+\'</span>\';
    }
  }catch(err){
    msg.innerHTML=\'<span class="error">Connection error. Server may be waking up. Try again in 30 seconds.</span>\';
  }
  btn.disabled=false;btn.textContent=\'Get Key\';
}

function copyKey(){
  var key=document.getElementById(\'api-key\').textContent;
  navigator.clipboard.writeText(key).then(function(){
    var btn=document.querySelector(\'.key-result .copy-btn\');
    btn.textContent=\'Copied!\';setTimeout(function(){btn.textContent=\'Copy\';},2000);
  });
}

var chatKey=null,chatTier=\'Free\',chatUsage={used:0,total:14};

async function startChat(){
  var email=document.getElementById(\'chat-email\').value.trim();
  var gateMsg=document.getElementById(\'chat-gate-msg\');
  var btn=document.getElementById(\'chat-start-btn\');
  if(!email||!email.includes(\'@\')){gateMsg.innerHTML=\'Please enter a valid email.\';return;}
  btn.disabled=true;btn.textContent=\'Setting up...\';gateMsg.innerHTML=\'\';
  try{
    var res=await fetch(API_BASE+\'/v1/signup\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({email:email,tier:\'free\'})});
    var data=await res.json();
    if(res.ok&&data.api_key){
      chatKey=data.api_key;chatTier=data.tier||\'Free\';chatUsage={used:0,total:14};
      localStorage.setItem(\'niceguyapi_chat\',JSON.stringify({key:chatKey,email:email,tier:chatTier,used:0}));
      showChatUI();
    }else{
      gateMsg.innerHTML=(data.error?.message||\'Something went wrong. Try again.\')+\'<br><small>If you signed up already, check your email for your API key.</small>\';
    }
  }catch(err){gateMsg.innerHTML=\'Connection error. Server may be waking up. Try again in 30 seconds.\';}
  btn.disabled=false;btn.textContent=\'Start Chatting \u2192\';
}

function showChatUI(){
  document.getElementById(\'chat-gate\').style.display=\'none\';
  document.getElementById(\'chat-container\').style.display=\'block\';
  var badge=document.getElementById(\'chat-tier-badge\');
  badge.textContent=chatTier;
  badge.className=\'chat-badge \'+(chatTier===\'Premium\'?\'premium\':chatTier===\'Pro\'?\'pro\':\'free\');
  updateChatUsage();
  document.getElementById(\'chat-messages\').innerHTML=\'\';
  addMessage(\'assistant\',\'Hi! I am your AI assistant powered by NiceGuyAPI. Ask me anything! Your messages count toward your free tier limit (\'+chatUsage.total+\' req/mo).\');
}

function updateChatUsage(){
  document.getElementById(\'chat-usage\').textContent=chatUsage.used+\'/\'+chatUsage.total+\' requests used\';
}

function resetChat(){
  localStorage.removeItem(\'niceguyapi_chat\');
  chatKey=null;chatTier=\'Free\';chatUsage={used:0,total:14};
  document.getElementById(\'chat-gate\').style.display=\'block\';
  document.getElementById(\'chat-container\').style.display=\'none\';
  document.getElementById(\'chat-email\').value=\'\';
  document.getElementById(\'chat-gate-msg\').innerHTML=\'\';
  document.getElementById(\'chat-start-btn\').disabled=false;
  document.getElementById(\'chat-start-btn\').textContent=\'Start Chatting \u2192\';
}

function addMessage(role,text){
  var container=document.getElementById(\'chat-messages\');
  var div=document.createElement(\'div\');
  div.className=\'chat-msg \'+role;
  var avatar=role===\'user\'?\'\U0001f464\':\'\U0001f916\';
  div.innerHTML=\'<div class="avatar">\'+avatar+\'</div><div class="bubble">\'+text.replace(/\\n/g,\'<br>\')+\'</div>\';
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
}

async function sendChat(){
  var input=document.getElementById(\'chat-input\');
  var btn=document.getElementById(\'chat-send-btn\');
  var text=input.value.trim();
  if(!text||!chatKey)return;
  addMessage(\'user\',text);input.value=\'\';btn.disabled=true;btn.textContent=\'...\';
  var container=document.getElementById(\'chat-messages\');
  var typing=document.createElement(\'div\');
  typing.className=\'chat-msg assistant\';typing.id=\'typing-indicator\';
  typing.innerHTML=\'<div class="avatar">\U0001f916</div><div class="bubble typing">Thinking...</div>\';
  container.appendChild(typing);container.scrollTop=container.scrollHeight;
  try{
    var res=await fetch(API_BASE+\'/v1/chat/completions\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\',\'X-API-Key\':chatKey},body:JSON.stringify({model:\'deepseek/deepseek-v4-flash:free\',messages:[{role:\'user\',content:text}]})});
    typing.remove();
    if(res.status===429){addMessage(\'assistant\',\'\u26a0\ufe0f You have hit your monthly request limit! Upgrade to Pro (40 req/mo) or Premium (500 req/mo) for more.\');return;}
    var data=await res.json();
    var reply=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||(data.error&&data.error.message)||\'Sorry, something went wrong. Try again.\';
    addMessage(\'assistant\',reply);
    chatUsage.used++;updateChatUsage();
    var saved=localStorage.getItem(\'niceguyapi_chat\');
    if(saved){var obj=JSON.parse(saved);obj.used=chatUsage.used;localStorage.setItem(\'niceguyapi_chat\',JSON.stringify(obj));}
  }catch(err){typing.remove();addMessage(\'assistant\',\'Connection error. The server may be waking up. Try again in a moment.\');}
  btn.disabled=false;btn.textContent=\'Send\';input.focus();
}

(function(){
  var saved=localStorage.getItem(\'niceguyapi_chat\');
  if(saved){try{var obj=JSON.parse(saved);if(obj.key){chatKey=obj.key;chatTier=obj.tier||\'Free\';chatUsage.used=obj.used||0;showChatUI();}}catch(e){}}
})();

if(window.location.hash===\'#success\'){
  document.getElementById(\'signup\').style.display=\'none\';
  var sb=document.getElementById(\'success-box\');if(sb)sb.style.display=\'block\';
  document.getElementById(\'signup-msg\').innerHTML=\'<span class="success">\U0001f389 Payment successful! Your account has been upgraded.</span>\';
}

document.getElementById(\'email\').addEventListener(\'keydown\',function(e){if(e.key===\'Enter\')handleSignup();});
var ce=document.getElementById(\'chat-email\');if(ce)ce.addEventListener(\'keydown\',function(e){if(e.key===\'Enter\')startChat();});
var ci=document.getElementById(\'chat-input\');if(ci)ci.addEventListener(\'keydown\',function(e){if(e.key===\'Enter\')sendChat();});
</script>
</body>
</html>'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written {len(html)} bytes to index.html")
