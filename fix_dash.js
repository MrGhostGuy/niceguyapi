const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// Fix double parenthesis in onclick handlers
h = h.replace("dashRotateKey(\\''+k.prefix+'\\') ')", "dashRotateKey(\\''+k.prefix+'\\'))");
h = h.replace("dashRevokeKey(\\''+k.prefix+'\\') ')", "dashRevokeKey(\\''+k.prefix+'\\'))");

// Fix the confirm message that got broken
h = h.replace("if (!clear your agent conversation history?')) return;", "if (!confirm('Clear your agent conversation history?')) return;");

fs.writeFileSync('index.html', h);
console.log('Fixed dashboard JS');
