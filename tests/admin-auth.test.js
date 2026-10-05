const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {matchingCounter,codeAt}=require('../lib/totp');
const source=fs.readFileSync('server.js','utf8');
const route=source.slice(source.indexOf('app.post("/api/admin/auth"'),source.indexOf('app.post("/api/admin/logout"'));
const secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
function harness(){
  let handler,last=-1,failures=0,sessions=0;
  const ctx={app:{post:(path,fn)=>handler=fn},process:{env:{ADMIN_PASSWORD:'correct',DATABASE_URL:'test',ADMIN_TOTP_SECRET:secret}},crypto,Buffer,Date,matchingCounter,
    adminLoginKey:()=> 'ip',adminLoginBlocked:()=>false,recordAdminLoginFailure:()=>failures++,clearAdminLoginFailures:()=>{},cleanupAdminSessions:async()=>{},sessionHash:x=>x,
    ADMIN_SESSION_TTL_MS:10000,ADMIN_MAX_ACTIVE_SESSIONS:5,safeError:()=> 'error',console:{error:()=>{}},
    pool:{query:async(sql,args)=>{if(sql.includes('INSERT INTO admin_totp_usage')){if(args[1]<=last)return {rows:[]};last=args[1];return {rows:[{}]};}if(sql.includes('INSERT INTO admin_sessions'))sessions++;return {rows:[]};}}};
  vm.runInNewContext(route,ctx);
  return {call:async(password,otp)=>{const res={code:200,headers:{},status(n){this.code=n;return this;},json(body){this.body=body;return this;},setHeader(k,v){this.headers[k]=v;}};await handler({headers:{'x-admin-password':password,'x-admin-otp':otp}},res);return res;},counts:()=>({failures,sessions})};
}
test('wrong password or missing TOTP cannot create an admin session',async()=>{
  const h=harness();assert.equal((await h.call('wrong','123456')).code,401);assert.equal((await h.call('correct','')).code,401);assert.deepEqual(h.counts(),{failures:2,sessions:0});
});
test('correct TOTP creates a secure session once; replay fails',async()=>{
  const h=harness(),code=codeAt(secret,Math.floor(Date.now()/30000));
  const first=await h.call('correct',code);assert.equal(first.code,200);assert.match(first.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
  assert.equal((await h.call('correct',code)).code,401);assert.deepEqual(h.counts(),{failures:1,sessions:1});
});
