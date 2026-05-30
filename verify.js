const https = require('https');
const post = (p,b,h) => { h=h||{}; return new Promise((r,j)=>{const d=JSON.stringify(b);const q=https.request({hostname:'niceguyapi-repo.vercel.app',port:443,path:p,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d),...h}},res=>{let x='';res.on('data',c=>x+=c);res.on('end',()=>r({s:res.statusCode,b:x}))});q.on('error',j);q.write(d);q.end();});};
const get = (p,h) => { h=h||{}; return new Promise((r,j)=>https.get({hostname:'niceguyapi-repo.vercel.app',port:443,path:p,headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({s:res.statusCode,b:d}))}).on('error',j)); };
const j = x => JSON.parse(x.b);

(async()=>{
  let p=0,f=0;
  function ok(n,c){if(c){p++;console.log('OK',n);}else{f++;console.log('FAIL',n);}}

  // 1. Health
  const h = await get('/health');
  ok('Health v5.0.0', h.s===200 && j(h).version==='5.0.0' && j(h).agent===true && j(h).storage==='persistent');

  // 2. Free signup
  const sf = await post('/v1/signup',{email:'v5_'+Date.now()+'@test.com',tier:'free'});
  ok('Free signup 201', sf.s===201);
  const freeKey = j(sf).api_key;
  ok('Free no agent', j(sf).features?.agent===false);
  ok('Free 14/mo', j(sf).monthly_limit===14);

  // 3. Pro signup
  const sp = await post('/v1/signup',{email:'v5pro_'+Date.now()+'@test.com',tier:'pro'});
  ok('Pro signup 201', sp.s===201);
  const proKey = j(sp).api_key;
  ok('Pro agent', j(sp).features?.agent===true);

  // 4. Normal chat
  const c1 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Reply V5'}]},{'X-API-Key':freeKey});
  ok('Chat 200', c1.s===200);

  // 5. Models
  const m = await get('/v1/models',{'X-API-Key':proKey});
  ok('Models 200+', m.s===200 && j(m).data.length>=23);

  // 6. Agent blocked on free
  const a1 = await post('/v1/agent',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'2+2?'}]},{'X-API-Key':freeKey});
  ok('Agent blocked free', a1.s===403);

  // 7. Agent works on pro
  const a2 = await post('/v1/agent',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'What is 144/12? Use calculator.'}]},{'X-API-Key':proKey});
  ok('Agent pro 200', a2.s===200);
  if(a2.s===200){ok('Agent calc result', j(a2).choices[0].message.content.includes('12'));}

  // 8. Key list
  const k1 = await get('/v1/keys',{'X-API-Key':proKey});
  ok('Keys list', k1.s===200 && Array.isArray(j(k1).keys));

  // 9. Create key
  const k2 = await post('/v1/keys',{label:'Test'},{'X-API-Key':proKey});
  ok('Create key', k2.s===201);
  const newKey = j(k2).api_key;
  const newPrefix = j(k2).prefix;

  // 10. New key works
  const c2 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Hi'}]},{'X-API-Key':newKey});
  ok('New key works', c2.s===200);

  // 11. Rotate key
  const k3 = await post('/v1/keys/'+newPrefix+'/rotate',{},{'X-API-Key':proKey});
  ok('Rotate key', k3.s===200);
  const rotKey = j(k3).api_key;

  // 12. Old key dead
  const c3 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Hi'}]},{'X-API-Key':newKey});
  ok('Old key revoked', c3.s===401);

  // 13. Rotated key works
  const c4 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Hi'}]},{'X-API-Key':rotKey});
  ok('Rotated key works', c4.s===200);

  // 14. Usage tracking
  const u = await get('/v1/usage',{'X-API-Key':rotKey});
  ok('Usage 200', u.s===200);

  // 15. Agent reset
  const ar = await post('/v1/agent/reset',{},{'X-API-Key':rotKey});
  ok('Agent reset', ar.s===200);

  // 16. Landing page
  const lp = await new Promise((r,j)=>https.get('https://mrghostguy.github.io/niceguyapi/',res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({s:res.statusCode,b:d}))}).on('error',j));
  ok('Landing v5.0', lp.s===200 && lp.b.includes('v5.0'));
  ok('Dashboard tab', lp.b.includes('tab-dash'));
  ok('Dashboard content', lp.b.includes('content-dash'));

  console.log('\n'+p+'/'+(p+f)+' passed');
  process.exit(f>0?1:0);
})();
