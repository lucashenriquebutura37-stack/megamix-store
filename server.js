const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=(), payment=(self)");
  res.setHeader("Cross-Origin-Opener-Policy","same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy","same-origin");
  res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  res.setHeader("X-Permitted-Cross-Domain-Policies","none");
  res.setHeader("Origin-Agent-Cluster","?1");
  res.setHeader("Content-Security-Policy","default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://viacep.com.br; font-src 'self' data:; upgrade-insecure-requests");
  next();
});

const rateBuckets=new Map();
function rateLimit({windowMs=60000,max=120,keyPrefix="global"}={}){
  return (req,res,next)=>{
    const now=Date.now(), key=keyPrefix+":"+(req.ip||req.socket?.remoteAddress||"unknown");
    const current=rateBuckets.get(key);
    if(!current||current.reset<=now){
      rateBuckets.set(key,{count:1,reset:now+windowMs});
      return next();
    }
    current.count++;
    if(current.count>max){
      res.setHeader("Retry-After",String(Math.max(1,Math.ceil((current.reset-now)/1000))));
      return res.status(429).json({error:"Muitas solicitações. Tente novamente em instantes."});
    }
    next();
  };
}
setInterval(()=>{
  const now=Date.now();
  for(const [key,value] of rateBuckets)if(value.reset<=now)rateBuckets.delete(key);
},60000).unref();
app.use("/api/",rateLimit({windowMs:60000,max:180,keyPrefix:"api"}));
app.use("/api/admin/auth",rateLimit({windowMs:15*60*1000,max:12,keyPrefix:"admin-login"}));
app.use("/api/frete/cotar",rateLimit({windowMs:60000,max:30,keyPrefix:"shipping"}));
app.use("/api/criar-preferencia",rateLimit({windowMs:60000,max:15,keyPrefix:"checkout"}));

