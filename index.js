const functions = require("firebase-functions");
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 🔑 Suas credenciais da Ondapay
const CLIENT_ID = "9998f236-70c3-49e2-b3ac-76ac76de0ff6";
const CLIENT_SECRET = "yQPbXw2nDxRkbI16E2qH9iW4YTkUHrpH";

// Endpoint para criar um pagamento Pix
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, description } = req.body;

    // 🔐 Obter token de acesso
    const authResponse = await fetch("https://api.ondapay.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const authData = await authResponse.json();
    if (!authData.access_token) {
      throw new Error("Falha ao autenticar com a Ondapay");
    }

    // 💸 Criar pagamento Pix
    const paymentResponse = await fetch("https://api.ondapay.com/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount, // em centavos (ex: 1999 = R$19,99)
        currency: "BRL",
        payment_method: "pix",
        description: description || "Pagamento FUTMARKET",
      }),
    });

    const paymentData = await paymentResponse.json();
    res.json(paymentData);
  } catch (err) {
    console.error("Erro ao criar pagamento:", err);
    res.status(500).send({ error: "Erro ao criar pagamento" });
  }
});

// Exportar a função
exports.api = functions.https.onRequest(app);
