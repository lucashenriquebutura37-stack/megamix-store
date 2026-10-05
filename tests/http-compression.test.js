const test=require('node:test'),assert=require('node:assert/strict'),express=require('express');
const middleware=require('../lib/http-compression');
test('public responses are compressed while admin responses remain uncompressed',async()=>{
  const app=express();app.use(middleware);const body='VORZELI '.repeat(1000);app.get(['/asset','/api/admin/sample'],(req,res)=>res.type('text').send(body));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  try{
    const base='http://127.0.0.1:'+server.address().port;
    const publicResponse=await fetch(base+'/asset',{headers:{'Accept-Encoding':'gzip'}});assert.equal(publicResponse.headers.get('content-encoding'),'gzip');assert.equal(await publicResponse.text(),body);
    const adminResponse=await fetch(base+'/api/admin/sample',{headers:{'Accept-Encoding':'gzip'}});assert.equal(adminResponse.headers.get('content-encoding'),null);assert.equal(await adminResponse.text(),body);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
