const test=require('node:test');
const assert=require('node:assert/strict');
const {connectionEnv}=require('../scripts/pg-client');
test('PostgreSQL URLs map to separate libpq environment fields',()=>{
  const env=connectionEnv('postgresql://user:p%40ss@db.example:5433/store?sslmode=require',{PATH:'/bin',DATABASE_URL:'source',RESTORE_DATABASE_URL:'destination'});
  assert.equal(env.PGHOST,'db.example');assert.equal(env.PGPORT,'5433');assert.equal(env.PGDATABASE,'store');
  assert.equal(env.PGUSER,'user');assert.equal(env.PGPASSWORD,'p@ss');assert.equal(env.PGSSLMODE,'require');
  assert.equal(env.DATABASE_URL,undefined);assert.equal(env.RESTORE_DATABASE_URL,undefined);
});
test('ambiguous routing options and malformed URLs fail closed',()=>{
  assert.throws(()=>connectionEnv('postgresql://u:p@isolated/db?host=production'));
  assert.throws(()=>connectionEnv('not-a-url'));
});
