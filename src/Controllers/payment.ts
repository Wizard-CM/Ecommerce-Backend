import { ErrorHandler } from "../Middlewares/error.js";
import { tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import { stripe } from "../index.js";

export const createPayment = tryCatchWrapper(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) return next(new ErrorHandler("Payment Amount Not Sent", 400));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "inr",
    description: "Ecommerce Website",
    shipping: {
      name: "Random singh",
      address: {
        line1: "510 Townsend St",
        postal_code: "98140",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
    },
  });
  
  res.status(201).json({
    success: true,
    stripe_Secret: paymentIntent.client_secret,
  });
});
