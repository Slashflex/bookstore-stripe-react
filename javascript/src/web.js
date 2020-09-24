const order = require("./order");

module.exports = function (port, frontURL) {
  const express = require("express");
  const cors = require("cors");

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
  const bodyParser = require("body-parser");

  const {
    getCartEntries,
    getStockEntries,
    getOrders,
    confirmOrder,
    initiateOrder,
    moveFromCart,
    moveToCart,
  } = require("./actions");

  const app = express();

  // NOTE: We're not multi-user ready, userId is hardcoded
  const userId = 1;

  app.use(cors({ origin: frontURL }));

  app.get("/cart", async (req, res) => {
    const cartEntries = await getCartEntries(userId);
    res.send(cartEntries);
  });

  app.get("/stock", async (req, res) => {
    const stockEntries = await getStockEntries();
    res.send(stockEntries);
  });

  app.delete("/cart/:cartEntryId", async (req, res) => {
    await moveFromCart(userId, req.params.cartEntryId);
    res.send({ status: "OK", ISBN: req.params.ISBN });
  });

  app.post("/cart/:stockEntryId", async (req, res) => {
    await moveToCart(userId, req.params.stockEntryId);
    res.send({ status: "OK" });
  });

  app.post("/orders/initiate", async (req, res) => {
    const checkout = await initiateOrder(userId);
    res.send(checkout);
  });

  app.post("/confirm/order", async (req, res) => {
    const order = await confirmOrder(userId);
    // TODO
    console.log(order.lines);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.lines.map(el => {
        return {
          price_data: {
            currency: el.currency,
            product_data: {
              name: el.title,
              images: ["https://i.imgur.com/EHyR2nP.png"],
            },
            unit_amount: el.unit_price,
          },
          quantity: el.quantity,
        }
      }),
      mode: "payment",
      success_url: "http://localhost:3000/checkout/success",
      cancel_url: "http://localhost:3000/checkout/failure",
    });

    res.json({ id: session.id });
    // res.json(session);
    // res.json(order.lines);
  });

  app.get("/orders", async (req, res) => {
    const orders = await getOrders(userId);
    res.send(orders);
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
};
