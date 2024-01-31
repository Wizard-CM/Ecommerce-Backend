import { ErrorHandler } from "../Middlewares/error.js";
import { cart_Model } from "../Models/cart.model.js";
import { product_Model } from "../Models/product.model.js";
import { tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import { revalidateCache } from "../Utils/features.js";
import { nodeCache } from "../index.js";

// caching
export const singleUserCartItems = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  let cartItems;

  if (nodeCache.has(`single-user-cartItems-${id}`)) {
    cartItems = nodeCache.get(`single-user-cartItems-${id}`);
  } else {
    cartItems = await cart_Model
      .find({ user: id })
      .populate("product")
      .populate("user");
    nodeCache.set(`single-user-cartItems-${id}`, cartItems);
  }

  res.status(200).json({
    success: true,
    cartItemData: cartItems,
  });
});

// revalidate
export const addToCart = tryCatchWrapper(async (req, res, next) => {
  const { productId, userId } = req.body;
  console.log(productId);
  revalidateCache({ cart: true, id: userId });

  const cartItemExists = await cart_Model.findOne({ product: productId });
  // console.log(cartItemExists.length >= 1)
  if (cartItemExists?._id) {
    cartItemExists.quantity = cartItemExists.quantity + 1;
    await cartItemExists.save();
    revalidateCache({ cart: true, id: userId });
    return res.status(201).json({
      success: true,
      message: "Cart Quantity Successfully Updated",
    });
  }

  if (!productId || !userId)
    return next(new ErrorHandler("Product ID or User ID Is Missing", 400));

  const cartItem = await cart_Model.create({
    product: productId,
    user: userId,
  });

  revalidateCache({ cart: true, id: userId });
  const newCartItem = await cart_Model.findById(cartItem._id);
  if (newCartItem) {
    newCartItem.quantity = newCartItem?.quantity + 1;
    await newCartItem.save();
  }

  res.status(201).json({
    success: true,
    message: "Cart Item Successfully Created",
    cartItemData: cartItem._id,
  });
});

// revalidate
export const updateCartItem = tryCatchWrapper(async (req, res, next) => {
  const { id, productId } = req.params;

  const cartItem = await cart_Model.findOne({
    $and: [{ user: id }, { product: productId }],
  });

  if (cartItem) {
    cartItem.quantity -= 1;
    await cartItem.save();
  }

  revalidateCache({ cart: true, id });

  res.status(200).json({
    success: true,
    message: "CartItem Successfully Updated",
  });
});
// revalidate
export const deleteCartItem = tryCatchWrapper(async (req, res, next) => {
  revalidateCache({ cart: true });
  const { productId, id } = req.params;
  console.log(productId);
  console.log(id);

  const cartItems = await cart_Model.findOne({ product: productId });

  if (cartItems) {
    await cartItems.deleteOne();
  }

  revalidateCache({ cart: true, id });

  res.status(200).json({
    success: true,
    message: "CartItem Successfully Deleted",
  });
});
export const deleteAllCartItemOfAUser = tryCatchWrapper(
  async (req, res, next) => {
    revalidateCache({ cart: true });
    const { id } = req.params;
    console.log(id);

    const cartItems = await cart_Model.find({ user: id });

    cartItems.map(async (i) => {
      const cartItem = await cart_Model.findById(i._id);
      await cartItem?.deleteOne();
    });

    revalidateCache({ cart: true, id });

    res.status(200).json({
      success: true,
      message: "CartItems Of the User Successfully Deleted",
    });
  }
);
