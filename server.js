const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/criar-preferencia", async (req, res) => {
  try {
    const { titulo, preco, quantidade = 1 } = req.body;

    if (!titulo || !preco) {
      return res.status(400).json({ error: "Produto ou preço inválido" });
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [
            {
              title: titulo,
              quantity: Number(quantidade),
              unit_price: Number(preco),
              currency_id: "BRL"
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json(data);
    }

    res.json({
      id: data.id,
      checkout_url: data.init_point,
      sandbox_url: data.sandbox_init_point
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.get("/api/status", (req, res) => {
  res.json({ status: "VORZELI online" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
