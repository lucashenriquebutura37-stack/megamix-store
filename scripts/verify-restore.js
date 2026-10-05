const assert=require('node:assert/strict');
const {Pool}=require('pg');
async function main(){
  const pools=[process.env.TEST_DATABASE_URL,process.env.RESTORE_DATABASE_URL].map(connectionString=>{
    assert.ok(connectionString,'Both isolated database URLs are required');return new Pool({connectionString});
  });
  try{
    const snapshot=async pool=>{
      const tables=(await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
      const result={};
      for(const {tablename} of tables){
        const identifier='"'+tablename.replace(/"/g,'""')+'"';
        result[tablename]=(await pool.query(`SELECT row_to_json(t) AS row FROM public.${identifier} t`)).rows.map(r=>JSON.stringify(r.row)).sort();
      }
      return result;
    };
    const [before,after]=await Promise.all(pools.map(snapshot));
    assert.ok(Object.keys(before).length>=10,'Expected production schema tables');
    assert.deepEqual(after,before,'Restored table data differs from the original fixture');
    const source=await pools[0].query("SELECT last_value FROM products_id_seq");
    const restored=await pools[1].query("SELECT last_value FROM products_id_seq");
    assert.deepEqual(restored.rows,source.rows);
    console.log('Backup/restauração: tabelas, dados fictícios e sequência de produtos conferidos.');
  }finally{await Promise.all(pools.map(pool=>pool.end()));}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