app.get("/robots.txt",(req,res)=>res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/\n\nSitemap: https://vorzeli.com.br/sitemap.xml\n"));
const xmlEscape=v=>String(v??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]));
app.get("/sitemap.xml",async(req,res)=>{
  // O sitemap nunca deve depender do banco para as páginas essenciais.
  // Assim crawlers continuam recebendo XML válido mesmo durante uma falha do PostgreSQL.
  const root=(process.env.PUBLIC_URL||"https://vorzeli.com.br").replace(/\/$/,"");
  const urls=[
    `<url><loc>${xmlEscape(root+"/")}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${xmlEscape(root+"/pedido.html")}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    `<url><loc>${xmlEscape(root+"/politicas.html")}</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`
  ];
  if(process.env.DATABASE_URL){
    try{
      const r=await pool.query("SELECT id,created_at FROM products ORDER BY id");
      for(const p of r.rows){
        const d=p.created_at?new Date(p.created_at):null;
        const lastmod=d&&!Number.isNaN(d.getTime())?d.toISOString().slice(0,10):"";
        urls.push(`<url><loc>${xmlEscape(root+"/produto/"+p.id)}</loc>${lastmod?`<lastmod>${lastmod}</lastmod>`:""}<changefreq>weekly</changefreq><priority>0.7</priority></url>`);
      }
    }catch(e){console.error("Sitemap: produtos indisponíveis; servindo páginas essenciais.",e);}
  }
  res.status(200);
  res.set("Content-Type","application/xml; charset=utf-8");
  res.set("Cache-Control","public, max-age=300");
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.join("\n")+"\n</urlset>\n");
});

// Somente páginas e recursos públicos podem ser servidos pelo diretório da aplicação.
const publicStatic=express.static(__dirname,{
  dotfiles:"deny",
  index:"index.html",
  etag:true,
  lastModified:true,
  setHeaders:(res,filePath)=>{
    if(/\.(?:svg|png|jpg|jpeg|webp|ico)$/i.test(filePath))res.setHeader("Cache-Control","public, max-age=604800, stale-while-revalidate=86400");
    else if(/\.(?:css|js)$/i.test(filePath))res.setHeader("Cache-Control","public, max-age=3600, stale-while-revalidate=86400");
    else res.setHeader("Cache-Control","no-cache");
  }
});
app.use((req,res,next)=>{
  const publicFile=/^\/(?:[a-z0-9_-]+\.(?:html|css|svg|png|jpg|jpeg|webp|ico)|(?:script|vorzeli-icons)\.js)$/i;
  if(req.path!=="/"&&!publicFile.test(req.path))return next();
  return publicStatic(req,res,next);
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

const htmlEscape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
app.get("/produto/:id",async(req,res)=>{
  try{
    if(!process.env.DATABASE_URL)return res.status(503).send("Loja temporariamente indisponível.");
    const id=Number(req.params.id);
    if(!Number.isInteger(id)||id<=0)return res.status(404).send("Produto não encontrado.");
    const r=await pool.query("SELECT id,name,description,brand,sku,price,image,images,stock FROM products WHERE id=$1",[id]);
    if(!r.rows.length)return res.status(404).send("Produto não encontrado.");
    const p=r.rows[0],root=(process.env.PUBLIC_URL||`${req.protocol}://${req.get("host")}`).replace(/\/$/,"");
    const images=Array.isArray(p.images)?p.images:[],image=p.image||images[0]||root+"/logo-vorzeli.png";
    const title=htmlEscape(p.name+" — VORZELI"),description=htmlEscape((p.description||("Compre "+p.name+" na VORZELI.")).slice(0,160));
    const canonical=root+"/produto/"+p.id,price=Number(p.price).toFixed(2);
    const schema=JSON.stringify({"@context":"https://schema.org","@type":"Product","@id":canonical+"#product",name:p.name,description:p.description||undefined,image:[image,...images].filter(Boolean),sku:p.sku||undefined,brand:p.brand?{"@type":"Brand",name:p.brand}:undefined,offers:{"@type":"Offer",url:canonical,priceCurrency:"BRL",price,availability:Number(p.stock)>0?"https://schema.org/InStock":"https://schema.org/OutOfStock",itemCondition:"https://schema.org/NewCondition",seller:{"@type":"Organization",name:"VORZELI"}}});
    res.type("html").send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${htmlEscape(canonical)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="VORZELI"><meta property="og:type" content="product"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${htmlEscape(image)}"><meta property="og:image:alt" content="${htmlEscape(p.name)}"><meta property="og:url" content="${htmlEscape(canonical)}"><meta property="product:price:amount" content="${price}"><meta property="product:price:currency" content="BRL"><meta property="product:availability" content="${Number(p.stock)>0?"in stock":"out of stock"}"><meta property="og:image:secure_url" content="${htmlEscape(image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${htmlEscape(image)}"><script type="application/ld+json">${schema.replace(/</g,"\\u003c")}</script><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Arial;background:#f5f6f8;color:#171717}.wrap{max-width:900px;margin:auto;padding:24px}.logo{width:150px}.card{margin-top:24px;background:#fff;border:1px solid #e7e8ec;border-radius:22px;padding:24px;display:grid;grid-template-columns:minmax(240px,1fr) 1fr;gap:28px}.pic{width:100%;aspect-ratio:1;object-fit:contain;background:#f7f7f8;border-radius:16px}.price{font-size:28px;font-weight:900}.stock{color:#198754;font-weight:800}.btn{display:inline-block;margin-top:16px;padding:13px 18px;background:#ff5a1f;color:#fff;text-decoration:none;border-radius:12px;font-weight:800}@media(max-width:650px){.card{grid-template-columns:1fr;padding:16px}.wrap{padding:16px}}</style></head><body><main class="wrap"><a href="/"><img class="logo" src="/logo-vorzeli.png" alt="VORZELI"></a><article class="card"><img class="pic" src="${htmlEscape(image)}" alt="${htmlEscape(p.name)}"><div><h1>${htmlEscape(p.name)}</h1>${p.brand?`<p>Marca: <b>${htmlEscape(p.brand)}</b></p>`:""}<p class="price">${Number(p.price).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p><p class="stock">${Number(p.stock)>0?"Em estoque":"Indisponível"}</p><p>${htmlEscape(p.description||"Confira este produto na VORZELI.")}</p><a class="btn" href="/?produto=${p.id}">Ver na loja</a></div></article></main></body></html>`);
  }catch(e){console.error("Página de produto:",e);res.status(500).send("Não foi possível carregar o produto.");}
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
    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
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
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id BIGINT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL, quantity INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_orders_reservation_expiry ON orders(reservation_expires_at) WHERE stock_reserved=TRUE;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_id_unique ON orders(payment_id) WHERE payment_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE TABLE IF NOT EXISTS order_events (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      detail TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_order_events_order_id_created_at ON order_events(order_id,created_at DESC);
    CREATE TABLE IF NOT EXISTS coupons (
      id BIGSERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_type TEXT NOT NULL CHECK(discount_type IN ('percent','fixed')),
      discount_value NUMERIC(12,2) NOT NULL CHECK(discount_value>0), min_order NUMERIC(12,2) DEFAULT 0,
      active BOOLEAN DEFAULT TRUE, expires_at TIMESTAMPTZ, max_uses INTEGER DEFAULT 0, uses INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS product_reviews (
      id BIGSERIAL PRIMARY KEY, product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      customer_name TEXT DEFAULT '', rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT '', approved BOOLEAN DEFAULT FALSE, verified_purchase BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(product_id,order_id)
    );
    CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id,approved,created_at DESC);
    CREATE TABLE IF NOT EXISTS product_questions (
      id BIGSERIAL PRIMARY KEY, product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT DEFAULT '', question TEXT NOT NULL, answer TEXT DEFAULT '',
      approved BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(), answered_at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id,approved,created_at DESC);
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
  `);
}

function toProduct(row) {
  return { id:Number(row.id), n:row.name, c:row.category, sub:row.subcategory, detail:row.detail||"",
    p:Number(row.price), oldPrice:Number(row.old_price||0), stock:Number(row.stock||0), i:row.image||"",
    rating:Number(row.rating||0), reviews:Number(row.reviews||0), shipping:row.shipping||"",
    installments:Number(row.installments||10), featured:Boolean(row.featured),
    weightKg:Number(row.weight_kg||0), lengthCm:Number(row.length_cm||0), widthCm:Number(row.width_cm||0), heightCm:Number(row.height_cm||0),
    description:row.description||"", sku:row.sku||"", brand:row.brand||"", images:Array.isArray(row.images)?row.images:[], variants:Array.isArray(row.variants)?row.variants:[], tags:Array.isArray(row.tags)?row.tags:[],
    createdAt:row.created_at };
}
const ADMIN_SESSION_TTL_MS=8*60*60*1000;
function adminSessionToken(req){
  const raw=String(req.headers.cookie||"");
  const m=raw.match(/(?:^|;\s*)(?:__Host-vorzeli_admin|vorzeli_admin)=([^;]+)/);
  return m?m[1]:"";
}
const sessionHash=token=>crypto.createHash("sha256").update(String(token)).digest("hex");
async function cleanupAdminSessions(){
  if(!process.env.DATABASE_URL)return;
  try{await pool.query("DELETE FROM admin_sessions WHERE expires_at<=NOW()");}catch(e){console.error("Falha ao limpar sessões administrativas:",e);}
}
async function adminOnly(req,res,next){
  try{
    const configured=process.env.ADMIN_PASSWORD;
    if(!configured)return res.status(503).json({error:"Configure ADMIN_PASSWORD no Render."});
    if(!process.env.DATABASE_URL)return res.status(503).json({error:"Banco de dados indisponível."});
    if(!["GET","HEAD","OPTIONS"].includes(req.method)&&String(req.get("sec-fetch-site")||"").toLowerCase()==="cross-site")return res.status(403).json({error:"Origem não autorizada."});
    if(!["GET","HEAD","OPTIONS"].includes(req.method)){
      const origin=String(req.get("origin")||"");
      if(origin){
        try{if(new URL(origin).host!==req.get("host"))return res.status(403).json({error:"Origem não autorizada."});}
        catch{return res.status(403).json({error:"Origem não autorizada."});}
      }
    }
    const token=adminSessionToken(req);
    if(!token)return res.status(401).json({error:"Sessão administrativa inválida ou expirada."});
    const expiresAt=new Date(Date.now()+ADMIN_SESSION_TTL_MS);
    const result=await pool.query("UPDATE admin_sessions SET expires_at=$2 WHERE token_hash=$1 AND expires_at>NOW() RETURNING token_hash",[sessionHash(token),expiresAt]);
    if(!result.rows.length)return res.status(401).json({error:"Sessão administrativa inválida ou expirada."});
    next();
  }catch(e){console.error("Falha ao validar sessão administrativa:",e);res.status(500).json({error:"Não foi possível validar a sessão administrativa."});}
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
function smtpConfig(){
  const host=process.env.SMTP_HOST||"smtp-relay.brevo.com";
  const port=Number(process.env.SMTP_PORT||587);
  const user=process.env.SMTP_USER||process.env.SMTP_LOGIN||"";
  const pass=process.env.SMTP_PASS||process.env.SMTP_PASSWORD||process.env.SMTP_KEY||"";
  const from=process.env.SMTP_FROM||process.env.SMTP_FROM_EMAIL||"contato@vorzeli.com.br";
  if(!user||!pass)return null;
  return {host,port,user,pass,from};
}
async function sendPaymentConfirmationEmail({to,publicId,total}){
  const cfg=smtpConfig();
  if(!cfg||!to)return false;
  const site=(process.env.PUBLIC_URL||"https://vorzeli.com.br").replace(/\/$/,"");
  const trackingUrl=`${site}/pedido.html?pedido=${encodeURIComponent(publicId)}`;
  const totalFormatted=Number(total).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const safeId=String(publicId).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const transporter=nodemailer.createTransport({host:cfg.host,port:cfg.port,secure:cfg.port===465,auth:{user:cfg.user,pass:cfg.pass}});
  await transporter.sendMail({
    from:`VORZELI <${cfg.from}>`,
    to,
    subject:`Pagamento confirmado — ${publicId}`,
    text:`Pagamento confirmado! Recebemos o pagamento do pedido ${publicId}. Total: ${totalFormatted}. Acompanhe seu pedido: ${trackingUrl}. Obrigado por comprar na VORZELI.`,
    html:`<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#171717"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:#111;padding:24px 28px;color:#fff;font-size:24px;font-weight:800;letter-spacing:.5px">VORZELI</td></tr><tr><td style="padding:30px 28px"><div style="font-size:26px;font-weight:800;margin-bottom:12px">Pagamento confirmado ✓</div><p style="font-size:16px;line-height:1.6;margin:0 0 20px">Recebemos o pagamento do seu pedido e já podemos seguir com a preparação.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f8;border-radius:12px;margin-bottom:24px"><tr><td style="padding:16px"><div style="font-size:13px;color:#666">Pedido</div><div style="font-size:17px;font-weight:700">${safeId}</div></td><td style="padding:16px;text-align:right"><div style="font-size:13px;color:#666">Total</div><div style="font-size:17px;font-weight:700">${totalFormatted}</div></td></tr></table><a href="${trackingUrl}" style="display:inline-block;background:#ff5a1f;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px">Acompanhar meu pedido</a><p style="font-size:13px;line-height:1.6;color:#6b6b6b;margin:26px 0 0">Você receberá novas informações conforme o pedido avançar. Em caso de dúvida, responda a este e-mail.</p></td></tr><tr><td style="padding:18px 28px;border-top:1px solid #eee;color:#777;font-size:12px">VORZELI • Compra simples, acompanhamento fácil.</td></tr></table></td></tr></table></body></html>`
  });
  return true;
}
async function releaseExpiredReservations(){
  if(!process.env.DATABASE_URL)return;
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const expired=await client.query("SELECT id FROM orders WHERE stock_reserved=TRUE AND stock_reduced=FALSE AND status='pending' AND reservation_expires_at<=NOW() ORDER BY reservation_expires_at LIMIT 100 FOR UPDATE SKIP LOCKED");
    for(const order of expired.rows){
      const items=await client.query("SELECT product_id,quantity FROM order_items WHERE order_id=$1",[order.id]);
      for(const item of items.rows)await client.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[item.quantity,item.product_id]);
      await client.query("UPDATE orders SET stock_reserved=FALSE,reservation_expires_at=NULL,status='expired',shipping_status='cancelado' WHERE id=$1",[order.id]);
      await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[order.id,"reservation_expired","Reserva de estoque expirada; estoque devolvido automaticamente."]);
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
      await c.query("UPDATE orders SET stock_reserved=FALSE,reservation_expires_at=NULL,status='cancelled',shipping_status='cancelado' WHERE id=$1",[r.rows[0].id]);
      await c.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[r.rows[0].id,"reservation_cancelled","Reserva cancelada; estoque devolvido automaticamente."]);
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
  const description=clean(b.description??current.description,5000),sku=clean(b.sku??current.sku,100),brand=clean(b.brand??current.brand,120);
  const rawImages=Array.isArray(b.images)?b.images:(Array.isArray(current.images)?current.images:[]),images=rawImages.slice(0,8).map(x=>safeImage(clean(x,1000))).filter(Boolean);
  const rawTags=Array.isArray(b.tags)?b.tags:(Array.isArray(current.tags)?current.tags:[]),tags=[...new Set(rawTags.map(x=>clean(x,40)).filter(Boolean))].slice(0,10);
  const rawVariants=Array.isArray(b.variants)?b.variants:(Array.isArray(current.variants)?current.variants:[]),variants=rawVariants.slice(0,30).map(v=>({name:clean(v?.name,60),value:clean(v?.value,80)})).filter(v=>v.name&&v.value);
  return {values:[name,category,subcategory,clean(b.detail??current.detail,120),price,oldPrice,Math.floor(stock),image,rating,Math.floor(reviews),clean(b.shipping??current.shipping,120),Math.floor(installments),Boolean(b.featured??current.featured),weightKg,lengthCm,widthCm,heightCm],extra:{description,sku,brand,images,tags,variants}};
}

const ADMIN_LOGIN_WINDOW_MS=15*60*1000;
const ADMIN_LOGIN_MAX_ATTEMPTS=8;
const adminLoginAttempts=new Map();
function adminLoginKey(req){return String(req.ip||req.socket?.remoteAddress||"unknown").slice(0,120)}
function adminLoginBlocked(key){
  const now=Date.now(),entry=adminLoginAttempts.get(key);
  if(!entry||now-entry.started>=ADMIN_LOGIN_WINDOW_MS){adminLoginAttempts.set(key,{started:now,count:0});return false}
  return entry.count>=ADMIN_LOGIN_MAX_ATTEMPTS;
}
function recordAdminLoginFailure(key){
  const entry=adminLoginAttempts.get(key)||{started:Date.now(),count:0};
  entry.count++;adminLoginAttempts.set(key,entry);
}
function clearAdminLoginFailures(key){adminLoginAttempts.delete(key)}
function cleanupAdminLoginAttempts(){
  const now=Date.now();
  for(const [key,entry] of adminLoginAttempts)if(now-entry.started>=ADMIN_LOGIN_WINDOW_MS)adminLoginAttempts.delete(key);
}
setInterval(()=>{cleanupAdminSessions();cleanupAdminLoginAttempts();},15*60*1000).unref();

app.use("/api/admin",(req,res,next)=>{res.set("Cache-Control","no-store");next();});

app.post("/api/admin/auth",async(req,res)=>{
  try{
    const configured=process.env.ADMIN_PASSWORD,provided=String(req.headers["x-admin-password"]||""),loginKey=adminLoginKey(req);
    if(!configured)return res.status(503).json({error:"Configure ADMIN_PASSWORD no Render."});
    if(!process.env.DATABASE_URL)return res.status(503).json({error:"Banco de dados indisponível."});
    if(adminLoginBlocked(loginKey)){res.setHeader("Retry-After","900");return res.status(429).json({error:"Muitas tentativas de login. Aguarde alguns minutos."});}
    const a=Buffer.from(provided),b=Buffer.from(configured);
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b)){recordAdminLoginFailure(loginKey);return res.status(401).json({error:"Senha administrativa inválida."});}
    clearAdminLoginFailures(loginKey);
    await cleanupAdminSessions();
    const token=crypto.randomBytes(32).toString("hex");
    await pool.query("INSERT INTO admin_sessions(token_hash,expires_at) VALUES($1,$2)",[sessionHash(token),new Date(Date.now()+ADMIN_SESSION_TTL_MS)]);
    res.setHeader("Set-Cookie",`__Host-vorzeli_admin=${token}; Max-Age=${ADMIN_SESSION_TTL_MS/1000}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    res.json({ok:true});
  }catch(e){console.error("Falha no login administrativo:",e);res.status(500).json({error:"Não foi possível iniciar a sessão administrativa."});}
});
app.post("/api/admin/logout",async(req,res)=>{
  try{const token=adminSessionToken(req);if(token&&process.env.DATABASE_URL)await pool.query("DELETE FROM admin_sessions WHERE token_hash=$1",[sessionHash(token)]);}catch(e){console.error("Falha ao encerrar sessão:",e);}
  res.setHeader("Set-Cookie",["__Host-vorzeli_admin=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict","vorzeli_admin=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"]);
  res.json({ok:true});
});
app.get("/api/admin/session",adminOnly,(req,res)=>res.json({ok:true}));
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
app.get("/api/produtos/:id/avaliacoes",requireDatabase,async(req,res)=>{
  try{if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});const r=await pool.query("SELECT customer_name,rating,comment,verified_purchase,created_at FROM product_reviews WHERE product_id=$1 AND approved=TRUE ORDER BY created_at DESC LIMIT 100",[req.params.id]);const summary=await pool.query("SELECT COALESCE(ROUND(AVG(rating)::numeric,1),0) rating,COUNT(*)::int reviews FROM product_reviews WHERE product_id=$1 AND approved=TRUE",[req.params.id]);res.json({summary:summary.rows[0],items:r.rows});}
  catch(e){console.error("Avaliações:",e);res.status(500).json({error:"Não foi possível carregar avaliações."});}
});
app.post("/api/produtos/:id/avaliacoes",requireDatabase,async(req,res)=>{
  try{
    if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});
    const publicId=clean(req.body?.order_id,80),rating=Number(req.body?.rating),comment=clean(req.body?.comment,1200);
    if(!publicId||!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({error:"Informe o pedido e uma nota de 1 a 5."});
    const o=await pool.query("SELECT o.id,o.customer_name,o.shipping_status FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.public_id=$1 AND oi.product_id=$2 AND o.status='paid' LIMIT 1",[publicId,req.params.id]);
    if(!o.rows.length)return res.status(403).json({error:"Não foi possível confirmar a compra deste produto."});
    if(o.rows[0].shipping_status!=="entregue")return res.status(409).json({error:"A avaliação fica disponível após o pedido ser marcado como entregue."});
    await pool.query("INSERT INTO product_reviews(product_id,order_id,customer_name,rating,comment) VALUES($1,$2,$3,$4,$5) ON CONFLICT(product_id,order_id) DO UPDATE SET rating=EXCLUDED.rating,comment=EXCLUDED.comment,approved=FALSE,created_at=NOW()",[req.params.id,o.rows[0].id,clean(o.rows[0].customer_name,80),rating,comment]);
    res.status(201).json({ok:true,message:"Avaliação recebida e aguardando moderação."});
  }catch(e){console.error("Nova avaliação:",e);res.status(500).json({error:"Não foi possível enviar a avaliação."});}
});
app.get("/api/admin/avaliacoes",adminOnly,requireDatabase,async(req,res)=>{
  try{const r=await pool.query("SELECT r.*,p.name product_name,o.public_id FROM product_reviews r JOIN products p ON p.id=r.product_id JOIN orders o ON o.id=r.order_id ORDER BY r.created_at DESC LIMIT 200");res.json(r.rows);}
  catch(e){console.error(e);res.status(500).json({error:"Não foi possível carregar avaliações."});}
});
app.put("/api/admin/avaliacoes/:id",adminOnly,requireDatabase,async(req,res)=>{
  try{if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Avaliação inválida."});const r=await pool.query("UPDATE product_reviews SET approved=$1 WHERE id=$2 RETURNING product_id",[Boolean(req.body?.approved),req.params.id]);if(!r.rows.length)return res.status(404).json({error:"Avaliação não encontrada."});const productId=r.rows[0].product_id;await pool.query("UPDATE products SET rating=COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM product_reviews WHERE product_id=$1 AND approved=TRUE),0),reviews=(SELECT COUNT(*) FROM product_reviews WHERE product_id=$1 AND approved=TRUE) WHERE id=$1",[productId]);res.json({ok:true});}
  catch(e){console.error(e);res.status(500).json({error:"Não foi possível atualizar a avaliação."});}
});

app.get("/api/produtos/:id/perguntas",requireDatabase,async(req,res)=>{
  try{if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});const r=await pool.query("SELECT id,customer_name,question,answer,created_at,answered_at FROM product_questions WHERE product_id=$1 AND approved=TRUE ORDER BY created_at DESC LIMIT 50",[req.params.id]);res.json(r.rows);}
  catch(e){console.error("Perguntas:",e);res.status(500).json({error:"Não foi possível carregar as perguntas."});}
});
app.post("/api/produtos/:id/perguntas",requireDatabase,async(req,res)=>{
  try{
    if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});
    const name=clean(req.body?.name,80),question=clean(req.body?.question,600);
    if(question.length<5)return res.status(400).json({error:"Escreva uma pergunta com pelo menos 5 caracteres."});
    const p=await pool.query("SELECT id FROM products WHERE id=$1",[req.params.id]);if(!p.rows.length)return res.status(404).json({error:"Produto não encontrado."});
    await pool.query("INSERT INTO product_questions(product_id,customer_name,question) VALUES($1,$2,$3)",[req.params.id,name,question]);
    res.status(201).json({ok:true,message:"Pergunta enviada. Ela aparecerá após análise da VORZELI."});
  }catch(e){console.error("Nova pergunta:",e);res.status(500).json({error:"Não foi possível enviar a pergunta."});}
});
app.get("/api/admin/perguntas",adminOnly,requireDatabase,async(req,res)=>{
  try{const r=await pool.query("SELECT q.*,p.name product_name FROM product_questions q JOIN products p ON p.id=q.product_id ORDER BY q.created_at DESC LIMIT 200");res.json(r.rows);}
  catch(e){console.error(e);res.status(500).json({error:"Não foi possível carregar perguntas."});}
});
app.put("/api/admin/perguntas/:id",adminOnly,requireDatabase,async(req,res)=>{
  try{if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Pergunta inválida."});const answer=clean(req.body?.answer,1200),approved=Boolean(req.body?.approved);const r=await pool.query("UPDATE product_questions SET answer=$1,approved=$2,answered_at=CASE WHEN $1<>'' THEN NOW() ELSE answered_at END WHERE id=$3 RETURNING id",[answer,approved,req.params.id]);if(!r.rows.length)return res.status(404).json({error:"Pergunta não encontrada."});res.json({ok:true});}
  catch(e){console.error(e);res.status(500).json({error:"Não foi possível atualizar a pergunta."});}
});

app.post("/api/produtos",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const checked=validateProductInput(req.body||{});
    if(checked.error)return res.status(400).json({error:checked.error});
    const r=await pool.query(`INSERT INTO products(name,category,subcategory,detail,price,old_price,stock,image,rating,reviews,shipping,installments,featured,weight_kg,length_cm,width_cm,height_cm,description,sku,brand,images,variants,tags) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb,$22::jsonb,$23::jsonb) RETURNING *`,[...checked.values,checked.extra.description,checked.extra.sku,checked.extra.brand,JSON.stringify(checked.extra.images),JSON.stringify(checked.extra.variants),JSON.stringify(checked.extra.tags)]);
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
    const r=await pool.query(`UPDATE products SET name=$1,category=$2,subcategory=$3,detail=$4,price=$5,old_price=$6,stock=$7,image=$8,rating=$9,reviews=$10,shipping=$11,installments=$12,featured=$13,weight_kg=$14,length_cm=$15,width_cm=$16,height_cm=$17,description=$18,sku=$19,brand=$20,images=$21::jsonb,variants=$22::jsonb,tags=$23::jsonb WHERE id=$24 RETURNING *`,[...checked.values,checked.extra.description,checked.extra.sku,checked.extra.brand,JSON.stringify(checked.extra.images),JSON.stringify(checked.extra.variants),JSON.stringify(checked.extra.tags),req.params.id]);
    res.json(toProduct(r.rows[0]));
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao atualizar produto."});}
});
app.delete("/api/produtos/:id",adminOnly,requireDatabase,async(req,res)=>{
  try{if(!/^\d+$/.test(String(req.params.id)))return res.status(400).json({error:"Produto inválido."});const r=await pool.query("DELETE FROM products WHERE id=$1 RETURNING id",[req.params.id]);if(!r.rows.length)return res.status(404).json({error:"Produto não encontrado."});res.json({ok:true});}
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

app.post("/api/cupom/validar",requireDatabase,async(req,res)=>{
  try{
    const code=clean(req.body?.code,40).toUpperCase(),subtotal=finite(req.body?.subtotal,0,99999999);
    if(!code||subtotal===null)return res.status(400).json({error:"Cupom inválido."});
    const r=await pool.query("SELECT * FROM coupons WHERE UPPER(code)=$1 AND active=TRUE AND (expires_at IS NULL OR expires_at>NOW()) AND (max_uses=0 OR uses<max_uses) LIMIT 1",[code]);
    if(!r.rows.length)return res.status(404).json({error:"Cupom inválido ou expirado."});const c=r.rows[0];
    if(subtotal<Number(c.min_order||0))return res.status(409).json({error:"Este cupom exige compra mínima de "+Number(c.min_order).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"."});
    const discount=c.discount_type==="percent"?subtotal*Math.min(Number(c.discount_value),100)/100:Math.min(Number(c.discount_value),subtotal);
    res.json({ok:true,code:c.code,discount:Number(discount.toFixed(2))});
  }catch(e){console.error(e);res.status(500).json({error:"Não foi possível validar o cupom."});}
});
app.get("/api/admin/cupons",adminOnly,requireDatabase,async(req,res)=>{try{const r=await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");res.json(r.rows);}catch(e){res.status(500).json({error:"Erro ao carregar cupons."});}});
app.post("/api/admin/cupons",adminOnly,requireDatabase,async(req,res)=>{
 try{const code=clean(req.body?.code,40).toUpperCase(),type=req.body?.discount_type==="fixed"?"fixed":"percent",value=finite(req.body?.discount_value,0.01,999999),min=finite(req.body?.min_order??0,0,99999999),max=Math.floor(finite(req.body?.max_uses??0,0,1000000)??0);if(!code||value===null||min===null)return res.status(400).json({error:"Dados do cupom inválidos."});const exp=req.body?.expires_at?new Date(req.body.expires_at):null;if(exp&&Number.isNaN(exp.getTime()))return res.status(400).json({error:"Validade inválida."});const q=await pool.query("INSERT INTO coupons(code,discount_type,discount_value,min_order,max_uses,expires_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",[code,type,value,min,max,exp]);res.status(201).json(q.rows[0]);}catch(e){if(e.code==="23505")return res.status(409).json({error:"Já existe um cupom com este código."});res.status(500).json({error:"Erro ao criar cupom."});}
});
app.patch("/api/admin/cupons/:id",adminOnly,requireDatabase,async(req,res)=>{try{const r=await pool.query("UPDATE coupons SET active=$1 WHERE id=$2 RETURNING id,active",[Boolean(req.body?.active),req.params.id]);if(!r.rows.length)return res.status(404).json({error:"Cupom não encontrado."});res.json(r.rows[0]);}catch(e){res.status(500).json({error:"Erro ao atualizar cupom."});}});

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
    let coupon=null,discount=0;
    const couponCode=clean(req.body?.coupon_code,40).toUpperCase();
    if(couponCode){
      const cr=await client.query("SELECT * FROM coupons WHERE UPPER(code)=$1 AND active=TRUE AND (expires_at IS NULL OR expires_at>NOW()) AND (max_uses=0 OR uses<max_uses) LIMIT 1",[couponCode]);
      if(!cr.rows.length)return res.status(409).json({error:"O cupom não está mais disponível."});
      coupon=cr.rows[0];if(productsTotal<Number(coupon.min_order||0))return res.status(409).json({error:"O valor do carrinho não atende à compra mínima do cupom."});
      discount=coupon.discount_type==="percent"?productsTotal*Math.min(Number(coupon.discount_value),100)/100:Math.min(Number(coupon.discount_value),productsTotal);discount=Number(discount.toFixed(2));
    }
    const requestedShippingId=clean(req.body?.shipping_service_id,40);
    if(!requestedShippingId)return res.status(400).json({error:"Escolha uma opção de frete."});
    const shippingQuotes=await quoteShipping(postalCode,normalized,pr.rows);
    const selectedShipping=shippingQuotes.find(q=>q.id===requestedShippingId);
    if(!selectedShipping)return res.status(400).json({error:"A opção de frete escolhida não está mais disponível. Calcule novamente."});
    const total=Math.max(0.01,productsTotal-discount)+selectedShipping.price;
    let reservationCommitted=false,paymentRequestStarted=false,reservationCompensated=false;
    const publicId="VZ-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();
    await client.query("BEGIN");
    const locked=await client.query("SELECT id,name,price,stock FROM products WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE",[ids]);
    const lockedStock=new Map(locked.rows.map(r=>[Number(r.id),Number(r.stock)]));
    const lockedById=new Map(locked.rows.map(r=>[Number(r.id),r]));
    for(const it of items){const current=lockedById.get(Number(it.id));if(!current||Number(current.price)!==Number(it.unit_price))throw Object.assign(new Error("O preço de um produto mudou. Atualize o carrinho e tente novamente."),{status:409});}
    for(const x of normalized)if((lockedStock.get(x.id)??0)<x.q)throw Object.assign(new Error("O estoque mudou. Atualize o carrinho e tente novamente."),{status:409});
    for(const x of normalized){
      const reserved=await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock >= $1 RETURNING id",[x.q,x.id]);
      if(!reserved.rows.length)throw Object.assign(new Error("O estoque mudou enquanto você finalizava a compra. Atualize o carrinho e tente novamente."),{status:409});
    }
    const or=await client.query(`INSERT INTO orders(public_id,total,stock_reserved,reservation_expires_at,customer_name,customer_phone,postal_code,address_line,address_number,address_extra,neighborhood,city,state,shipping_service_id,shipping_service_name,shipping_company,shipping_price,shipping_delivery_time)
      VALUES($1,$2,TRUE,NOW() + INTERVAL '30 minutes',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
      [publicId,total,customerName,customerPhone,postalCode,addressLine,addressNumber,addressExtra,neighborhood,city,state,selectedShipping.id,selectedShipping.name,selectedShipping.company,selectedShipping.price,selectedShipping.delivery_time]);
    for(const it of items)await client.query("INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity) VALUES($1,$2,$3,$4,$5)",[or.rows[0].id,Number(it.id),it.title,it.unit_price,it.quantity]);
    await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[or.rows[0].id,"created","Pedido criado e estoque reservado."]);
    if(coupon)await client.query("UPDATE coupons SET uses=uses+1 WHERE id=$1",[coupon.id]);
    await client.query("COMMIT");
    reservationCommitted=true;
    const root=baseUrl(req);
    const preferenceStart=new Date(),preferenceEnd=new Date(preferenceStart.getTime()+30*60*1000);
    paymentRequestStarted=true;
    const mp=await fetch("https://api.mercadopago.com/checkout/preferences",{method:"POST",signal:externalSignal(),headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`},body:JSON.stringify({expires:true,expiration_date_from:preferenceStart.toISOString(),expiration_date_to:preferenceEnd.toISOString(),items:[...items.map(x=>({...x,unit_price:discount?Number((x.unit_price*(1-discount/productsTotal)).toFixed(2)):x.unit_price})),{id:"frete",title:"Frete - "+(selectedShipping.company?selectedShipping.company+" ":"")+selectedShipping.name,quantity:1,unit_price:selectedShipping.price,currency_id:"BRL"}],external_reference:publicId,back_urls:{success:`${root}/sucesso.html`,failure:`${root}/pagamento.html?status=failure`,pending:`${root}/pagamento.html?status=pending`},auto_return:"approved",notification_url:`${root}/api/mercadopago/webhook`})});
    let data;try{data=await mp.json();}catch{data={};}if(!mp.ok){await cancelReservedOrder(publicId);reservationCompensated=true;throw Object.assign(new Error("Mercado Pago recusou a preferência."),{details:data});}
    res.json({order_id:publicId,checkout_url:data.init_point,sandbox_url:data.sandbox_init_point});
  }catch(e){try{await client.query("ROLLBACK")}catch{};if(typeof publicId!=="undefined"&&publicId&&reservationCommitted&&!paymentRequestStarted&&!reservationCompensated){try{await cancelReservedOrder(publicId);}catch(cancelError){console.error("Falha ao compensar reserva:",cancelError);}}console.error(e.details||e);res.status(e.status||500).json({error:e.status?e.message:"Não foi possível iniciar o pagamento."});}
  finally{client.release();}
});

app.post("/api/admin/email-teste",adminOnly,async(req,res)=>{
  try{
    const cfg=smtpConfig();
    if(!cfg)return res.status(503).json({error:"SMTP não configurado no servidor."});
    const to=clean(req.body?.email,240);
    if(!to||!to.includes("@"))return res.status(400).json({error:"Informe um e-mail válido para o teste."});
    const transporter=nodemailer.createTransport({host:cfg.host,port:cfg.port,secure:cfg.port===465,auth:{user:cfg.user,pass:cfg.pass}});
    await transporter.verify();
    await transporter.sendMail({
      from:`VORZELI <${cfg.from}>`,
      to,
      subject:"Teste de e-mail — VORZELI",
      text:"Este é um teste do sistema de e-mails da VORZELI. Se você recebeu esta mensagem, a integração SMTP com a Brevo está funcionando corretamente."
    });
    res.json({ok:true,message:"E-mail de teste enviado com sucesso."});
  }catch(e){
    console.error("Teste SMTP falhou:",e.message);
    res.status(502).json({error:"Não foi possível enviar o e-mail de teste. Verifique as configurações SMTP."});
  }
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
    await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[or.rows[0].id,"test_created","Pedido de teste criado pelo administrador."]);
    await client.query("COMMIT");
    res.status(201).json({ok:true,order_id:publicId,message:"Pedido de teste criado sem cobrança e sem alteração de estoque."});
  }catch(e){try{await client.query("ROLLBACK")}catch{};console.error(e);res.status(500).json({error:"Não foi possível criar o pedido de teste."});}
  finally{client.release();}
});

function validMercadoPagoSignature(req,paymentId){
  const secret=process.env.MP_WEBHOOK_SECRET;
  if(!secret)return false;
  const signature=String(req.headers["x-signature"]||""),requestId=String(req.headers["x-request-id"]||"");
  const parts=Object.fromEntries(signature.split(",").map(x=>x.trim().split("=")).filter(x=>x.length===2));
  if(!parts.ts||!parts.v1)return false;
  const dataId=String(req.query["data.id"]||paymentId||"").toLowerCase();
  const manifest=(dataId?"id:"+dataId+";":"")+(requestId?"request-id:"+requestId+";":"")+"ts:"+parts.ts+";";
  const expected=crypto.createHmac("sha256",secret).update(manifest).digest("hex");
  try{return crypto.timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(parts.v1,"hex"));}catch{return false;}
}

app.post(["/api/mercadopago/webhook","/api/webhook"],async(req,res)=>{
  try{
    const paymentId=req.query["data.id"]||req.body?.data?.id;
    if(!paymentId||!process.env.MP_ACCESS_TOKEN)return res.sendStatus(200);
    if(!/^\d{1,30}$/.test(String(paymentId)))return res.sendStatus(400);
    if(!validMercadoPagoSignature(req,paymentId))return res.sendStatus(401);
    // O simulador oficial de Webhooks do Mercado Pago envia um ID fictício
    // (ex.: 123456) com live_mode=false. A assinatura já foi validada acima,
    // então confirmamos o recebimento sem consultar a API de pagamentos.
    if(req.body?.live_mode===false){
      console.log("Webhook Mercado Pago: notificação de teste recebida.",{type:req.body?.type,action:req.body?.action});
      return res.sendStatus(200);
    }
    const mp=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,{signal:externalSignal(),headers:{Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`}});
    if(!mp.ok)return res.sendStatus(503);
    const pay=await mp.json(), publicId=clean(pay.external_reference,80);
    if(!publicId||!publicId.startsWith("VZ-"))return res.sendStatus(200);
    const client=await pool.connect();
    let confirmationEmail=null;
    try{
      await client.query("BEGIN");
      const or=await client.query("SELECT * FROM orders WHERE public_id=$1 FOR UPDATE",[publicId]);
      if(!or.rows.length){await client.query("ROLLBACK");return res.sendStatus(200);}
      const current=or.rows[0];
      if(pay.status==="approved"&&!["paid","refunded","charged_back"].includes(current.status)){
        const its=await client.query("SELECT * FROM order_items WHERE order_id=$1",[current.id]);
        if(!current.stock_reserved&&!current.stock_reduced){
          for(const it of its.rows){
            const u=await client.query("UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock >= $1 RETURNING id",[it.quantity,it.product_id]);
            if(!u.rows.length)throw new Error("Estoque insuficiente ao confirmar pedido "+publicId);
          }
        }
        await client.query("UPDATE orders SET status='paid',stock_reduced=TRUE,stock_reserved=FALSE,reservation_expires_at=NULL,shipping_status=CASE WHEN shipping_status='aguardando_pagamento' THEN 'preparando' ELSE shipping_status END,payment_id=$1,payer_email=$2,paid_at=NOW() WHERE id=$3",[String(pay.id),clean(pay.payer?.email,240),current.id]);
        confirmationEmail={to:clean(pay.payer?.email,240),publicId,total:Number(current.total)};
        await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[current.id,"payment_approved","Pagamento aprovado pelo Mercado Pago."]);
      }else if(["pending","in_process","authorized"].includes(pay.status)){
        const normalizedStatus=pay.status==="in_process"?"pending":pay.status;
        if(!["paid","refunded","charged_back"].includes(current.status)){
          await client.query("UPDATE orders SET status=$1,payment_id=$2,payer_email=$3 WHERE id=$4",[normalizedStatus,String(pay.id),clean(pay.payer?.email,240),current.id]);
          if(current.status!==normalizedStatus)await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[current.id,"payment_"+normalizedStatus,"Pagamento aguardando confirmação: "+pay.status+"."]);
        }
      }else if(["rejected","cancelled","refunded","charged_back"].includes(pay.status)){
        if(["rejected","cancelled"].includes(pay.status)&&current.status==="paid"){await client.query("COMMIT");return;}
        if((["refunded","charged_back"].includes(pay.status)&&current.stock_reduced)||(["rejected","cancelled"].includes(pay.status)&&current.stock_reserved)){
          const its=await client.query("SELECT * FROM order_items WHERE order_id=$1",[current.id]);
          for(const it of its.rows)await client.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[it.quantity,it.product_id]);
          await client.query("UPDATE orders SET stock_reduced=FALSE,stock_reserved=FALSE,reservation_expires_at=NULL WHERE id=$1",[current.id]);
        }
        await client.query("UPDATE orders SET status=$1,payment_id=$2,payer_email=$3,shipping_status=CASE WHEN $1 IN ('refunded','charged_back','cancelled') AND shipping_status<>'entregue' THEN 'cancelado' ELSE shipping_status END WHERE id=$4",[pay.status,String(pay.id),clean(pay.payer?.email,240),current.id]);
        await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[current.id,"payment_"+pay.status,"Pagamento atualizado para: "+pay.status+"."]);
      }
      await client.query("COMMIT");
      if(confirmationEmail)sendPaymentConfirmationEmail(confirmationEmail).catch(e=>console.error("Falha ao enviar confirmação por e-mail:",e.message));
      return res.sendStatus(200);
    }catch(e){await client.query("ROLLBACK");console.error(e);if(!res.headersSent)return res.sendStatus(500);}finally{client.release();}
  }catch(e){console.error("Webhook Mercado Pago:",e);if(!res.headersSent)return res.sendStatus(500);}
});

