import express from "express";
import { isAdmin } from "../Middlewares/authendication.js";
import {
  allCategories,
  allProducts,
  createProduct,
  deleteProduct,
  singleProduct,
  sortingAllProducts,
  updateProduct,
} from "../Controllers/product.js";
import uploads from "../Middlewares/multer.js";

const productRouter = express.Router();

// Get Routes
productRouter.get("/all", allProducts);
productRouter.get("/allSorted", sortingAllProducts);
productRouter.get("/allCategory", allCategories);
productRouter
  .route("/:id")
  .get(singleProduct)
  .put(isAdmin, uploads.single("photo"), updateProduct)
  .delete(deleteProduct);

// Post Routes
productRouter.post("/new", isAdmin, uploads.single("photo"), createProduct);

export default productRouter;
