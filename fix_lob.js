const fs = require('fs');
let code = fs.readFileSync('api/index.js', 'utf8');

// Fix: replace the early return from blob load with a merge
const old = `      if (r.ok) { localCache = await r.json(); return localCache; }`;
const newCode = `      if (r.ok) {
        const blob = await r.json();
        localCache = { keys: {}, byEmail: {}, byPrefix: {}, billing: {}, agent_history: {}, ...blob };
        if (!localCache.agent_history) localCache.agent_history = {};
        return localCache;
      }`;

if (code.includes(old)) {
  code = code.replace(old, newCode);
  fs.writeFileSync('api/index.js', code);
  console.log('✅ Fixed loadDb blob merge');
} else {
  console.log('❌ Pattern not found');
  // Try to find what's actually there
  const idx = code.indexOf('if (r.ok)');
  if (idx >= 0) {
    console.log('Found at:', idx);
    console.log('Context:', code.substring(idx - 20, idx + 80));
  }
}
