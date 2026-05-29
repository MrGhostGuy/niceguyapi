const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// Check if dashboard already added
if (h.includes('content-dash')) { console.log('Dashboard already exists'); process.exit(0); }

// Insert dashboard content right before <!-- END FAQ TAB -->
var dashContent = `  <!-- DASHBOARD TAB -->
  <div class="tab-content" id="content-dash">
    <div style="margin-top:20px;">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px;color:#e8e8ec;">Subscriber Dashboard</h2>
      <p style="color:#6b7280;font-size:14px;margin-bottom:24px;">Enter your API key to view usage, manage keys, and control your account.</p>
      <div id="dash-gate" style="max-width:500px;margin:0 auto 32px;text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(99,102,241,0.25);border-radius:16px;padding:32px;">
        <div class="badge badge-green" style="margin-bottom:12px;">Access Your Account</div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#e8e8ec;">Enter Your API Key</h3>
        <p style="color:#6b7280;font-size:13px;margin-bottom:16px;">Paste your API key below. Keys start with <code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;color:#818cf8;">nga_live_</code></p>
        <input type="text" id="dash-key-input" placeholder="nga_live_..." style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#e8e8ec;font-size:14px;font-family:monospace;outline:none;margin-bottom:12px;" autocomplete="off">
        <button class="btn btn-primary" onclick="dashLogin()" style="width:100%;">Access Dashboard</button>
        <div id="dash-login-msg" style="margin-top:10px;font-size:13px;"></div>
      </div>
      <div id="dash-content" style="display:none;">
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:24px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div><div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Tier</div><div style="font-size:20px;font-weight:700;color:#e8e8ec;margin-top:4px;" id="dash-tier">&mdash;</div></div>
            <div id="dash-tier-badge" style="padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">&mdash;</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;">
            <div><div style="font-size:28px;font-weight:800;color:#e8e8ec;" id="dash-used">&mdash;</div><div style="font-size:12px;color:#6b7280;">Used</div></div>
            <div><div style="font-size:28px;font-weight:800;color:#34d399;" id="dash-remaining">&mdash;</div><div style="font-size:12px;color:#6b7280;">Remaining</div></div>
            <div><div style="font-size:28px;font-weight:800;color:#a78bfa;" id="dash-total">&mdash;</div><div style="font-size:12px;color:#6b7280;">Limit</div></div>
          </div>
          <div style="margin-top:16px;background:rgba(255,255,255,0.05);border-radius:8px;height:8px;overflow:hidden;"><div id="dash-bar" style="height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:8px;width:0%"></div></div>
          <div id="dash-features" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;"></div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:700;color:#e8e8ec;">Your Keys</h3>
            <button class="btn btn-primary" onclick="dashCreateKey()" style="padding:8px 16px;font-size:13px;">+ New Key</button>
          </div>
          <div id="dash-keys-list" style="display:grid;gap:8px;"></div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div><h3 style="font-size:16px;font-weight:700;color:#e8e8ec;">Agent Memory</h3><p style="font-size:13px;color:#6b7280;margin-top:4px;">Clear agent conversation history.</p></div>
            <button onclick="dashResetAgent()" style="padding:8px 16px;font-size:13px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25);border-radius:8px;cursor:pointer;font-weight:600;">Clear</button>
          </div>
        </div>
      </div>
    </div>
  </div>

`;

if (h.includes('<!-- END FAQ TAB -->')) {
  h = h.replace('<!-- END FAQ TAB -->', '<!-- END FAQ TAB -->\n' + dashContent);
  console.log('Inserted dashboard after FAQ tab');
} else {
  console.log('ERROR: Could not find <!-- END FAQ TAB -->');
  process.exit(1);
}

// Also add dashboard nav tab if not present
if (!h.includes('tab-dash')) {
  h = h.replace(
    '<button class="nav-tab" id="tab-faq"',
    '<button class="nav-tab" id="tab-dash" onclick="showTab(\'dash\')"><span> </span>Dashboard</button>\n      <button class="nav-tab" id="tab-faq"'
  );
  console.log('Added dashboard nav tab');
}

