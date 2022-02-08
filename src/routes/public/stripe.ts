import * as i from "types";
import { Context } from "koa";
import Router from "koa-router";
import Stripe from "stripe";
// const stripe = require("stripe")("sk_test_51KNIKDI7A5ZiMOZz9ZX1ExmIqqmFdA6Vgr1aINAffBfN2xM2Yw815ANVVq8n3JGEXbFQXmLjclcwOLCOdvthoVy000p6lGmnlA");

import contentType from "../../middleware/contentType";

const router = new Router();

router.post("/stripe", contentType.JSON, async (ctx: Context) => {
  const stripe = new Stripe("sk_test_51KNIKDI7A5ZiMOZz9ZX1ExmIqqmFdA6Vgr1aINAffBfN2xM2Yw815ANVVq8n3JGEXbFQXmLjclcwOLCOdvthoVy000p6lGmnlA", {
    apiVersion: "2020-08-27",
    typescript: true,
  });
  const customers = await stripe.customers.list({
    limit: 3,
    expand: ["data.subscriptions"],
  });
  // const customers = await Stripe.CustomersResource({
  //   limit: 3,
  //   expand: ["data.subscription"],
  // });
  ctx.status = 200;
  ctx.body = customers;
});

export default router;
