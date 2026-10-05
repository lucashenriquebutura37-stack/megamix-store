const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
function run({destination='postgres://test:secret@isolated/restore',objects='0',connectionFails=false,archiveFails=false}={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vorzeli-restore-'));
  try{
    fs.writeFileSync(path.join(dir,'backup.dump'),'test archive');
    fs.writeFileSync(path.join(dir,'psql'),'#!/bin/sh\n[ "$CONNECTION_FAILS" = true ] && exit 1\nprintf "%s\\n" "$OBJECTS"\n',{mode:0o700});
    fs.writeFileSync(path.join(dir,'pg_restore'),'#!/bin/sh\nprintf "%s\\n" "$*" >> "$CALLS"\nif [ "$1" = --list ] && [ "$ARCHIVE_FAILS" = true ]; then exit 1; fi\n',{mode:0o700});
    const calls=path.join(dir,'calls');
    const result=spawnSync('bash',['scripts/restore-rehearsal.sh',path.join(dir,'backup.dump')],{encoding:'utf8',env:{...process.env,PATH:dir+path.delimiter+process.env.PATH,DATABASE_URL:'postgres://prod:secret@production/store',RESTORE_DATABASE_URL:destination,OBJECTS:objects,CONNECTION_FAILS:String(connectionFails),ARCHIVE_FAILS:String(archiveFails),CALLS:calls}});
    return {...result,calls:fs.existsSync(calls)?fs.readFileSync(calls,'utf8'):''};
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('restore rejects production address despite different credentials and options',()=>{
  const result=run({destination:'postgresql://other:changed@production:5432/store?sslmode=require'});
  assert.equal(result.status,2);assert.equal(result.calls,'');
});
test('restore rejects invalid destination without exposing credentials',()=>{
  const result=run({destination:'invalid-secret'});
  assert.equal(result.status,2);assert.equal(result.calls,'');assert.ok(!result.stderr.includes('invalid-secret'));
});
test('restore rejects query parameters that override the database destination',()=>{
  const result=run({destination:'postgres://test:secret@isolated/restore?host=production&dbname=store'});
  assert.equal(result.status,2);assert.equal(result.calls,'');
});
test('restore rejects nonempty or unreachable destination before pg_restore',()=>{
  for(const opts of [{objects:'3'},{objects:''},{connectionFails:true}]){
    const result=run(opts);assert.notEqual(result.status,0);assert.equal(result.calls,'');
  }
});
test('restore validates archive before a single transaction restore',()=>{
  const result=run();assert.equal(result.status,0);
  assert.match(result.calls,/^--list /);assert.match(result.calls,/--single-transaction --exit-on-error/);
  const failed=run({archiveFails:true});assert.notEqual(failed.status,0);assert.ok(!failed.calls.includes('--single-transaction'));
});
