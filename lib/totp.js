const crypto=require('node:crypto');
function decodeSecret(secret){
  const value=String(secret||'').toUpperCase();
  if(!/^[A-Z2-7]{32,128}$/.test(value))throw new Error('Invalid TOTP secret');
  let bits=0,acc=0;const bytes=[];
  for(const c of value){acc=(acc<<5)|'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c);bits+=5;if(bits>=8){bits-=8;bytes.push((acc>>>bits)&255);}}
  return Buffer.from(bytes);
}
function codeAt(secret,counter){
  const data=Buffer.alloc(8);data.writeBigUInt64BE(BigInt(counter));
  const digest=crypto.createHmac('sha1',decodeSecret(secret)).update(data).digest();
  const offset=digest[19]&15;return String((digest.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');
}
function matchingCounter(secret,code,now=Date.now()){
  if(!/^\d{6}$/.test(String(code||'')))return null;
  const counter=Math.floor(now/30000);
  for(const drift of [0,-1,1]){const step=counter+drift;if(step>=0&&crypto.timingSafeEqual(Buffer.from(String(code)),Buffer.from(codeAt(secret,step))))return step;}
  return null;
}
module.exports={decodeSecret,codeAt,matchingCounter};
