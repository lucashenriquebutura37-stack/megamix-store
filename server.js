const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  next();
});

app.get("/robots.txt",(req,res)=>res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/\n\nSitemap: https://vorzeli.com.br/sitemap.xml\n"));
app.get("/sitemap.xml",(req,res)=>res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://vorzeli.com.br/</loc><changefreq>daily</changefreq><priority>1.0</priority></url><url><loc>https://vorzeli.com.br/politicas.html</loc><changefreq>monthly</changefreq><priority>0.4</priority></url></urlset>'));

app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function initDatabase() {
  if (!process.env.DATABASE_URL) return console.warn("DATABASE_URL não configurada.");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT NOT NULL,
      detail TEXT DEFAULT '', price NUMERIC(12,2) NOT NULL, old_price NUMERIC(12,2) DEFAULT 0,
      stock INTEGER DEFAULT 0, image TEXT DEFAULT '', rating NUMERIC(2,1) DEFAULT 0,
      reviews INTEGER DEFAULT 0, shipping TEXT DEFAULT '', installments INTEGER DEFAULT 10,
      featured BOOLEAN DEFAULT FALSE, weight_kg NUMERIC(8,3) DEFAULT 0, length_cm NUMERIC(8,2) DEFAULT 0,
      width_cm NUMERIC(8,2) DEFAULT 0, height_cm NUMERIC(8,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8,3) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm NUMERIC(8,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS width_cm NUMERIC(8,2) DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm NUMERIC(8,2) DEFAULT 0;
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY, public_id TEXT UNIQUE NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC(12,2) NOT NULL DEFAULT 0, payment_id TEXT, payer_email TEXT,
      customer_name TEXT DEFAULT '', customer_phone TEXT DEFAULT '', postal_code TEXT DEFAULT '',
      address_line TEXT DEFAULT '', address_number TEXT DEFAULT '', address_extra TEXT DEFAULT '',
      neighborhood TEXT DEFAULT '', city TEXT DEFAULT '', state TEXT DEFAULT '',
      shipping_status TEXT DEFAULT 'aguardando_pagamento', tracking_code TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(), paid_at TIMESTAMPTZ
    );
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_line TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_number TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_extra TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS neighborhood TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'aguardando_pagamento';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_service_id TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_service_name TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_company TEXT DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_delivery_time INTEGER DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_reduced BOOLEAN DEFAULT FALSE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_reserved BOOLEAN DEFAULT FALSE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL, quantity INTEGER NOT NULL
    );
  `);
}

function toProduct(row) {
  return { id:Number(row.id), n:row.name, c:row.category, sub:row.subcategory, detail:row.detail||"",
    p:Number(row.price), oldPrice:Number(row.old_price||0), stock:Number(row.stock||0), i:row.image||"",
    rating:Number(row.rating||0), reviews:Number(row.reviews||0), shipping:row.shipping||"",
    installments:Number(row.installments||10), featured:Boolean(row.featured),
    weightKg:Number(row.weight_kg||0), lengthCm:Number(row.length_cm||0), widthCm:Number(row.width_cm||0), heightCm:Number(row.height_cm||0),
    createdAt:row.created_at };
}
function adminOnly(req,res,next){
  const configured=process.env.ADMIN_PASSWORD;
  if(!configured) return res.status(503).json({error:"Configure ADMIN_PASSWORD no Render."});
  if(req.headers["x-admin-password"]!==configured) return res.status(401).json({error:"Senha administrativa inválida."});
  next();
}
function requireDatabase(req,res,next){
  if(!process.env.DATABASE_URL) return res.status(503).json({error:"Banco de dados indisponível."});
  next();
}
const clean=(v,max=300)=>String(v??"").trim().slice(0,max);
const baseUrl=req=>process.env.PUBLIC_URL ? String(process.env.PUBLIC_URL).replace(/\/$/,"") : `${req.protocol}://${req.get("host")}`;
const SHIPPING_ORIGIN_CEP="29177297";
const STOCK_RESERVATION_MINUTES=30;
const EXTERNAL_TIMEOUT_MS=12000;
const externalSignal=()=>AbortSignal.timeout(EXTERNAL_TIMEOUT_MS);
async function releaseExpiredReservations(){
  if(!process.env.DATABASE_URL)return;
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const expired=await client.query("SELECT id FROM orders WHERE stock_reserved=TRUE AND stock_reduced=FALSE AND reservation_expires_at<=NOW() FOR UPDATE SKIP LOCKED");
    for(const order of expired.rows){
      const items=await client.query("SELECT product_id,quantity FROM order_items WHERE order_id=$1",[order.id]);
      for(const item of items.rows)await client.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[item.quantity,item.product_id]);
      await client.query("UPDATE orders SET stock_reserved=FALSE,status='expired',shipping_status='cancelado' WHERE id=$1",[order.id]);
    }
    await client.query("COMMIT");
  }catch(e){try{await client.query("ROLLBACK")}catch{};console.error("Erro ao liberar reservas expiradas:",e);}
  finally{client.release();}
}
async function cancelReservedOrder(publicId){
  const c=await pool.connect();
  try{
    await c.query("BEGIN");
    const r=await c.query("SELECT id,stock_reserved FROM orders WHERE public_id=$1 FOR UPDATE",[publicId]);
    if(r.rows[0]?.stock_reserved){
      const items=await c.query("SELECT product_id,quantity FROM order_items WHERE order_id=$1",[r.rows[0].id]);
      for(const item of items.rows)await c.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[item.quantity,item.product_id]);
      await c.query("UPDATE orders SET stock_reserved=FALSE,status='cancelled',shipping_status='cancelado' WHERE id=$1",[r.rows[0].id]);
    }
    await c.query("COMMIT");
  }catch(e){try{await c.query("ROLLBACK")}catch{};throw e;}finally{c.release();}
}
const finite=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>{const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
const safeImage=(v)=>{const x=clean(v,1000);if(!x)return "";try{const u=new URL(x);return (u.protocol==="https:"||u.protocol==="http:")?x:""}catch{return ""}};
function validateProductInput(b,current={}){
  const name=clean(b.n??current.n,180),category=clean(b.c??current.c,120),subcategory=clean(b.sub??current.sub,120);
  const price=finite(b.p??current.p,0.01,99999999),oldPrice=finite(b.oldPrice??current.oldPrice??0,0,99999999);
  const stock=finite(b.stock??current.stock??0,0,1000000),rating=finite(b.rating??current.rating??0,0,5);
  const reviews=finite(b.reviews??current.reviews??0,0,100000000),installments=finite(b.installments??current.installments??10,1,48);
  const weightKg=finite(b.weightKg??current.weightKg??0,0,1000),lengthCm=finite(b.lengthCm??current.lengthCm??0,0,1000);
  const widthCm=finite(b.widthCm??current.widthCm??0,0,1000),heightCm=finite(b.heightCm??current.heightCm??0,0,1000);
  if(!name||!category||!subcategory||price===null)return {error:"Nome, categoria, subcategoria e preço válido são obrigatórios."};
  if([oldPrice,stock,rating,reviews,installments,weightKg,lengthCm,widthCm,heightCm].some(x=>x===null))return {error:"Há valores numéricos inválidos no produto."};
  const rawImage=clean(b.i??current.i,1000),image=safeImage(rawImage);
  if(rawImage&&!image)return {error:"A URL da imagem deve começar com http:// ou https://."};
  return {values:[name,category,subcategory,clean(b.detail??current.detail,120),price,oldPrice,Math.floor(stock),image,rating,Math.floor(reviews),clean(b.shipping??current.shipping,120),Math.floor(installments),Boolean(b.featured??current.featured),weightKg,lengthCm,widthCm,heightCm]};
}

app.post("/api/admin/auth",adminOnly,(req,res)=>res.json({ok:true}));
app.get("/api/frete/config",(req,res)=>res.json({origin_postal_code:SHIPPING_ORIGIN_CEP.replace(/(\d{5})(\d{3})/,"$1-$2"),provider:"Melhor Envio",ready_for_quotes:Boolean(process.env.MELHOR_ENVIO_TOKEN),message:process.env.MELHOR_ENVIO_TOKEN?"Integração de frete configurada.":"Configure MELHOR_ENVIO_TOKEN no Render para ativar cotações reais."}));

app.post("/api/frete/cotar",requireDatabase,async(req,res)=>{
  try{
    if(!process.env.MELHOR_ENVIO_TOKEN)return res.status(503).json({error:"Frete ainda não ativado. Configure MELHOR_ENVIO_TOKEN."});
    const destination=clean(req.body?.postal_code,12).replace(/\D/g,"");
    const incoming=Array.isArray(req.body?.items)?req.body.items:[];
    if(destination.length!==8)return res.status(400).json({error:"CEP de destino inválido."});
    if(!incoming.length||incoming.length>50)return res.status(400).json({error:"Carrinho inválido."});
    const normalized=incoming.map(x=>({id:Number(x.id),q:Math.max(1,Math.min(99,Math.floor(Number(x.q)||1)))}));
    const ids=[...new Set(normalized.map(x=>x.id))];
    const pr=await pool.query("SELECT id,name,price,weight_kg,length_cm,width_cm,height_cm FROM products WHERE id = ANY($1::bigint[])",[ids]);
    if(pr.rows.length!==ids.length)return res.status(400).json({error:"Produto não encontrado."});
    const byId=new Map(pr.rows.map(p=>[Number(p.id),p]));
    const products=normalized.map(x=>{
      const p=byId.get(x.id),weight=Number(p.weight_kg),length=Number(p.length_cm),width=Number(p.width_cm),height=Number(p.height_cm);
      if(!(weight>0&&length>0&&width>0&&height>0))throw Object.assign(new Error("Cadastre peso e dimensões de todos os produtos antes de calcular o frete."),{status:409});
      return {id:String(p.id),width,height,length,weight,insurance_value:Number(p.price),quantity:x.q};
    });
    const apiBase=process.env.MELHOR_ENVIO_SANDBOX==="true"?"https://sandbox.melhorenvio.com.br":"https://melhorenvio.com.br";
    const r=await fetch(apiBase+"/api/v2/me/shipment/calculate",{method:"POST",signal:externalSignal(),headers:{
      "Accept":"application/json","Content-Type":"application/json","Authorization":"Bearer "+process.env.MELHOR_ENVIO_TOKEN,
      "User-Agent":process.env.MELHOR_ENVIO_USER_AGENT||"VORZELI (contato da loja)"
    },body:JSON.stringify({from:{postal_code:SHIPPING_ORIGIN_CEP},to:{postal_code:destination},products,options:{receipt:false,own_hand:false}})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:"Não foi possível calcular o frete.",details:data});
    const quotes=(Array.isArray(data)?data:[]).filter(x=>!x.error&&Number(x.custom_price??x.price)>0).map(x=>({
      id:x.id,name:x.name,company:x.company?.name||"",price:Number(x.custom_price??x.price),
      delivery_time:Number((x.custom_delivery_time??x.delivery_time) || 0),currency:"BRL"
    })).sort((a,b)=>a.price-b.price);
    res.json({origin_postal_code:SHIPPING_ORIGIN_CEP,destination_postal_code:destination,quotes});
  }catch(e){console.error(e);res.status(e.status||500).json({error:e.message||"Erro ao calcular frete."});}
});

app.post("/api/admin/frete-teste",adminOnly,async(req,res)=>{
  try{
    if(!process.env.MELHOR_ENVIO_TOKEN)return res.status(503).json({error:"MELHOR_ENVIO_TOKEN não configurado."});
    const destination=clean(req.body?.postal_code,12).replace(/\D/g,"");
    if(destination.length!==8)return res.status(400).json({error:"Informe um CEP de destino válido."});
    const weight=Math.max(0,Number(req.body?.weight_kg||0)),length=Math.max(0,Number(req.body?.length_cm||0));
    const width=Math.max(0,Number(req.body?.width_cm||0)),height=Math.max(0,Number(req.body?.height_cm||0));
    if(!(weight>0&&length>0&&width>0&&height>0))return res.status(400).json({error:"Informe peso e dimensões válidos."});
    const apiBase=process.env.MELHOR_ENVIO_SANDBOX==="true"?"https://sandbox.melhorenvio.com.br":"https://melhorenvio.com.br";
    const r=await fetch(apiBase+"/api/v2/me/shipment/calculate",{method:"POST",signal:externalSignal(),headers:{
      "Accept":"application/json","Content-Type":"application/json","Authorization":"Bearer "+process.env.MELHOR_ENVIO_TOKEN,
      "User-Agent":process.env.MELHOR_ENVIO_USER_AGENT||"VORZELI (loja online)"
    },body:JSON.stringify({from:{postal_code:SHIPPING_ORIGIN_CEP},to:{postal_code:destination},products:[{id:"teste",width,height,length,weight,insurance_value:10,quantity:1}],options:{receipt:false,own_hand:false}})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:"Melhor Envio recusou a cotação.",details:data});
    const quotes=(Array.isArray(data)?data:[]).filter(x=>!x.error&&Number(x.custom_price??x.price)>0).map(x=>({
      id:String(x.id),name:clean(x.name,120),company:clean(x.company?.name,120),price:Number(x.custom_price??x.price),
      delivery_time:Number((x.custom_delivery_time??x.delivery_time)||0)
    })).sort((a,b)=>a.price-b.price);
    res.json({ok:true,environment:process.env.MELHOR_ENVIO_SANDBOX==="true"?"sandbox":"producao",origin_postal_code:SHIPPING_ORIGIN_CEP,quotes});
  }catch(e){console.error("Teste Melhor Envio:",e);res.status(500).json({error:"Falha ao testar a integração de frete."});}
});

app.get("/api/produtos",requireDatabase,async(req,res)=>{
  try{const r=await pool.query("SELECT * FROM products ORDER BY created_at DESC");res.json(r.rows.map(toProduct));}
  catch(e){console.error(e);res.status(500).json({error:"Erro ao carregar produtos."});}
});
app.post("/api/produtos",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const checked=validateProductInput(req.body||{});
    if(checked.error)return res.status(400).json({error:checked.error});
    const r=await pool.query(`INSERT INTO products(name,category,subcategory,detail,price,old_price,stock,image,rating,reviews,shipping,installments,featured,weight_kg,length_cm,width_cm,height_cm) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,checked.values);
    res.status(201).json(toProduct(r.rows[0]));
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao cadastrar produto."});}
});
app.put("/api/produtos/:id",adminOnly,requireDatabase,async(req,res)=>{
  try{
    if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});
    const cur=await pool.query("SELECT * FROM products WHERE id=$1",[req.params.id]);
    if(!cur.rows.length)return res.status(404).json({error:"Produto não encontrado."});
    const checked=validateProductInput(req.body||{},toProduct(cur.rows[0]));
    if(checked.error)return res.status(400).json({error:checked.error});
    const r=await pool.query(`UPDATE products SET name=$1,category=$2,subcategory=$3,detail=$4,price=$5,old_price=$6,stock=$7,image=$8,rating=$9,reviews=$10,shipping=$11,installments=$12,featured=$13,weight_kg=$14,length_cm=$15,width_cm=$16,height_cm=$17 WHERE id=$18 RETURNING *`,[...checked.values,req.params.id]);
    res.json(toProduct(r.rows[0]));
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao atualizar produto."});}
});
app.delete("/api/produtos/:id",adminOnly,requireDatabase,async(req,res)=>{
  try{const r=await pool.query("DELETE FROM products WHERE id=$1 RETURNING id",[req.params.id]);if(!r.rows.length)return res.status(404).json({error:"Produto não encontrado."});res.json({ok:true});}
  catch(e){if(e.code==="23503")return res.status(409).json({error:"Este produto já faz parte de um pedido e não pode ser excluído. Zere o estoque em vez disso."});console.error(e);res.status(500).json({error:"Erro ao excluir produto."});}
});

async function quoteShipping(destination, normalized, productRows){
  if(!process.env.MELHOR_ENVIO_TOKEN)throw Object.assign(new Error("Frete ainda não ativado."),{status:503});
  const byId=new Map(productRows.map(p=>[Number(p.id),p]));
  const shippingProducts=normalized.map(x=>{
    const p=byId.get(x.id),weight=Number(p.weight_kg),length=Number(p.length_cm),width=Number(p.width_cm),height=Number(p.height_cm);
    if(!(weight>0&&length>0&&width>0&&height>0))throw Object.assign(new Error("Produto sem peso ou dimensões cadastradas."),{status:409});
    return {id:String(p.id),width,height,length,weight,insurance_value:Number(p.price),quantity:x.q};
  });
  const apiBase=process.env.MELHOR_ENVIO_SANDBOX==="true"?"https://sandbox.melhorenvio.com.br":"https://melhorenvio.com.br";
  const r=await fetch(apiBase+"/api/v2/me/shipment/calculate",{method:"POST",signal:externalSignal(),headers:{
    "Accept":"application/json","Content-Type":"application/json","Authorization":"Bearer "+process.env.MELHOR_ENVIO_TOKEN,
    "User-Agent":process.env.MELHOR_ENVIO_USER_AGENT||"VORZELI (loja online)"
  },body:JSON.stringify({from:{postal_code:SHIPPING_ORIGIN_CEP},to:{postal_code:destination},products:shippingProducts,options:{receipt:false,own_hand:false}})});
  const data=await r.json();
  if(!r.ok)throw Object.assign(new Error("Não foi possível calcular o frete."),{status:502,details:data});
  return (Array.isArray(data)?data:[]).filter(x=>!x.error&&Number(x.custom_price??x.price)>0).map(x=>({
    id:String(x.id),name:clean(x.name,120),company:clean(x.company?.name,120),price:Number(x.custom_price??x.price),
    delivery_time:Number((x.custom_delivery_time??x.delivery_time)||0)
  }));
}

app.post("/api/criar-preferencia",requireDatabase,async(req,res)=>{
  const client=await pool.connect();
  try{
    if(!process.env.MP_ACCESS_TOKEN)return res.status(503).json({error:"Pagamento não configurado."});
    const incoming=Array.isArray(req.body?.items)?req.body.items:[];
    const customer=req.body?.customer||{};
    const customerName=clean(customer.name,160), customerPhone=clean(customer.phone,40);
    const postalCode=clean(customer.postalCode,12).replace(/\D/g,""), addressLine=clean(customer.address,220);
    const addressNumber=clean(customer.number,40), addressExtra=clean(customer.extra,120);
    const neighborhood=clean(customer.neighborhood,120), city=clean(customer.city,120), state=clean(customer.state,2).toUpperCase();
    if(!customerName||!customerPhone||postalCode.length!==8||!addressLine||!addressNumber||!neighborhood||!city||state.length!==2)
      return res.status(400).json({error:"Preencha corretamente os dados de entrega."});
    if(!incoming.length||incoming.length>50)return res.status(400).json({error:"Carrinho inválido."});
    const normalized=incoming.map(x=>({id:Number(x.id),q:Math.max(1,Math.min(99,Math.floor(Number(x.q)||1)))}));
    if(normalized.some(x=>!Number.isInteger(x.id)))return res.status(400).json({error:"Carrinho inválido."});
    const ids=[...new Set(normalized.map(x=>x.id))];
    const pr=await client.query("SELECT * FROM products WHERE id = ANY($1::bigint[])",[ids]);
    if(pr.rows.length!==ids.length)return res.status(400).json({error:"Um produto não está mais disponível."});
    const byId=new Map(pr.rows.map(r=>[Number(r.id),r]));
    const items=normalized.map(x=>{const p=byId.get(x.id);if(Number(p.stock)<x.q)throw Object.assign(new Error(`Estoque insuficiente para ${p.name}.`),{status:409});return {id:String(p.id),title:p.name,quantity:x.q,unit_price:Number(p.price),currency_id:"BRL"};});
    const productsTotal=items.reduce((s,x)=>s+x.quantity*x.unit_price,0);
    const requestedShippingId=clean(req.body?.shipping_service_id,40);
    if(!requestedShippingId)return res.status(400).json({error:"Escolha uma opção de frete."});
    const shippingQuotes=await quoteShipping(postalCode,normalized,pr.rows);
    const selectedShipping=shippingQuotes.find(q=>q.id===requestedShippingId);
    if(!selectedShipping)return res.status(400).json({error:"A opção de frete escolhida não está mais disponível. Calcule novamente."});
    const total=productsTotal+selectedShipping.price;
    const publicId="VZ-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();
    await client.query("BEGIN");
    const locked=await client.query("SELECT id,stock FROM products WHERE id = ANY($1::bigint[]) FOR UPDATE",[ids]);
    const lockedStock=new Map(locked.rows.map(r=>[Number(r.id),Number(r.stock)]));
    for(const x of normalized)if((lockedStock.get(x.id)??0)<x.q)throw Object.assign(new Error("O estoque mudou. Atualize o carrinho e tente novamente."),{status:409});
    for(const x of normalized){
      const reserved=await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock >= $1 RETURNING id",[x.q,x.id]);
      if(!reserved.rows.length)throw Object.assign(new Error("O estoque mudou enquanto você finalizava a compra. Atualize o carrinho e tente novamente."),{status:409});
    }
    const or=await client.query(`INSERT INTO orders(public_id,total,stock_reserved,reservation_expires_at,customer_name,customer_phone,postal_code,address_line,address_number,address_extra,neighborhood,city,state,shipping_service_id,shipping_service_name,shipping_company,shipping_price,shipping_delivery_time)
      VALUES($1,$2,TRUE,NOW() + INTERVAL '30 minutes',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
      [publicId,total,customerName,customerPhone,postalCode,addressLine,addressNumber,addressExtra,neighborhood,city,state,selectedShipping.id,selectedShipping.name,selectedShipping.company,selectedShipping.price,selectedShipping.delivery_time]);
    for(const it of items)await client.query("INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity) VALUES($1,$2,$3,$4,$5)",[or.rows[0].id,Number(it.id),it.title,it.unit_price,it.quantity]);
    await client.query("COMMIT");
    const root=baseUrl(req);
    const mp=await fetch("https://api.mercadopago.com/checkout/preferences",{method:"POST",signal:externalSignal(),headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`},body:JSON.stringify({items:[...items,{id:"frete",title:"Frete - "+(selectedShipping.company?selectedShipping.company+" ":"")+selectedShipping.name,quantity:1,unit_price:selectedShipping.price,currency_id:"BRL"}],external_reference:publicId,back_urls:{success:`${root}/sucesso.html`,failure:`${root}/pagamento.html?status=failure`,pending:`${root}/pagamento.html?status=pending`},auto_return:"approved",notification_url:`${root}/api/mercadopago/webhook`})});
    let data;try{data=await mp.json();}catch{data={};}if(!mp.ok){await cancelReservedOrder(publicId);throw Object.assign(new Error("Mercado Pago recusou a preferência."),{details:data});}
    res.json({order_id:publicId,checkout_url:data.init_point,sandbox_url:data.sandbox_init_point});
  }catch(e){try{await client.query("ROLLBACK")}catch{};console.error(e.details||e);res.status(e.status||500).json({error:e.status?e.message:"Não foi possível iniciar o pagamento."});}
  finally{client.release();}
});

app.post("/api/admin/pedido-teste",adminOnly,requireDatabase,async(req,res)=>{
  const client=await pool.connect();
  try{
    const customer=req.body?.customer||{};
    const customerName=clean(customer.name,160),customerPhone=clean(customer.phone,40);
    const postalCode=clean(customer.postalCode,12).replace(/\D/g,""),addressLine=clean(customer.address,220);
    const addressNumber=clean(customer.number,40),addressExtra=clean(customer.extra,120);
    const neighborhood=clean(customer.neighborhood,120),city=clean(customer.city,120),state=clean(customer.state,2).toUpperCase();
    if(!customerName||!customerPhone||postalCode.length!==8||!addressLine||!addressNumber||!neighborhood||!city||state.length!==2)
      return res.status(400).json({error:"Preencha corretamente os dados de entrega do teste."});
    const publicId="TESTE-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(2).toString("hex").toUpperCase();
    await client.query("BEGIN");
    const or=await client.query(`INSERT INTO orders(public_id,status,total,customer_name,customer_phone,postal_code,address_line,address_number,address_extra,neighborhood,city,state,shipping_status,is_test)
      VALUES($1,'test',0,$2,$3,$4,$5,$6,$7,$8,$9,$10,'preparando',TRUE) RETURNING id`,
      [publicId,customerName,customerPhone,postalCode,addressLine,addressNumber,addressExtra,neighborhood,city,state]);
    const product=await client.query("SELECT id FROM products ORDER BY id LIMIT 1");
    if(product.rows.length){
      await client.query("INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity) VALUES($1,$2,'ITEM DE TESTE — sem cobrança',0,1)",[or.rows[0].id,product.rows[0].id]);
    }
    await client.query("COMMIT");
    res.status(201).json({ok:true,order_id:publicId,message:"Pedido de teste criado sem cobrança e sem alteração de estoque."});
  }catch(e){try{await client.query("ROLLBACK")}catch{};console.error(e);res.status(500).json({error:"Não foi possível criar o pedido de teste."});}
  finally{client.release();}
});

function validMercadoPagoSignature(req,paymentId){
  const secret=process.env.MP_WEBHOOK_SECRET;
  if(!secret)return true;
  const signature=String(req.headers["x-signature"]||""),requestId=String(req.headers["x-request-id"]||"");
  const parts=Object.fromEntries(signature.split(",").map(x=>x.trim().split("=")).filter(x=>x.length===2));
  if(!parts.ts||!parts.v1)return false;
  const dataId=String(req.query["data.id"]||paymentId||"").toLowerCase();
  const manifest=(dataId?"id:"+dataId+";":"")+(requestId?"request-id:"+requestId+";":"")+"ts:"+parts.ts+";";
  const expected=crypto.createHmac("sha256",secret).update(manifest).digest("hex");
  try{return crypto.timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(parts.v1,"hex"));}catch{return false;}
}

app.post("/api/mercadopago/webhook",async(req,res)=>{
  try{
    const paymentId=req.query["data.id"]||req.body?.data?.id;
    if(!paymentId||!process.env.MP_ACCESS_TOKEN)return res.sendStatus(200);
    if(!validMercadoPagoSignature(req,paymentId))return res.sendStatus(401);
    res.sendStatus(200);
    const mp=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{signal:externalSignal(),headers:{Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`}});
    if(!mp.ok)return;
    const pay=await mp.json(), publicId=pay.external_reference;
    if(!publicId)return;
    const client=await pool.connect();
    try{
      await client.query("BEGIN");
      const or=await client.query("SELECT * FROM orders WHERE public_id=$1 FOR UPDATE",[publicId]);
      if(!or.rows.length){await client.query("ROLLBACK");return;}
      const current=or.rows[0];
      if(pay.status==="approved"&&current.status!=="paid"){
        const its=await client.query("SELECT * FROM order_items WHERE order_id=$1",[current.id]);
        if(!current.stock_reserved&&!current.stock_reduced){
          for(const it of its.rows){
            const u=await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock >= $1 RETURNING id",[it.quantity,it.product_id]);
            if(!u.rows.length)throw new Error("Estoque insuficiente ao confirmar pedido "+publicId);
          }
        }
        await client.query("UPDATE orders SET status='paid',stock_reduced=TRUE,stock_reserved=FALSE,shipping_status=CASE WHEN shipping_status='aguardando_pagamento' THEN 'preparando' ELSE shipping_status END,payment_id=$1,payer_email=$2,paid_at=NOW() WHERE id=$3",[String(pay.id),clean(pay.payer?.email,240),current.id]);
      }else if(["rejected","cancelled","refunded","charged_back"].includes(pay.status)){
        if((["refunded","charged_back"].includes(pay.status)&&current.stock_reduced)||(["rejected","cancelled"].includes(pay.status)&&current.stock_reserved)){
          const its=await client.query("SELECT * FROM order_items WHERE order_id=$1",[current.id]);
          for(const it of its.rows)await client.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[it.quantity,it.product_id]);
          await client.query("UPDATE orders SET stock_reduced=FALSE,stock_reserved=FALSE WHERE id=$1",[current.id]);
        }
        await client.query("UPDATE orders SET status=$1,payment_id=$2,payer_email=$3,shipping_status=CASE WHEN $1 IN ('refunded','charged_back','cancelled') AND shipping_status<>'entregue' THEN 'cancelado' ELSE shipping_status END WHERE id=$4",[pay.status,String(pay.id),clean(pay.payer?.email,240),current.id]);
      }
      await client.query("COMMIT");
    }catch(e){await client.query("ROLLBACK");console.error(e);}finally{client.release();}
  }catch(e){console.error("Webhook Mercado Pago:",e);}
});

