import express from "express";
import fetch from "node-fetch"; // se usar Node <18, instale: npm install node-fetch
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const CLIENT_ID = "SUA_CLIENT_ID";
const CLIENT_SECRET = "SUA_CLIENT_SECRET";

let token = null;

// 🔑 Função para autenticar e pegar token
async function getToken() {
  const res = await fetch("https://api.ondapay.app/api/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });

  const data = await res.json();
  token = data.token;
  return token;
}

// 💰 Endpoint para criar um PIX
app.post("/api/pagamento", async (req, res) => {
  try {
    if (!token) {
      await getToken();
    }

    const { amount, external_id, email, nome, documento } = req.body;

    const response = await fetch("https://api.ondapay.app/api/v1/deposit/pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        amount: amount,
        external_id: external_id,
        description: "Compra de coins FUTMARKET BR",
        payer: {
          document: documento || "12345678901",
          email: email,
          name: nome
        },
        webhook: "https://seudominio.com/webhook",
        dueDate: "2025-09-25 23:59:59"
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar pagamento" });
  }
});

app.listen(3000, () => {
  console.log("✅ Servidor rodando em http://localhost:3000");
});
