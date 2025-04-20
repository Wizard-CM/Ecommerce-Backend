import express from "express";
import cors from "cors";
import Stripe from "stripe";
import NodeCache from "node-cache";

// Routes Import
import userRouter from "./Routes/user.js";
import { connectDb } from "./Data/dbConnect.js";
import { ErrorMiddleware } from "./Middlewares/error.js";
import productRouter from "./Routes/product.js";
import cartRouter from "./Routes/cart.js";
import orderRouter from "./Routes/order.js";
import chartRouter from "./Routes/chart.js";
import paymentRouter from "./Routes/payment.js";

console.log(process.env.STRIPE_KEY,"stripe key")
console.log(process.env.MONGO_URI,"mongo URI")

// dotenv setup
const STRIPE_KEY = process.env.STRIPE_KEY || "";
const MONGO_URI = process.env.MONGO_URI || "";

connectDb(MONGO_URI);
const app = express();
const port = process.env.PORT;
export const nodeCache = new NodeCache();
export const stripe = new Stripe(STRIPE_KEY);



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))
app.use(cors());

// Routes middlewares
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/chart", chartRouter);
app.use("/api/v1/payment", paymentRouter);

// Error Middleware
app.use(ErrorMiddleware);
app.listen(port, () => {
  console.log(`server Running on ${port}`);
});
