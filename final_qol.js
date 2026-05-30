const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// Remove duplicate success block (keep only first one)
h = h.replace(/\}\s*document\.getElementById\('signup'\)\.style\.display='none';\s*var sb=_document\.getElementById\('success-box'\);if\(sb\)sb\.style\.display='block';\s*document\.getElementById\('signup-msg'\)\.innerHTML='<span class="success">🎉 Payment successful!/gm', '');

// Add copy button handler and keydown for dash
var qolJS = `
// QOL: Copy to clipboard
function copyKey(key){navigator.clipboard.writeText(key).then(()=>alert('Key copied!')};
// QOL: Enter to submit for dashboard
document.addEventListener('DOMContentLoaded',function(){\var dk=document.getElementById('dash-key-input');if(dk)dk.addEventListener('keydown',function(e){if(e.key==='Enter')dashLogin();});\});
`;

// Add before </script>
if (!h.includes('function copyKey')) {
  h = h.replace('</script>\n</body>', qolJS + '\n</script>\n</body>');
}

// Add copy button to key display in dashboard
h = h.replace(
  '<div style="font-family:monospace;font-size:13px;color:#a5b4fc;">\' + k.prefix + \'...</div>',
  '<div style="font-family:monospace;font-size:13px;color:#a5b4fc;">' + k.prefix + '...</div><button onclick="copyKey(\\''+k.prefix+'\\')" style="padding:2px 6px;font-size:11px;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.3);border-radius:4px;color:#818cf8;cursor:pointer;">Copy</button>'
);

fs.writeFileSync('index.html', h);
console.log('QOL improvements added');
