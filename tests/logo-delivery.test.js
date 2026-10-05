const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const sharp=require('sharp');
const path=require('node:path');
const fs=require('node:fs');
const {createLogoHandler}=require('../lib/logo-delivery');
test('logo delivery resizes safely, preserves the original and negotiates image format',async()=>{
  const original=path.resolve('logo-vorzeli.png');
  const before=fs.readFileSync(original);
  const app=express();app.get('/logo',createLogoHandler(original));app.use((req,res)=>res.status(404).end());
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  try{
    const base='http://127.0.0.1:'+server.address().port;
    const webp=await fetch(base+'/logo?w=360',{headers:{Accept:'image/webp'}});
    const bytes=Buffer.from(await webp.arrayBuffer());
    assert.equal(webp.status,200);assert.match(webp.headers.get('content-type'),/image\/webp/);
    assert.match(webp.headers.get('vary'),/Accept/);assert.ok(bytes.length<before.length/4);
    const meta=await sharp(bytes).metadata();assert.equal(meta.width,360);assert.equal(meta.height,120);
    const png=await fetch(base+'/logo?w=720',{headers:{Accept:'image/png'}});
    assert.match(png.headers.get('content-type'),/image\/png/);
    assert.equal((await sharp(Buffer.from(await png.arrayBuffer())).metadata()).width,720);
    assert.equal((await fetch(base+'/logo?w=9000')).status,404);
    assert.deepEqual(fs.readFileSync(original),before);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
