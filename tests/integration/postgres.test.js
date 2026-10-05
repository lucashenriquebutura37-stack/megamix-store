const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Pool}=require('pg');
const source=fs.readFileSync('server.js','utf8');
test('production schema and concurrency protections work on PostgreSQL',async t=>{
  assert.ok(process.env.TEST_DATABASE_URL,'TEST_DATABASE_URL must point to a disposable database');
  const pool=new Pool({connectionString:process.env.TEST_DATABASE_URL,max:8});
  try{
    const context={pool,process:{env:{DATABASE_URL:'test'}},console};
    const start=source.indexOf('async function initDatabase()');
    const end=source.indexOf('\nfunction toProduct',start);
    assert.ok(start>=0&&end>start);
    vm.runInNewContext(source.slice(start,end),context);
    await context.initDatabase();await context.initDatabase();
    await t.test('schema initializes twice and enforces unique payment IDs',async()=>{
      await pool.query("INSERT INTO orders(public_id,payment_id) VALUES('fixture-one','fixture-payment')");
      await assert.rejects(pool.query("INSERT INTO orders(public_id,payment_id) VALUES('fixture-two','fixture-payment')"),{code:'23505'});
    });
    await t.test('concurrent reservations cannot oversell',async()=>{
      const product=await pool.query("INSERT INTO products(name,category,subcategory,price,stock) VALUES('Fixture','Test','Test',19.90,1) RETURNING id");
      const sql=source.match(/client\.query\("(UPDATE products SET stock=stock-\$1[^"\n]+)"/);
      assert.ok(sql,'checkout reservation SQL is present');
      const results=await Promise.all(Array.from({length:8},()=>pool.query(sql[1],[1,product.rows[0].id])));
      assert.equal(results.reduce((sum,r)=>sum+r.rowCount,0),1);
      assert.equal((await pool.query('SELECT stock FROM products WHERE id=$1',[product.rows[0].id])).rows[0].stock,0);
    });
    await t.test('TOTP counter can be consumed only once concurrently',async()=>{
      const sql=source.match(/pool\.query\("(INSERT INTO admin_totp_usage[^"\n]+)"/);
      assert.ok(sql,'production TOTP SQL is present');
      const results=await Promise.all(Array.from({length:8},()=>pool.query(sql[1],['fixture-identity',100])));
      assert.equal(results.reduce((sum,r)=>sum+r.rowCount,0),1);
      assert.equal((await pool.query(sql[1],['fixture-identity',99])).rowCount,0);
      assert.equal((await pool.query(sql[1],['fixture-identity',101])).rowCount,1);
    });
    await t.test('transaction rollback preserves inventory and coupon use',async()=>{
      const client=await pool.connect();
      try{
        await client.query('BEGIN');
        await client.query("INSERT INTO coupons(code,discount_type,discount_value,uses) VALUES('ROLLBACK','fixed',5,1)");
        await client.query('UPDATE products SET stock=100');
        await client.query('ROLLBACK');
        assert.equal((await pool.query("SELECT count(*) FROM coupons WHERE code='ROLLBACK'")).rows[0].count,'0');
        assert.equal((await pool.query('SELECT stock FROM products')).rows[0].stock,0);
      }finally{client.release();}
    });
  }finally{await pool.end();}
});