// Add dashboard JS before </script>
if (!h.includes('dashLogin')) {
  var dashJS = `
// DASHBOARD
var dashKey=null;
function dashLogin(){var k=document.getElementById('dash-key-input').value.trim();var m=document.getElementById('dash-login-msg');if(!k||!k.startsWith('nga_live_')){m.innerHTML='<span style="color:#f87171;">Enter a valid API key</span>';return;}fetch(API_BASE+'/v1/usage',{headers:{'X-API-Key':k}}).then(function(r){if(r.status===401)throw new Error('bad');return r.json();}).then(function(d){dashKey=k;localStorage.setItem('niceguyapi_dash_key',k);showDash(d);}).catch(function(){m.innerHTML='<span style="color:#f87171;">Invalid key.</span>';});}
function showDash(u){document.getElementById('dash-gate').style.display='none';document.getElementById('dash-content').style.display='block';document.getElementById('dash-tier').textContent=u.tier.charAt(0).toUpperCase()+u.tier.slice(1);var b=document.getElementById('dash-tier-badge');b.textContent=u.tier.toUpperCase();b.style.background=u.tier==='premium'?'rgba(251,191,36,0.15)':u.tier==='pro'?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.08)';b.style.color=u.tier==='premium'?'#fbbf24':u.tier==='pro'?'#818cf8':'#9ca3af';document.getElementById('dash-used').textContent=u.monthly_used;document.getElementById('dash-remaining').textContent=u.monthly_remaining;document.getElementById('dash-total').textContent=u.monthly_limit;var p=Math.min(100,(u.monthly_used/u.monthly_limit)*100);var bar=document.getElementById('dash-bar');bar.style.width=p+'%';bar.style.background=p>80?'linear-gradient(90deg,#ef4444,#f87171)':'linear-gradient(90deg,#6366f1,#8b5cf6)';var f=document.getElementById('dash-features');f.innerHTML='';if(u.features.agent)f.innerHTML+='<span style="background:rgba(52,211,153,0.15);color:#34d399;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-right:4px;">Agent</span>';if(u.features.image_generation)f.innerHTML+='<span style="background:rgba(99,102,241,0.15);color:#818cf8;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-right:4px;">Images</span>';if(u.features.song_generation)f.innerHTML+='<span style="background:rgba(99,102,241,0.15);color:#818cf8;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-right:4px;">Songs</span>';if(u.features.games_apps)f.innerHTML+='<span style="background:rgba(251,191,36,0.15);color:#fbbf24;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-right:4px;">Build</span>';f.innerHTML+='<span class="model-pill">'+u.available_models+' models</span>';loadDashKeys();}
function loadDashKeys(){fetch(API_BASE+'/v1/keys',{headers:{'X-API-Key':dashKey}}).then(function(r){return r.json();}).then(function(d){var c=document.getElementById('dash-keys-list');c.innerHTML='';(d.keys||[]).forEach(function(k){var el=document.createElement('div');el.style.cssText='display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.2);padding:12px 16px;border-radius:10px;';el.innerHTML='<div><div style="font-family:monospace;font-size:13px;color:#a5b4fc;">'+k.prefix+'...</div><div style="font-size:11px;color:#6b7280;">'+k.label+' - '+k.monthly_used+'/'+k.monthly_limit+'</div></div><div style="display:flex;gap:6px;"><button onclick="dashRotateKey(\\''+k.prefix+'\\')" style="padding:4px 10px;font-size:11px;background:rgba(99,102,241,0.2);color:#818cf8;border:1px solid rgba(99,102,241,0.3);border-radius:6px;cursor:pointer;">Rotate</button><button onclick="dashRevokeKey(\\''+k.prefix+'\\')" style="padding:4px 10px;font-size:11px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.25);border-radius:6px;cursor:pointer;">Revoke</button></div>';c.appendChild(el);});});}
function dashCreateKey(){var l=prompt('Key label (optional):')||undefined;var opts={method:'POST',headers:{'X-API-Key':dashKey}};if(l){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify({label:l});}fetch(API_BASE+'/v1/keys',opts).then(function(r){return r.json();}).then(function(d){if(d.api_key){alert('New key: '+d.api_key+'\\n\\nSave now - shown only once!');loadDashKeys();}});}
function dashRotateKey(p){if(!confirm('Rotate key '+p+'...?'))return;fetch(API_BASE+'/v1/keys/'+p+'/rotate',{method:'POST',headers:{'X-API-Key':dashKey}}).then(function(r){return r.json();}).then(function(d){if(d.api_key){alert('New key: '+d.api_key+'\\n\\nSave now!');if(dashKey.substring(0,12)===p){dashKey=d.api_key;localStorage.setItem('niceguyapi_dash_key',dashKey);}loadDashKeys();}});}
function dashRevokeKey(p){if(!confirm('Revoke '+p+'...?'))return;fetch(API_BASE+'/v1/keys/'+p,{method:'DELETE',headers:{'X-API-Key':dashKey}}).then(function(){loadDashKeys();});}
function dashResetAgent(){if(!confirm('Clear agent history?'))return;fetch(API_BASE+'/v1/agent/reset',{method:'POST',headers:{'X-API-Key':dashKey}}).then(function(){alert('Cleared.');});}
(function(){var s=localStorage.getItem('niceguyapi_dash_key');if(s){document.getElementById('dash-key-input').value=s;dashLogin();}})();
`;
  h = h.replace('</script>\n</body>', dashJS + '\n</script>\n</body>');
  console.log('Added dashboard JS');
}

fs.writeFileSync('index.html', h);
console.log('Done!');
