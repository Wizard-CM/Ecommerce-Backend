import express from "express";
import { createPayment } from "../Controllers/payment.js";

const paymentRouter = express.Router();

paymentRouter.post("/create",createPayment)

// Other Coupon related Routes

export default paymentRouter;
