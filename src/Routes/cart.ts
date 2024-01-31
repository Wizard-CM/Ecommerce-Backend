import express from "express";
import {
  addToCart,
  deleteAllCartItemOfAUser,
  deleteCartItem,
  singleUserCartItems,
  updateCartItem,
} from "../Controllers/cart.js";
import { isAdmin } from "../Middlewares/authendication.js";

const cartRouter = express.Router();

// Get Routes
// All the cartItems of a single User
cartRouter.get("/:id", singleUserCartItems);
cartRouter.get("/:id/:productId", updateCartItem);
cartRouter.route("/:id").delete(isAdmin, deleteAllCartItemOfAUser);
cartRouter.route("/:id/:productId").delete(isAdmin, deleteCartItem);

// Post Routes
cartRouter.post("/new", addToCart);

export default cartRouter;