app.get("/api/pedidos",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const r=await pool.query(`SELECT o.*,COALESCE(json_agg(json_build_object('name',oi.product_name,'quantity',oi.quantity,'unit_price',oi.unit_price) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]') items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`);
    res.json(r.rows.map(o=>({...o,total:Number(o.total)})));
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao carregar pedidos."});}
});
app.get("/api/pedidos/:publicId/eventos",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const publicId=clean(req.params.publicId,80);
    const order=await pool.query("SELECT id FROM orders WHERE public_id=$1",[publicId]);
    if(!order.rows.length)return res.status(404).json({error:"Pedido não encontrado."});
    const events=await pool.query("SELECT event_type,detail,created_at FROM order_events WHERE order_id=$1 ORDER BY created_at ASC,id ASC",[order.rows[0].id]);
    res.set("Cache-Control","no-store");
    res.json(events.rows);
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao carregar histórico do pedido."});}
});

app.patch("/api/pedidos/:publicId/envio",adminOnly,requireDatabase,async(req,res)=>{
  try{
    const allowed=["aguardando_pagamento","preparando","enviado","entregue","cancelado"];
    const shippingStatus=clean(req.body?.shipping_status,40), trackingCode=clean(req.body?.tracking_code,120);
    if(!allowed.includes(shippingStatus))return res.status(400).json({error:"Status de envio inválido."});
    if(shippingStatus==="enviado"&&!trackingCode)return res.status(400).json({error:"Informe o código de rastreio antes de marcar o pedido como enviado."});
    const publicId=clean(req.params.publicId,80);
    const current=await pool.query("SELECT status,shipping_status,is_test FROM orders WHERE public_id=$1",[publicId]);
    if(!current.rows.length)return res.status(404).json({error:"Pedido não encontrado."});
    if(!current.rows[0].is_test&&["enviado","entregue"].includes(shippingStatus)&&current.rows[0].status!=="paid")return res.status(409).json({error:"Somente pedidos pagos podem ser marcados como enviados ou entregues."});
    if(current.rows[0].shipping_status==="entregue"&&shippingStatus!=="entregue")return res.status(409).json({error:"Pedido já entregue. O status não pode ser retrocedido automaticamente."});
    if(current.rows[0].shipping_status==="enviado"&&["aguardando_pagamento","preparando"].includes(shippingStatus))return res.status(409).json({error:"Pedido já enviado. O status não pode voltar para uma etapa anterior."});
    const client=await pool.connect();
    try{
      await client.query("BEGIN");
      const r=await client.query("UPDATE orders SET shipping_status=$1,tracking_code=$2,shipped_at=CASE WHEN $1='enviado' AND shipped_at IS NULL THEN NOW() ELSE shipped_at END,delivered_at=CASE WHEN $1='entregue' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END WHERE public_id=$3 RETURNING id,public_id,shipping_status,tracking_code,shipped_at,delivered_at",[shippingStatus,trackingCode,publicId]);
      if(!r.rows.length){await client.query("ROLLBACK");return res.status(404).json({error:"Pedido não encontrado."});}
      const previous=current.rows[0].shipping_status;
      if(previous!==shippingStatus)await client.query("INSERT INTO order_events(order_id,event_type,detail) VALUES($1,$2,$3)",[r.rows[0].id,"shipping_status","Envio: "+previous+" -> "+shippingStatus]);
      await client.query("COMMIT");
      const {id,...result}=r.rows[0];res.json(result);
    }catch(e){try{await client.query("ROLLBACK")}catch{};throw e;}finally{client.release();}
  }catch(e){console.error(e);res.status(500).json({error:"Erro ao atualizar envio."});}
});

