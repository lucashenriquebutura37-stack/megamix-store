const test=require('node:test'),assert=require('node:assert/strict');
const {codeAt,matchingCounter,decodeSecret}=require('../lib/totp');
const secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
test('TOTP matches RFC 6238 SHA1 vectors with six digits',()=>{
  for(const [seconds,code] of [[59,'287082'],[1111111109,'081804'],[1111111111,'050471'],[1234567890,'005924'],[2000000000,'279037'],[20000000000,'353130']])assert.equal(codeAt(secret,Math.floor(seconds/30)),code);
});
test('TOTP accepts adjacent clock windows and rejects expired and malformed codes',()=>{
  assert.equal(matchingCounter(secret,'287082',59000),1);
  assert.equal(matchingCounter(secret,'287082',89000),1);
  assert.equal(matchingCounter(secret,'287082',120000),null);
  for(const value of ['','123','abcdef',' 287082'])assert.equal(matchingCounter(secret,value,59000),null);
  assert.throws(()=>decodeSecret('invalid'));
});
