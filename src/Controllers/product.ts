import { NextFunction ,Request, Response } from "express";
import { reqParamsType, tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import {
  createProductRequestBody,
  updateProductRequestBody,
} from "../types/apiTypes.js";
import { ErrorHandler } from "../Middlewares/error.js";
import { product_Model } from "../Models/product.model.js";
import { rm } from "fs";
import { nodeCache } from "../index.js";
import { revalidateCache } from "../Utils/features.js";

interface baseSortingQueryProps {
  price?: { $lte: number };
  sort?: string;
  category?: RegExp;
  name?: RegExp;
}

// revalidate
export const createProduct = tryCatchWrapper(
  async (req: Request<{}, {}, createProductRequestBody>, res, next) => {
    const { name, stock, category, user, price } = req.body;
    const photo = req.file;
    console.log(name, stock, category, user, price, photo);

    if (!name || stock < 0 || !category || !user || !price) {
      return next(
        new ErrorHandler("Fill All The Field For Creating A Product", 400)
      );
    }

    const product = await product_Model.create({
      name,
      stock,
      category,
      user,
      price,
      photo: photo?.path,
    });
    revalidateCache({ product: true });

    console.log("product Created");

    res.status(201).json({
      success: true,
      message: "Product Successfully Created",
      productData: product,
    });
  }
);
// revalidate
export const updateProduct = tryCatchWrapper(
  async (
    req: Request<reqParamsType, {}, updateProductRequestBody>,
    res,
    next
  ) => {
    const { id } = req.params;
    const { name, stock, category, price } = req.body;
    const photo = req.file;

    const product = await product_Model.findById(id);
    if (!product)
      return next(new ErrorHandler("Product ID Does Not Match", 400));

    //  Deleting the old photo from the uploads folder
    if (photo) {
      console.log(process.cwd());
      console.log(product.photo);
      rm(
        `${process.cwd()}/${product?.photo}`,
        { recursive: true, force: true },
        (err) => {
          if (err) {
            throw err;
          }
          console.log(`Old Photo Deleted!`);
        }
      );
    }

    //  Updating data to the database
    await product_Model.findByIdAndUpdate(
      { _id: id },
      {
        $set: { name, stock, category, price, photo: photo?.path },
      }
    );

    revalidateCache({ id, product: true });

    res.status(200).json({
      success: true,
      message: "Product Successfully Updated",
    });
  }
);
// revalidate
export const deleteProduct = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const product = await product_Model.findById(id);
  revalidateCache({ id, product: true });

  if (!product) next(new ErrorHandler("Product ID Does Not Match", 400));

  await product?.deleteOne();
  revalidateCache({ id, product: true });

  res.status(200).json({
    success: true,
    message: "Product Successfully Deleted",
  });
});

// Caching
export const allProducts = tryCatchWrapper(async (req, res, next) => {
  let allProducts;
  if (nodeCache.has("all-product")) {
    allProducts = nodeCache.get("all-product");
  } else {
    allProducts = await product_Model.find();
    nodeCache.set("all-product", allProducts);
  }

  res.status(200).json({
    success: true,
    productData: allProducts,
  });
});
// Caching
export const singleProduct = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;

  let product;
  if (nodeCache.has(`single-product-${id}`)) {
    product = nodeCache.get(`single-product-${id}`);
  } else {
    product = await product_Model.findById(id);
    nodeCache.set(`single-product-${id}`, product);
    if (!product) next(new ErrorHandler("Product ID Does Not Match", 400));
  }

  res.status(200).json({
    success: true,
    productData: product,
  });
});
// Caching
export const sortingAllProducts = tryCatchWrapper(async (req, res, next) => {
  let { price, sort, category, search: name, page } = req.query;
  const caseInsensitiveRegex = new RegExp(category as string, "i");
  const regexPattern = new RegExp(`${name}`, "i");

  category === "undefined" && (category = undefined);
  sort === "undefined" && (sort = undefined);

  // Pagination logic
  let limit = Number(process.env.PRODUCT_PER_PAGE) || 6;
  let skipProducts = +page! * limit;

  const baseSortingQuery: baseSortingQueryProps = {};

  if (price) baseSortingQuery.price = { $lte: +price };
  if (category) baseSortingQuery.category = caseInsensitiveRegex;

  if (name) baseSortingQuery.name = regexPattern;

  const products = await product_Model.find(baseSortingQuery);
  const sortedProducts = await product_Model
    .find(baseSortingQuery)
    .sort(sort ? { price: sort == "asc" ? 1 : -1 } : { createdAt: -1 })
    .limit(limit)
    .skip(skipProducts);

  const totalPages = Math.ceil(products.length / limit);

  res.status(200).json({
    success: true,
    productData: sortedProducts,
    totalPages,
  });
});
export const allCategories = tryCatchWrapper(async (req, res, next) => {
  const allCategories = await product_Model.distinct("category");

  res.status(200).json({
    success: true,
    productData: allCategories,
  });
});
