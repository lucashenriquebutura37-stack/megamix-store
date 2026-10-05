const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");

const server=fs.readFileSync("server.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const pedido=fs.readFileSync("pedido.html","utf8");

test("rotas críticas da loja continuam presentes",()=>{
  for(const route of ["/api/frete/cotar","/api/criar-preferencia","/api/mercadopago/webhook","/api/pedido/:publicId","/api/status","/healthz"]){
    assert.ok(server.includes(route),route+" ausente");
  }
});
test("proteções HTTP essenciais continuam configuradas",()=>{
  for(const header of ["Content-Security-Policy","Strict-Transport-Security","X-Content-Type-Options","Permissions-Policy"]){
    assert.ok(server.includes(header),header+" ausente");
  }
  assert.ok(server.includes("rateLimit("),"rate limiting ausente");
  assert.ok(server.includes("__Host-vorzeli_admin"),"cookie administrativo seguro ausente");
  assert.ok(server.includes("SameSite=Strict"),"SameSite estrito ausente");
  assert.ok(server.includes("HttpOnly; Secure"),"flags seguras do cookie administrativo ausentes");

  assert.ok(server.includes('["/api/mercadopago/webhook","/api/webhook"]'),"alias público do webhook ausente");
  assert.ok(server.includes("if(!secret)return false;"),"webhook não falha fechado sem segredo");
});
test("SEO básico e produto indexável continuam ativos",()=>{
  assert.match(index,/rel="canonical"/);
  assert.match(index,/property="og:title"/);
  assert.ok(server.includes('app.get("/produto/:id"'));
  assert.ok(server.includes('app.get("/sitemap.xml"'));
  for(const marker of ["application/ld+json","schema.org/InStock","product:price:amount","twitter:card"]){
    assert.ok(server.includes(marker),marker+" ausente");
  }
});
test("checkout, acompanhamento e frete continuam visíveis",()=>{
  assert.match(index,/Ir para pagamento seguro/);
  assert.match(index,/Calcular frete/);
  assert.match(pedido,/Consultar pedido/);
});

test("experiência moderna de produto permanece ativa",()=>{
  const script=fs.readFileSync("script.js","utf8");
  for(const marker of ["buyNow","toggleFavorite","shareProduct","relatedProducts","searchSuggestions"]){
    assert.ok(script.includes(marker),marker+" ausente");
  }
  assert.match(index,/Melhor avaliados/);
  assert.match(index,/Mais recentes/);
});
