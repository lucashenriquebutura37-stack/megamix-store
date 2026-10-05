const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL não configurada. Cadastros de produtos ficarão indisponíveis.");
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      detail TEXT DEFAULT '',
      price NUMERIC(12,2) NOT NULL,
      old_price NUMERIC(12,2) DEFAULT 0,
      stock INTEGER DEFAULT 0,
      image TEXT DEFAULT '',
      rating NUMERIC(2,1) DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      shipping TEXT DEFAULT '',
      installments INTEGER DEFAULT 10,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

function toProduct(row) {
  return {
    id: Number(row.id), n: row.name, c: row.category, sub: row.subcategory,
    detail: row.detail || "", p: Number(row.price), oldPrice: Number(row.old_price || 0),
    stock: Number(row.stock || 0), i: row.image || "", rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0), shipping: row.shipping || "",
    installments: Number(row.installments || 10), featured: Boolean(row.featured),
    createdAt: row.created_at
  };
}

function adminOnly(req, res, next) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return res.status(503).json({ error: "Configure ADMIN_PASSWORD no Render." });
  if (req.headers["x-admin-password"] !== configured) return res.status(401).json({ error: "Senha administrativa inválida." });
  next();
}

app.post("/api/admin/auth", adminOnly, (req, res) => res.json({ ok: true }));

function requireDatabase(req, res, next) {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: "Configure DATABASE_URL no Render." });
  next();
}

app.get("/api/produtos", requireDatabase, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows.map(toProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao carregar produtos." });
  }
});

app.post("/api/produtos", adminOnly, requireDatabase, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.n || !b.c || !b.sub || !Number(b.p)) return res.status(400).json({ error: "Nome, categoria, subcategoria e preço são obrigatórios." });
    const values = [
      String(b.n).trim(), String(b.c).trim(), String(b.sub).trim(), String(b.detail || "").trim(),
      Number(b.p), Number(b.oldPrice || 0), Math.max(0, Number(b.stock || 0)), String(b.i || "").trim(),
      Number(b.rating || 0), Math.max(0, Number(b.reviews || 0)), String(b.shipping || "").trim(),
      Math.max(1, Number(b.installments || 10)), Boolean(b.featured)
    ];
    const result = await pool.query(
      `INSERT INTO products (name,category,subcategory,detail,price,old_price,stock,image,rating,reviews,shipping,installments,featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, values
    );
    res.status(201).json(toProduct(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar produto." });
  }
});

app.put("/api/produtos/:id", adminOnly, requireDatabase, async (req, res) => {
  try {
    const current = await pool.query("SELECT * FROM products WHERE id=$1", [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ error: "Produto não encontrado." });
    const p = toProduct(current.rows[0]), b = req.body || {};
    const values = [
      String(b.n ?? p.n).trim(), String(b.c ?? p.c).trim(), String(b.sub ?? p.sub).trim(),
      String(b.detail ?? p.detail).trim(), Number(b.p ?? p.p), Number(b.oldPrice ?? p.oldPrice),
      Math.max(0, Number(b.stock ?? p.stock)), String(b.i ?? p.i).trim(), Number(b.rating ?? p.rating),
      Math.max(0, Number(b.reviews ?? p.reviews)), String(b.shipping ?? p.shipping).trim(),
      Math.max(1, Number(b.installments ?? p.installments)), Boolean(b.featured ?? p.featured), req.params.id
    ];
    const result = await pool.query(
      `UPDATE products SET name=$1,category=$2,subcategory=$3,detail=$4,price=$5,old_price=$6,stock=$7,image=$8,rating=$9,reviews=$10,shipping=$11,installments=$12,featured=$13
       WHERE id=$14 RETURNING *`, values
    );
    res.json(toProduct(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

app.delete("/api/produtos/:id", adminOnly, requireDatabase, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Produto não encontrado." });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir produto." });
  }
});

app.post("/api/criar-preferencia", async (req, res) => {
  try {
    const { titulo, preco, quantidade = 1 } = req.body;
    if (!titulo || !preco) return res.status(400).json({ error: "Produto ou preço inválido" });
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      body: JSON.stringify({ items: [{ title: titulo, quantity: Number(quantidade), unit_price: Number(preco), currency_id: "BRL" }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json({ id: data.id, checkout_url: data.init_point, sandbox_url: data.sandbox_init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.get("/api/status", async (req, res) => {
  let database = false;
  if (process.env.DATABASE_URL) {
    try { await pool.query("SELECT 1"); database = true; } catch {}
  }
  res.json({ status: "VORZELI online", database });
});

const PORT = process.env.PORT || 3000;
initDatabase()
  .then(() => app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`)))
  .catch(error => {
    console.error("Falha ao inicializar banco:", error);
    process.exit(1);
  });
