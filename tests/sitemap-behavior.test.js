const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('server.js','utf8');
async function sitemap(fail=false){
  let handler;vm.runInNewContext(source.slice(source.indexOf('const xmlEscape='),source.indexOf('// Somente páginas')),{
    PUBLIC_URL:'https://vorzeli.com.br',process:{env:{DATABASE_URL:'fixture'}},app:{get:(path,fn)=>handler=fn},pool:{query:async()=>{if(fail)throw new Error('fixture');return {rows:[{id:1,created_at:'2026-10-05'}]};}},console:{error:()=>{}},safeError:()=> 'error'
  });
  const res={status(n){this.code=n;},set(){},send(body){this.body=body;}};await handler({},res);return res;
}
test('sitemap includes products and public pages, excludes noindex order tracking',async()=>{
  const r=await sitemap();assert.equal(r.code,200);assert.match(r.body,/https:\/\/vorzeli.com.br\/produto\/1/);assert.doesNotMatch(r.body,/pedido.html|admin.html|pagamento.html|sucesso.html/);
});
test('sitemap retains essential pages when database fails',async()=>{
  const r=await sitemap(true);assert.equal(r.code,200);assert.match(r.body,/politicas.html/);assert.match(r.body,/<urlset/);
});
