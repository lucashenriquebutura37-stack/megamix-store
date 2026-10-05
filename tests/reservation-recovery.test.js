const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('server.js','utf8');
test('reservation cleanup contains connection failures instead of rejecting its timer',async()=>{
  let logs=0;const context=vm.createContext({process:{env:{DATABASE_URL:'fixture'}},pool:{connect:async()=>{throw new Error('connection failed');}},console:{error:()=>logs++},safeError:()=> 'error'});
  vm.runInContext(source.slice(source.indexOf('async function releaseExpiredReservations(){'),source.indexOf('async function cancelReservedOrder(')),context);
  await assert.doesNotReject(()=>context.releaseExpiredReservations());assert.equal(logs,1);
});
