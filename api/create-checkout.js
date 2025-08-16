// api/create-checkout.js
import { Client, Environment } from "@square/square";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { uid, email } = req.body || {};
    if (!uid || !email) return res.status(400).json({ error: "uid and email required" });

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: (process.env.SQUARE_ENVIRONMENT || "sandbox") === "production"
        ? Environment.Production
        : Environment.Sandbox,
    });

    // Build an order with UID in metadata
    const orderReq = {
      order: {
        locationId: process.env.SQUARE_LOCATION_ID, // optional if using Checkout API v2 that derives default
        metadata: { uid }, // <— IMPORTANT: we’ll read this in the webhook
        lineItems: [
          {
            name: "Unhinged Membership",
            quantity: "1",
            basePriceMoney: { amount: 999, currency: "USD" } // $9.99 — change as needed
          }
        ],
        referenceId: uid
      },
      idempotencyKey: `${uid}-${Date.now()}-membership`
    };

    // Create the checkout link
    const { result: orderResult } = await client.ordersApi.createOrder(orderReq);
    const orderId = orderResult.order.id;

    const { result: checkoutResult } = await client.checkoutApi.createCheckout(process.env.SQUARE_LOCATION_ID, {
      idempotencyKey: `${uid}-${Date.now()}-checkout`,
      order: { id: orderId, locationId: process.env.SQUARE_LOCATION_ID },
      redirectUrl: `${req.headers.origin}/profile.html?uid=${encodeURIComponent(uid)}`
    });

    return res.status(200).json({ checkoutUrl: checkoutResult.checkout.checkoutPageUrl });
  } catch (err) {
    console.error("create-checkout error:", err);
    return res.status(500).json({ error: "Failed to create checkout" });
  }
}
