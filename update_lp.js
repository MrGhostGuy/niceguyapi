const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// Version updates
h = h.replace(/NiceGuyAPI v4\.0/g, 'NiceGuyAPI v5.0');
h = h.replace(/v4\.0/g, 'v5.0');

// Add Dashboard tab to nav (after FAQ tab, before the closing </div>)
h = h.replace(
  '<button class="nav-tab" id="tab-faq" onclick="showTab(\'faq\')"><span>❓ </span>FAQ</button>\n    </div>',
  '<button class="nav-tab" id="tab-faq" onclick="showTab(\'faq\')"><span>❓ </span>FAQ</button>\n      <button class="nav-tab" id="tab-dash" onclick="showTab(\'dash\')"><span>📊 </span>Dashboard</button>\n    </div>'
);

// Update description meta
h = h.replace(
  'content="Access 17+ AI models through a single API. Chat with DeepSeek, Claude, GPT-4o, Gemini and more. Try it free — no credit card needed."',
  'content="Access 23+ AI models through a single API. Autonomous AI Agent with web search, fetch, calculator. Stripe billing, key management. Try free."'
);

// Add Dashboard tab content before the closing </div> of container
const dashboardHTML = `
  <!-- DASHBOARD TAB -->
  <div class="tab-content" id="content-dash">
    <div style="margin-top:20px;">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;color:#e8e8ec;">Subscriber Dashboard</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">Enter your API key to view usage, manage keys, and access your account.</p>

      <!-- Key Input Gate -->
      <div id="dash-gate" style="max-width:500px;margin:0 auto 32px;text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(99,102,241,0.25);border-radius:16px;padding:32px;">
        <div class="badge badge-green" style="margin-bottom:12px;">🔑 Access Your Account</div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#e8e8ec;">Enter Your API Key</h3>
        <p style="color:#6b7280;font-size:13px;margin-bottom:16px;">Paste your NiceGuyAPI key below. Keys start with <code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;color:#818cf8;">nga_live_</code></p>
        <input type="text" id="dash-key-input" placeholder="nga_live_..." style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#e8e8ec;font-size:14px;font-family:monospace;outline:none;margin-bottom:12px;" autocomplete="off">
        <button class="btn btn-primary" onclick="dashLogin()" style="width:100%;">Access Dashboard →</button>
        <div id="dash-login-msg" style="margin-top:10px;font-size:13px;"></div>
      </div>

      <!-- Dashboard Content (hidden until logged in) -->
      <div id="dash-content" style="display:none;">
        <!-- Usage Card -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:24px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div>
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Current Tier</div>
              <div style="font-size:20px;font-weight:700;color:#e8e8ec;margin-top:4px;" id="dash-tier">—</div>
            </div>
            <div id="dash-tier-badge" style="padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">—</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#e8e8ec;" id="dash-used">—</div>
              <div style="font-size:12px;color:#6b7280;">Used</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#34d399;" id="dash-remaining">—</div>
              <div style="font-size:12px;color:#6b7280;">Remaining</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#a78bfa;" id="dash-total">—</div>
              <div style="font-size:12px;color:#6b7280;">Total Limit</div>
            </div>
          </div>
          <div style="margin-top:16px;background:rgba(255,255,255,0.05);border-radius:8px;height:8px;overflow:hidden;">
            <div id="dash-bar" style="height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;transition:width 0.5s;width:0%"></div>
          </div>
          <div id="dash-features" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;"></div>
        </div>

        <!-- Key Management -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:700;color:#e8e8ec;">🗝️ Your Keys</h3>
            <button class="btn btn-primary" onclick="dashCreateKey()" style="padding:8px 16px;font-size:13px;">+ New Key</button>
          </div>
          <div id="dash-keys-list" style="display:grid;gap:8px;"></div>
        </div>

        <!-- Agent Memory Reset -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <h3 style="font-size:16px;font-weight:700;color:#e8e8ec;">🤖 Agent Memory</h3>
              <p style="font-size:13px;color:#6b7280;margin-top:4px;">Clear your agent conversation history to start fresh.</p>
            </div>
            <button onclick="dashResetAgent()" style="padding:8px 16px;font-size:13px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25);border-radius:8px;cursor:pointer;font-weight:600;">Clear History</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END DASHBOARD TAB -->
`;