app.get("/api/pedido/:publicId",requireDatabase,async(req,res)=>{
  try{const r=await pool.query("SELECT public_id,status,total,shipping_status,tracking_code,shipping_service_name,shipping_company,shipping_price,shipping_delivery_time,created_at,paid_at,shipped_at,delivered_at FROM orders WHERE public_id=$1",[clean(req.params.publicId,80)]);if(!r.rows.length)return res.status(404).json({error:"Pedido não encontrado."});res.json({...r.rows[0],total:Number(r.rows[0].total),shipping_price:Number(r.rows[0].shipping_price||0),shipping_delivery_time:Number(r.rows[0].shipping_delivery_time||0)});}
  catch(e){res.status(500).json({error:"Erro ao consultar pedido."});}
});

app.get("/healthz",(req,res)=>{res.set("Cache-Control","no-store");res.status(200).json({status:"ok",service:"VORZELI",uptime_seconds:Math.floor(process.uptime()),timestamp:new Date().toISOString()});});

app.get("/api/status",async(req,res)=>{
  let database=false,dbLatencyMs=null;
  try{if(process.env.DATABASE_URL){const started=Date.now();await pool.query("SELECT 1");dbLatencyMs=Date.now()-started;database=true;}}catch{}
  const checks={
    database,
    payments:Boolean(process.env.MP_ACCESS_TOKEN),
    shipping:Boolean(process.env.MELHOR_ENVIO_TOKEN),
    public_url:Boolean(process.env.PUBLIC_URL),
    webhook_signature:Boolean(process.env.MP_WEBHOOK_SECRET),
    admin_password:Boolean(process.env.ADMIN_PASSWORD),
    smtp_email:Boolean(smtpConfig())
  };
  const required=["database","payments","shipping","public_url","webhook_signature","admin_password"];
  const missing=required.filter(k=>!checks[k]);
  const healthy=missing.length===0;
  res.set("Cache-Control","no-store");
  res.status(healthy?200:503).json({status:healthy?"ok":"degraded",service:"VORZELI",...checks,missing,db_latency_ms:dbLatencyMs,uptime_seconds:Math.floor(process.uptime()),timestamp:new Date().toISOString()});
});

const PORT=process.env.PORT||3000;
initDatabase().then(()=>{releaseExpiredReservations();setInterval(releaseExpiredReservations,60000).unref();app.listen(PORT,()=>console.log(`Servidor iniciado na porta ${PORT}`));}).catch(e=>{console.error("Falha ao inicializar banco:",e);process.exit(1);});
