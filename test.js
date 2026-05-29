process.env.NICEGUYAPI_SECRET = 'test';
const h = require('./api/index.js');
const http = require('http');
const s = http.createServer((q, r) => h(q, r).catch(e => { r.writeHead(500); r.end(String(e)); }));
s.listen(0, () => {
  const p = s.address().port;
  console.log('Port', p);
  function get(path, cb) { http.get('http://localhost:'+p+path, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>cb(r.statusCode,d)); }); }
  function post(path, body, cb) {
    const data = JSON.stringify(body);
    const opts = { hostname:'localhost', port:p, path, method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)} };
    const req = http.request(opts, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>cb(r.statusCode,d)); });
    req.write(data); req.end();
  }
  get('/health', (code, body) => {
    console.log('/health:', code, body);
    if (code !== 200) { s.close(); return; }
    get('/', (code2, body2) => {
      console.log('/', code2, body2.substring(0,80));
      post('/v1/signup', {email:'test@example.com',tier:'free'}, (code3, body3) => {
        console.log('/v1/signup:', code3, body3.substring(0,300));
        s.close();
      });
    });
  });
});
setTimeout(() => process.exit(0), 8000);
