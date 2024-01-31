import express from "express";
import {
  allOrders,
  createOrder,
  deleteOrder,
  myOrders,
  singleOrder,
  updateOrder,
} from "../Controllers/order.js";
import { isAdmin } from "../Middlewares/authendication.js";

const orderRouter = express.Router();

// Get Routes
orderRouter.get("/all", isAdmin, allOrders);
orderRouter.get("/my/:id", myOrders);
orderRouter
  .route("/:id")
  .get(singleOrder)
  .put(isAdmin, updateOrder)
  .delete(isAdmin, deleteOrder);

// Post Routes
orderRouter.post("/new", createOrder);

export default orderRouter;
