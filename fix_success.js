const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// Replace the entire success check block with one that handles both hash and query params
var oldBlock = "if(window.location.hash==='#success'){\n  document.getElementById('signup').style.display='none';\n  var sb=document.getElementById('success-box');if(sb)sb.style.display='block';\n  document.getElementById('signup-msg').innerHTML='<span class=\"success\">?? Payment successful! Your account has been upgraded.</span>;\n}";

var newBlock = "var urlParams = new URLSearchParams(window.location.search);\nif(urlParams.get('canceled')==='true'){\n  document.getElementById('signup-msg').innerHTML='<span style=\"color:#fbbf24;\">Payment canceled. You can try again anytime.</span>;\n}\nif(window.location.hash==='#success' || urlParams.get('success')==='true'){\n  document.getElementById('signup').style.display='none';\n  var sb=document.getElementById('success-box');if(sb)sb.style.display='block';\n  document.getElementById('signup-msg').innerHTML='<span class=\"success\">?? Payment successful! Your account has been upgraded.</span>';\n}";

if (h.includes(oldBlock)) {
  h = h.replace(oldBlock, newBlock);
  fs.writeFileSync('index.html', h);
  console.log('Fixed success/cancel handlers');
} else {
  console.log('Block not found, trying partial match...');
  // Try to find and replace just the condition
  h = h.replace("if(window.location.hash==='#success'){", newBlock);
  fs.writeFileSync('index.html', h);
  console.log('Fixed with partial match');
}