app.get("/api/pedidos",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const r=await pool.query(`SELECT o.*,COALESCE(json_agg(json_build_object('name',oi.product_name,'quantity',oi.quantity,'unit_price',oi.unit_price) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]') items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`);
    res.json(r.rows.map(o=>({...o,total:Number(o.total)})));
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao carregar pedidos."});}
});
app.patch("/api/pedidos/:publicId/envio",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const allowed=["aguardando_pagamento","preparando","enviado","entregue","cancelado"];
    const shippingStatus=clean(req.body?.shipping_status,40), trackingCode=clean(req.body?.tracking_code,120);
    if(!allowed.includes(shippingStatus))return res.status(400).json({error:"Status de envio inválido."});
    const r=await pool.query("UPDATE orders SET shipping_status=$1,tracking_code=$2 WHERE public_id=$3 RETURNING public_id,shipping_status,tracking_code",[shippingStatus,trackingCode,clean(req.params.publicId,80)]);
    if(!r.rows.length)return res.status(404).json({error:"Pedido não encontrado."});
    res.json(r.rows[0]);
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao atualizar envio."});}
});

app.get("/api/pedido/:publicId",requireDatabase,async(req,res)=>{
  try{const r=await pool.query("SELECT public_id,status,total,shipping_status,tracking_code,shipping_service_name,shipping_company,shipping_price,shipping_delivery_time,created_at,paid_at FROM orders WHERE public_id=$1",[clean(req.params.publicId,80)]);if(!r.rows.length)return res.status(404).json({error:"Pedido não encontrado."});res.json({...r.rows[0],total:Number(r.rows[0].total),shipping_price:Number(r.rows[0].shipping_price||0),shipping_delivery_time:Number(r.rows[0].shipping_delivery_time||0)});}
  catch(e){res.status(500).json({error:"Erro ao consultar pedido."});}
});

app.get("/api/status",async(req,res)=>{let database=false;try{if(process.env.DATABASE_URL){await pool.query("SELECT 1");database=true;}}catch{}const healthy=database&&Boolean(process.env.MP_ACCESS_TOKEN)&&Boolean(process.env.MELHOR_ENVIO_TOKEN);res.status(healthy?200:503).json({status:healthy?"ok":"degraded",service:"VORZELI",database,payments:Boolean(process.env.MP_ACCESS_TOKEN),shipping:Boolean(process.env.MELHOR_ENVIO_TOKEN),public_url:Boolean(process.env.PUBLIC_URL),webhook_signature:Boolean(process.env.MP_WEBHOOK_SECRET),timestamp:new Date().toISOString()});});

const PORT=process.env.PORT||3000;
initDatabase().then(()=>{releaseExpiredReservations();setInterval(releaseExpiredReservations,60000).unref();app.listen(PORT,()=>console.log(`Servidor iniciado na porta ${PORT}`));}).catch(e=>{console.error("Falha ao inicializar banco:",e);process.exit(1);});
