const readline = require('readline');
const { execSync } = require('child_process');

const key = process.env.OPENROUTER_API_KEY;
if (!key) { console.error('No key'); process.exit(1); }
console.log('Key found, length:', key.length);

// Remove old env var
try {
  const rm = execSync('npx vercel env rm OPENROUTER_API_KEY production --yes 2>&1', { encoding: 'utf-8', cwd: __dirname });
  console.log('Removed:', rm);
} catch (e) { console.log('Remove error (may not exist):', e.message); }

// Add new env var — use the API approach
// First, get the project ID
try {
  const projects = JSON.parse(execSync('npx vercel projects list --json 2>&1', { encoding: 'utf-8' }));
  const project = projects.find(p => p.name === 'niceguyapi-repo' || p.name.includes('niceguyapi'));
  console.log('Project:', project?.id, project?.name);
  
  if (project) {
    // Set env var using vercel env add with PTY
    const { spawn } = require('child_process');
    const proc = spawn('npx', ['vercel', 'env', 'add', 'OPENROUTER_API_KEY', 'production'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    let out = '';
    proc.stdout.on('data', d => {
      out += d.toString();
      process.stdout.write(d);
      // When it asks for "Is it sensitive?", answer yes
      if (d.toString().includes('sensitive')) {
        setTimeout(() => proc.stdin.write('y\n'), 200);
      }
      // When it asks for the value, provide the key
      if (d.toString().includes('value') || d.toString().includes('Value')) {
        setTimeout(() => proc.stdin.write(key + '\n'), 200);
      }
    });
    proc.stderr.on('data', d => { out += d; process.stderr.write(d); });
    proc.on('close', code => {
      console.log('\nExit:', code);
      console.log('Full output:', out);
    });
    
    // Safety timeout
    setTimeout(() => { proc.kill(); process.exit(0); }, 30000);
  }
} catch(e) {
  console.error('Error:', e.message);
}
