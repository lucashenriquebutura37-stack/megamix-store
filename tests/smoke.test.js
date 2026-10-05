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

test("cupom percentual não aceita desconto acima de 100%",()=>{
  assert.ok(server.includes('type==="percent"&&value>100'));
  assert.ok(server.includes("Cupom percentual não pode ultrapassar 100%."));
});

test("pedido registra cupom e desconto para auditoria",()=>{
  assert.ok(server.includes("ADD COLUMN IF NOT EXISTS coupon_code"));
  assert.ok(server.includes("ADD COLUMN IF NOT EXISTS discount_amount"));
  assert.ok(server.includes("shipping_delivery_time,coupon_code,discount_amount"));
});

test("reserva de cupom é protegida e liberada em pedidos não pagos",()=>{
  assert.ok(server.includes("LIMIT 1 FOR UPDATE"));
  assert.ok(server.includes("GREATEST(uses-1,0)"));
  assert.ok(server.includes("SELECT id,coupon_code FROM orders WHERE stock_reserved=TRUE"));
  assert.ok(server.includes("SELECT id,stock_reserved,coupon_code FROM orders WHERE public_id=$1 FOR UPDATE"));
});

test("desconto do Mercado Pago é reconciliado em centavos",()=>{
  assert.ok(server.includes("mercadoPagoItemsWithExactDiscount"));
  assert.ok(server.includes("charged!==targetTotal"));
  assert.ok(server.includes("Falha ao reconciliar desconto do carrinho."));
  assert.ok(!server.includes("x.unit_price*(1-discount/productsTotal)"));
});

test("avaliações públicas não expõem nome completo do comprador",()=>{
  assert.ok(server.includes("function publicReviewerName"));
  assert.ok(server.includes("customer_name:publicReviewerName(x.customer_name)"));
  assert.ok(server.includes("items:publicItems"));
});

test("perguntas e avaliações têm proteção anti-spam",()=>{
  assert.ok(server.includes('keyPrefix:"questions"'));
  assert.ok(server.includes('keyPrefix:"reviews"'));
  assert.ok(server.includes('max:8'));
  assert.ok(server.includes('max:6'));
});

test("painel não permite editar manualmente nota e quantidade de avaliações",()=>{
  assert.ok(!admin.includes('id="rating"'));
  assert.ok(!admin.includes('id="reviews"'));
  assert.ok(!admin.includes('rating:$("rating").value'));
  assert.ok(!admin.includes('reviews:$("reviews").value'));
});

test("dashboard administrativo resume operação da loja",()=>{
  assert.ok(server.includes('/api/admin/dashboard'));
  assert.ok(server.includes("paid_orders"));
  assert.ok(server.includes("low_stock"));
  assert.ok(admin.includes('id="dashboard"'));
  assert.ok(admin.includes("loadDashboard"));
});

test("dashboard inclui produtos mais vendidos, cupons e pedidos pendentes",()=>{
  assert.ok(server.includes("top_products"));
  assert.ok(server.includes("top_coupons"));
  assert.ok(server.includes("pending_orders"));
  assert.ok(admin.includes('id="topProducts"'));
  assert.ok(admin.includes('id="topCoupons"'));
});

test("e-mails de pós-venda usam o parâmetro correto de acompanhamento",()=>{
  assert.ok(server.includes('pedido.html?pedido='));
  assert.ok(pedido.includes('params.get("pedido")||params.get("id")'));
});

test("painel mostra cupom e desconto aplicados em cada pedido",()=>{
  assert.ok(admin.includes("<b>Cupom:</b>"));
  assert.ok(admin.includes("o.discount_amount"));
});

test("dashboard alerta quais produtos estão com estoque baixo",()=>{
  assert.ok(server.includes("low_stock_items"));
  assert.ok(server.includes("WHERE stock<=3 ORDER BY stock ASC"));
  assert.ok(admin.includes('id="lowStockItems"'));
});