h = h.replace('</div>\n\n<footer>', dashboardHTML + '\n</div>\n\n<footer>');

// Update footer
h = h.replace(
  '<p>⚡ NiceGuyAPI v4.0 — One API for Every AI Model + Autonomous Agent</p>',
  '<p>⚡ NiceGuyAPI v5.0 — AI Agent Gateway with Stripe & Key Management</p>'
);

// Update dashboard link in API_BASE section (keep existing but ensure it points to Vercel)
h = h.replace("var API_BASE = 'https://niceguyapi-repo.vercel.app';", "var API_BASE = 'https://niceguyapi-repo.vercel.app';");

// Add dashboard JS functions before the closing </script>
const dashboardJS = `
// ── DASHBOARD ──────────────────────────────────────────────────────────
var dashKey = null;

function dashLogin() {
  var key = document.getElementById('dash-key-input').value.trim();
  var msg = document.getElementById('dash-login-msg');
  if (!key || !key.startsWith('nga_live_')) { msg.innerHTML = '<span style="color:#f87171;">Please enter a valid API key starting with nga_live_</span>'; return; }
  
  // Test the key by fetching usage
  fetch(API_BASE + '/v1/usage', { headers: { 'X-API-Key': key } })
    .then(function(r) {
      if (r.status === 401) { msg.innerHTML = '<span style="color:#f87171;">Invalid key. Check and try again.</span>'; return; }
      return r.json();
    })
    .then(function(data) {
      if (!data) return;
      dashKey = key;
      localStorage.setItem('niceguyapi_dash_key', key);
      showDash(data);
    })
    .catch(function() { msg.innerHTML = '<span style="color:#f87171;">Connection error. Try again.</span>'; });
}

function showDash(usage) {
  document.getElementById('dash-gate').style.display = 'none';
  document.getElementById('dash-content').style.display = 'block';
  
  document.getElementById('dash-tier').textContent = usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1);
  var badge = document.getElementById('dash-tier-badge');
  badge.textContent = usage.tier.toUpperCase();
  badge.style.background = usage.tier==='premium' ? 'rgba(251,191,36,0.15)' : usage.tier==='pro' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.08)';
  badge.style.color = usage.tier==='premium' ? '#fbbf24' : usage.tier==='pro' ? '#818cf8' : '#9ca3af';
  
  document.getElementById('dash-used').textContent = usage.monthly_used;
  document.getElementById('dash-remaining').textContent = usage.monthly_remaining;
  document.getElementById('dash-total').textContent = usage.monthly_limit;
  
  var pct = Math.min(100, (usage.monthly_used / usage.monthly_limit) * 100);
  document.getElementById('dash-bar').style.width = pct + '%';
  document.getElementById('dash-bar').style.background = pct > 80 ? 'linear-gradient(90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)';
  
  // Features
  var feats = document.getElementById('dash-features');
  feats.innerHTML = '';
  if (usage.features.agent) { feats.innerHTML += '<span class="tier-tag free" style="background:rgba(52,211,153,0.15);color:#34d399;">🤖 Agent</span>'; }
  if (usage.features.image_generation) { feats.innerHTML += '<span class="tier-tag free">🎨 Images</span>'; }
  if (usage.features.song_generation) { feats.innerHTML += '<span class="tier-tag free">🎵 Songs</span>'; }
  if (usage.features.games_apps) { feats.innerHTML += '<span class="tier-tag premium">🏗️ Build</span>'; }
  feats.innerHTML += '<span class="model-pill">' + usage.available_models + ' models</span>';
  feats.innerHTML += '<span class="model-pill">' + usage.rate_limit.per_minute + '/min limit</span>';
  
  // Load keys
  loadDashKeys();
}

function loadDashKeys() {
  if (!dashKey) return;
  fetch(API_BASE + '/v1/keys', { headers: { 'X-API-Key': dashKey } })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var container = document.getElementById('dash-keys-list');
      container.innerHTML = '';
      (data.keys || []).forEach(function(k) {
        var div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.2);padding:12px 16px;border-radius:10px;';
        div.innerHTML = '<div><div style="font-family:monospace;font-size:13px;color:#a5b4fc;">' + k.prefix + '...</div><div style="font-size:11px;color:#6b7280;">' + k.label + ' · Used ' + k.monthly_used + '/' + k.monthly_limit + '</div></div><div style="display:flex;gap:6px;"><button onclick="dashRotateKey(\\''+k.prefix+'\\') ')" style="padding:4px 10px;font-size:11px;background:rgba(99,102,241,0.2);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:6px;cursor:pointer;" title="Rotate">🔄</button><button onclick="dashRevokeKey(\\''+k.prefix+'\\') ')" style="padding:4px 10px;font-size:11px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25);border-radius:6px;cursor:pointer;" title="Revoke">✕</button></div>';
        container.appendChild(div);
      });
    });
}

function dashCreateKey() {
  if (!dashKey) return;
  var label = prompt('Key label (optional):') || undefined;
  fetch(API_BASE + '/v1/keys', { method:'POST', headers:{'Content-Type':'application/json','X-API-Key':dashKey}, body:JSON.stringify({label:label}) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.api_key) {
        alert('New key: ' + data.api_key + '\\n\\nSave this now — it won\\'t be shown again!');
        loadDashKeys();
      }
    });
}

function dashRotateKey(prefix) {
  if (!dashKey) return;
  if (!confirm('Rotate key ' + prefix + '...? Old key will stop working.')) return;
  fetch(API_BASE + '/v1/keys/' + prefix + '/rotate', { method:'POST', headers:{'X-API-Key':dashKey} })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.api_key) {
        alert('New key: ' + data.api_key + '\\n\\nOld key is now invalid. Save this!');
        if (dashKey.substring(0,12) === prefix) { dashKey = data.api_key; localStorage.setItem('niceguyapi_dash_key', dashKey); }
        loadDashKeys();
      }
    });
}

function dashRevokeKey(prefix) {
  if (!dashKey) return;
  if (!confirm('Revoke key ' + prefix + '...? This cannot be undone.')) return;
  fetch(API_BASE + '/v1/keys/' + prefix, { method:'DELETE', headers:{'X-API-Key':dashKey} })
    .then(function() { loadDashKeys(); });
}

function dashResetAgent() {
  if (!dashKey) return;
  if (!clear your agent conversation history?')) return;
  fetch(API_BASE + '/v1/agent/reset', { method:'POST', headers:{'X-API-Key':dashKey} })
    .then(function() { alert('Agent history cleared.'); });
}

// Auto-login if key saved
(function(){
  var saved = localStorage.getItem('niceguyapi_dash_key');
  if (saved) { document.getElementById('dash-key-input').value = saved; dashLogin(); }
})();
`;

h = h.replace('</script>\n</body>', dashboardJS + '</script>\n</body>');

// Update showTab to include 'dash'
h = h.replace(
  "['home','chat','guide','faq'].forEach(function(t){",
  "['home','chat','guide','faq','dash'].forEach(function(t){"
);

// Update the signup to handle paid tiers and redirect to Stripe
h = h.replace(
  "if(plan!=='free' && data.stripe_url){window.location.href=data.stripe_url;}",
  "if(data.stripe_url){window.location.href=data.stripe_url;}"
);

fs.writeFileSync('index.html', h);
console.log('Landing page updated to v5.0');
