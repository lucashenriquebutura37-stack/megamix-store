const test=require('node:test'),assert=require('node:assert/strict');
const {sanitizeError}=require('../lib/safe-error');
test('logs expose only allowlisted diagnostic codes and HTTP status',()=>{
  const e=new Error('password=secret postgres://user:secret@host/db customer@example.com CPF 12345678900');e.code='ECONNREFUSED';e.status=503;
  assert.equal(sanitizeError(e),'Error code=ECONNREFUSED status=503');
  assert.equal(sanitizeError({name:'customer@example.com',code:'TOKEN-SECRET',status:'customer@example.com',message:'PII'}),'Error code=UNKNOWN');
  assert.equal(sanitizeError('Bearer secret'),'Error code=UNKNOWN');
});