test("uso de cupom só pode ser devolvido uma vez",()=>{
  assert.ok(server.includes("coupon_released BOOLEAN DEFAULT FALSE"));
  assert.ok(server.includes("!order.coupon_released"));
  assert.ok(server.includes("!r.rows[0].coupon_released"));
  assert.ok(server.includes("coupon_released=TRUE"));
});

test("cupom é travado e revalidado dentro da transação do checkout",()=>{
  const checkout=server.slice(server.indexOf('app.post("/api/criar-preferencia"'),server.indexOf('app.post("/api/admin/email-teste"'));
  const begin=checkout.indexOf('client.query("BEGIN")');
  const couponLock=checkout.indexOf('SELECT * FROM coupons WHERE UPPER(code)=$1 FOR UPDATE');
  assert.ok(begin>=0&&couponLock>begin);
  assert.ok(checkout.includes("max_uses"));
  assert.ok(checkout.includes("expires_at"));
});

test("checkout calcula dinheiro em centavos para evitar divergência de arredondamento",()=>{
  assert.ok(server.includes("function moneyCents(value)"));
  assert.ok(server.includes("productsTotalCents"));
  assert.ok(server.includes("moneyCents(selectedShipping.price)"));
  assert.ok(server.includes("discountCents/100"));
});

test("rate limiting usa armazenamento persistente com fallback em memória",()=>{
  assert.ok(server.includes("CREATE TABLE IF NOT EXISTS rate_limits"));
  assert.ok(server.includes("ON CONFLICT(key) DO UPDATE"));
  assert.ok(server.includes("Rate limit persistente indisponível; usando memória"));
  assert.ok(server.includes("cleanupRateLimits"));
});

test("cabeçalhos de segurança incluem política CSP mais rígida em observação",()=>{
  assert.ok(server.includes("Content-Security-Policy-Report-Only"));
  assert.ok(server.includes("script-src 'self'; style-src"));
  assert.ok(server.includes("X-DNS-Prefetch-Control"));
  assert.ok(server.includes("includeSubDomains; preload"));
});

test("status operacional exige SMTP e sinaliza banco lento sem expor segredos",()=>{
  assert.ok(server.includes('"smtp_email"'));
  assert.ok(server.includes('warnings.push("database_slow")'));
  assert.ok(server.includes('status:healthy?(warnings.length?"warning":"ok"):"degraded"'));
  assert.ok(!server.includes("MP_ACCESS_TOKEN:process.env.MP_ACCESS_TOKEN"));
});

test("API de produtos ignora rating e reviews enviados manualmente",()=>{
  const validation=server.slice(server.indexOf("function validateProductInput"),server.indexOf("const ADMIN_LOGIN_WINDOW_MS"));
  assert.ok(validation.includes("const rating=finite(current.rating??0"));
  assert.ok(validation.includes("reviews=finite(current.reviews??0"));
  assert.ok(!validation.includes("b.rating??current.rating"));
  assert.ok(!validation.includes("b.reviews??current.reviews"));
});

test("moderação de avaliação e recálculo de reputação são atômicos",()=>{
  const start=server.indexOf('app.put("/api/admin/avaliacoes/:id"');
  const end=server.indexOf('app.get("/api/produtos/:id/perguntas"',start);
  const block=server.slice(start,end);
  assert.ok(block.includes('client.query("BEGIN")'));
  assert.ok(block.includes('client.query("COMMIT")'));
  assert.ok(block.includes('client.query("ROLLBACK")'));
  assert.ok(block.includes("AVG(rating)"));
  assert.ok(block.includes("client.release()"));
});

test("textos públicos passam por sanitização antes de serem persistidos",()=>{
  assert.ok(server.includes("const cleanUserText="));
  assert.ok(server.includes("cleanUserText(req.body?.comment,1200)"));
  assert.ok(server.includes("cleanUserText(req.body?.question,600)"));
  assert.ok(server.includes("cleanUserText(req.body?.answer,1200)"));
});
