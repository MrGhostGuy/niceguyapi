const https = require('https');
const post = (p,b,h={}) => new Promise((r,j)=>{const d=JSON.stringify(b);const q=https.request({hostname:'niceguyapi-repo.vercel.app',port:443,path:p,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d),...h}},res=>{let x='';res.on('data',c=>x+=c);res.on('end',()=>r({s:res.statusCode,b:x}))});q.on('error',j);q.write(d);q.end()});
const get = (p,h={}) => new Promise((r,j)=>https.get({hostname:'niceguyapi-repo.vercel.app',port:443,path:p,headers:h},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({s:res.statusCode,b:d}))}).on('error',j));
(async()=>{
  let pass=0,fail=0;
  function ok(n,c){if(c){pass++;console.log('  ✅',n);}else{fail++;console.log('  ❌',n,'| got:',c);}}

  // 1. Health
  const h = await get('/health');
  ok('Health 200', h.s===200);
  const hd = JSON.parse(h.b);
  ok('Agent enabled', hd.agent===true);
  ok('Persistent storage', hd.storage==='persistent');
  ok('Version 4.0', hd.version==='4.0.0');

  // 2. Root docs
  const root = await get('/');
  ok('Root 200', root.s===200);
  const rd = JSON.parse(root.b);
  ok('Agent tools listed', rd.features?.agent_tools?.length >= 3);

  // 3. Signup (free tier)
  const e = 'v4free_'+Date.now()+'@test.com';
  const s = await post('/v1/signup',{email:e,tier:'free'});
  ok('Free signup 201', s.s===201);
  const sd = JSON.parse(s.b);
  const freeKey = sd.api_key;
  ok('Free key prefix', freeKey.startsWith('nga_live_'));
  ok('Free no agent', sd.features?.agent === false);

  // 4. Signup (pro tier)
  const e2 = 'v4pro_'+Date.now()+'@test.com';
  const s2 = await post('/v1/signup',{email:e2,tier:'pro'});
  ok('Pro signup 201', s2.s===201);
  const s2d = JSON.parse(s2.b);
  const proKey = s2d.api_key;
  ok('Pro has agent', s2d.features?.agent === true);

  // 5. Free chat (normal)
  const c1 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Reply: FREE'}]},{'X-API-Key':freeKey});
  ok('Free chat 200', c1.s===200);
  if(c1.s===200) console.log('   Reply:', JSON.parse(c1.b).choices?.[0]?.message?.content);

  // 6. Agent on free tier → should be 403
  const c2 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'test'}],agent:true},{'X-API-Key':freeKey});
  ok('Agent blocked on free', c2.s===403);

  // 7. Agent on pro tier → should work (multi-step)
  console.log('   ⏳ Running agent test (may take 3-5s)...');
  const c3 = await post('/v1/chat/completions',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'What is 2 to the power of 10? Use the calculator.'}],agent:true},{'X-API-Key':proKey});
  ok('Agent pro 200', c3.s===200);
  if(c3.s===200){
    const reply = JSON.parse(c3.b);
    console.log('   Agent reply:', reply.choices?.[0]?.message?.content?.substring(0,150));
    console.log('   Tool calls:', reply.usage?._agent_tool_calls);
    ok('Agent used tools', (reply.usage?._agent_tool_calls||0) > 0);
  } else {
    console.log('   Agent error:', c3.b.substring(0,200));
  }

  // 8. Explicit /v1/agent endpoint
  const c4 = await post('/v1/agent',{model:'openai/gpt-oss-120b:free',messages:[{role:'user',content:'Calculate 144 divided by 12'}]},{'X-API-Key':proKey});
  ok('Agent endpoint 200', c4.s===200);
  if(c4.s===200) console.log('   Agent calc reply:', JSON.parse(c4.b).choices?.[0]?.message?.content?.substring(0,100));

  // 9. Usage tracking
  await new Promise(r=>setTimeout(r,500));
  const u = await get('/v1/usage',{'X-API-Key':proKey});
  ok('Usage 200', u.s===200);
  const ud = JSON.parse(u.b);
  ok('Agent features listed', ud.features?.agent_tools?.length >= 3);

  // 10. Landing page
  const lp = await new Promise((r,j)=>https.get('https://mrghostguy.github.io/niceguyapi/',res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>r({s:res.statusCode,len:d.length,hasAgent:d.includes('Agent'),hasAgentSection:d.includes('AI Agent — Do More')}))}).on('error',j));
  ok('Landing page 200', lp.s===200);
  ok('Has agent content', lp.hasAgent);
  ok('Has agent section', lp.hasAgentSection);

  console.log(`\n${pass}/${pass+fail} passed`);
  process.exit(fail>0?1:0);
})();
