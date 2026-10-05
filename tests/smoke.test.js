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
  for(const header of ["Content-Security-Policy","Strict-Transport-Security","X-Content-Type-Options","Permissions-Policy","X-Frame-Options","Referrer-Policy","X-Permitted-Cross-Domain-Policies","Origin-Agent-Cluster","Cross-Origin-Opener-Policy","Cross-Origin-Resource-Policy"]){
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

test("perguntas de produto têm moderação administrativa",()=>{
  const server=fs.readFileSync("server.js","utf8");
  const admin=fs.readFileSync("admin.html","utf8");
  for(const marker of ["product_questions","/api/produtos/:id/perguntas","/api/admin/perguntas"]){assert.ok(server.includes(marker),marker+" ausente");}
  assert.ok(server.includes("approved=TRUE"),"perguntas públicas sem filtro de aprovação");
  assert.ok(admin.includes("loadQuestions"),"moderação de perguntas ausente do admin");
});

test("cupons e pós-venda permanecem integrados",()=>{
  const script=fs.readFileSync("script.js","utf8");
  const admin=fs.readFileSync("admin.html","utf8");
  for(const marker of ["CREATE TABLE IF NOT EXISTS coupons","/api/cupom/validar","/api/admin/cupons","product_reviews"]){assert.ok(server.includes(marker),marker+" ausente");}
  assert.match(index,/Cupom de desconto/);
  assert.ok(script.includes("coupon_code"),"cupom não enviado ao checkout");
  assert.ok(admin.includes("loadCoupons"),"gestão de cupons ausente");
  assert.match(pedido,/Pedido entregue/);
  assert.match(pedido,/Avaliar/);
});

test("avaliações verificadas exigem compra paga e entregue",()=>{
  for(const marker of ["CREATE TABLE IF NOT EXISTS product_reviews","o.status='paid'","shipping_status!==\"entregue\"","verified_purchase"]){
    assert.ok(server.includes(marker),marker+" ausente");
  }
});

test("pós-venda envia atualizações por e-mail",()=>{
  for(const marker of ["sendShippingUpdateEmail","Pedido em preparação","Pedido enviado","Pedido entregue","payer_email"]){
    assert.ok(server.includes(marker),marker+" ausente");
  }
});

test("cupom é invalidado quando o carrinho muda",()=>{
  const saveStart=script.indexOf("function save()");
  const saveEnd=script.indexOf("/* =========================",saveStart);
  const saveBlock=script.slice(saveStart,saveEnd);
  assert.ok(saveBlock.includes("appliedCoupon=null"));
  assert.ok(saveBlock.includes("Aplique o cupom novamente"));
});
