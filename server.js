const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

const PRODUCTS_FILE = path.join(__dirname, "products.json");

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function adminOnly(req, res, next) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(503).json({ error: "Configure ADMIN_PASSWORD no Render." });
  }
  if (req.headers["x-admin-password"] !== configured) {
    return res.status(401).json({ error: "Senha administrativa inválida." });
  }
  next();
}

app.get("/api/produtos", (req, res) => {
  res.json(readProducts());
});

app.post("/api/produtos", adminOnly, (req, res) => {
  const products = readProducts();
  const body = req.body || {};
  if (!body.n || !body.c || !body.sub || !Number(body.p)) {
    return res.status(400).json({ error: "Nome, categoria, subcategoria e preço são obrigatórios." });
  }
  const product = {
    id: Date.now(),
    n: String(body.n).trim(),
    c: String(body.c).trim(),
    sub: String(body.sub).trim(),
    detail: String(body.detail || "").trim(),
    p: Number(body.p),
    oldPrice: Number(body.oldPrice || 0),
    stock: Math.max(0, Number(body.stock || 0)),
    i: String(body.i || "").trim(),
    rating: Number(body.rating || 0),
    reviews: Math.max(0, Number(body.reviews || 0)),
    shipping: String(body.shipping || "").trim(),
    installments: Math.max(1, Number(body.installments || 10)),
    featured: Boolean(body.featured),
    createdAt: new Date().toISOString()
  };
  products.unshift(product);
  writeProducts(products);
  res.status(201).json(product);
});

app.put("/api/produtos/:id", adminOnly, (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => String(p.id) === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Produto não encontrado." });
  const body = req.body || {};
  products[index] = {
    ...products[index],
    ...body,
    id: products[index].id,
    p: Number(body.p ?? products[index].p),
    oldPrice: Number(body.oldPrice ?? products[index].oldPrice ?? 0),
    stock: Math.max(0, Number(body.stock ?? products[index].stock ?? 0)),
    rating: Number(body.rating ?? products[index].rating ?? 0),
    reviews: Math.max(0, Number(body.reviews ?? products[index].reviews ?? 0)),
    installments: Math.max(1, Number(body.installments ?? products[index].installments ?? 10))
  };
  writeProducts(products);
  res.json(products[index]);
});

app.delete("/api/produtos/:id", adminOnly, (req, res) => {
  const products = readProducts();
  const next = products.filter(p => String(p.id) !== req.params.id);
  if (next.length === products.length) return res.status(404).json({ error: "Produto não encontrado." });
  writeProducts(next);
  res.json({ ok: true });
});

app.post("/api/criar-preferencia", async (req, res) => {
  try {
    const { titulo, preco, quantidade = 1 } = req.body;
    if (!titulo || !preco) return res.status(400).json({ error: "Produto ou preço inválido" });
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [{ title: titulo, quantity: Number(quantidade), unit_price: Number(preco), currency_id: "BRL" }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json(data);
    }
    res.json({ id: data.id, checkout_url: data.init_point, sandbox_url: data.sandbox_init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.get("/api/status", (req, res) => {
  res.json({ status: "VORZELI online" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));
