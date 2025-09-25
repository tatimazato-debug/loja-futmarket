// api/pix-checkout.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount, description } = req.body;

    // 1. Obter access_token
    const tokenRes = await fetch("https://api.ondapay.app/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.ONDAPAY_CLIENT_ID,
        client_secret: process.env.ONDAPAY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Não foi possível obter token");

    // 2. Criar o checkout PIX
    const checkoutRes = await fetch("https://api.ondapay.app/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokenData.access_token,
      },
      body: JSON.stringify({
        amount,
        description,
        payment_method: "pix",
        currency: "BRL",
      }),
    });

    const checkoutData = await checkoutRes.json();

    return res.status(200).json({
      qr_code_base64: checkoutData.qr_code_base64 || null,
      qr_code: checkoutData.qr_code || null,
    });

  } catch (err) {
    console.error("Erro no backend:", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
