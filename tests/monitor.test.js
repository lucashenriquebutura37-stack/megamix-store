const test=require('node:test');
const assert=require('node:assert/strict');
const {check}=require('../scripts/monitor');
const now=Date.parse('2026-10-05T21:45:00Z');
const healthy={status:'ok',timestamp:new Date(now).toISOString()};
function options(responses){let calls=0;return {fetchImpl:async()=>{const response=responses[Math.min(calls++,responses.length-1)];if(response instanceof Error)throw response;return response;},now:()=>now,retryDelayMs:0,calls:()=>calls};}
function json(body,status=200){return new Response(JSON.stringify(body),{status});}
test('storefront and current health response are accepted',async()=>{
  await check('/',options([new Response('<title>VORZELI</title>')]));
  await check('/healthz',options([json(healthy)]));
});
test('2FA warning alone is accepted',async()=>{
  await check('/api/status',options([json({...healthy,status:'warning',warnings:['admin_2fa_not_configured']})]));
});
test('transient HTTP failure is retried before success',async()=>{
  const opts=options([json({},503),json(healthy)]);
  await check('/healthz',opts);assert.equal(opts.calls(),2);
});
test('stale or invalid timestamps, degraded status, timeouts and missing storefront are confirmed by retries',async()=>{
  for(const [path,response] of [
    ['/healthz',json({...healthy,timestamp:new Date(now-300000).toISOString()})],
    ['/healthz',json({...healthy,timestamp:'invalid'})],
    ['/api/status',json({...healthy,status:'degraded'})],
    ['/healthz',new Error('timeout')],
    ['/',new Response('Unavailable')]
  ]){
    // Create independent responses because their bodies can only be consumed once.
    const opts=options([response]);const source=opts.fetchImpl;
    opts.fetchImpl=async()=>{const value=await source();return value.clone();};
    await assert.rejects(check(path,opts));assert.equal(opts.calls(),3);
  }
});
