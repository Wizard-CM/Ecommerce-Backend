import { ErrorHandler } from "../Middlewares/error.js";
import { cart_Model } from "../Models/cart.model.js";
import { order_Model } from "../Models/order.models.js";
import { product_Model } from "../Models/product.model.js";
import { tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import { reduceStock, revalidateCache } from "../Utils/features.js";
import { nodeCache } from "../index.js";

// revalidate
export const createOrder = tryCatchWrapper(async (req, res, next) => {
  const {
    shippingInfo,
    cartItems,
    subTotal,
    tax,
    discount,
    total,
    userId,
    shippingCharge,
    quantity,
  } = req.body;

  console.log(quantity);

  if (
    !shippingInfo ||
    !cartItems ||
    !subTotal ||
    !tax ||
    !total ||
    !userId ||
    !quantity
  )
    return next(
      new ErrorHandler(
        "All The Information For Placing An Order Is Not Sent",
        400
      )
    );

  const order = await order_Model.create({
    shippingInfo,
    cartItems,
    subTotal,
    tax,
    discount,
    total,
    user: userId,
    shippingCharge,
    quantity,
  });

   await reduceStock(order._id);
  revalidateCache({ order: true });

  res.status(201).json({
    success: true,
    message: "Order Successfully Created",
    orderData: order,
  });
});
// revalidate
export const updateOrder = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const order = await order_Model.findById(id);
  if (!order) return next(new ErrorHandler("Order Id Does Not Match", 400));

  order.status = order.status === "Processing" ? "Shipped" : "Delivered";
  await order.save();

  revalidateCache({ order: true, id });

  res.status(200).json({
    success: true,
    message: "Order Data Successfuully Updated",
  });
});
// revalidate
export const deleteOrder = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const order = await order_Model.findById(id);
  if (!order) return next(new ErrorHandler("Order Id Does Not Match", 400));

  await order.deleteOne();
  revalidateCache({ order: true, id });

  res.status(200).json({
    success: true,
    message: "Order Data Successfuully Deleted",
  });
});

// Caching
export const allOrders = tryCatchWrapper(async (req, res, next) => {
  let allOrders;
  if (nodeCache.has("all-orders")) {
    allOrders = nodeCache.get("all-orders");
  } else {
    allOrders = await order_Model
      .find()
      .populate({
        path: "user",
        select: ["dob", "username"],
      })
      .populate({
        path: "cartItems",
        select: ["quantity", "product"],
        populate: {
          path: "product",
        },
      });
    nodeCache.set("all-orders", allOrders);
  }

  res.status(200).json({
    success: true,
    orderData: allOrders,
  });
});
// Caching
export const singleOrder = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  


  let cartArray = []
   let order = await order_Model.findById(id);
   for (let i = 0; i < order?.cartItems.length!; i++) {
    
    const cartItem = await product_Model.findById(order?.cartItems[i])
    cartArray.push(cartItem)
   }

    if (!order) return next(new ErrorHandler("Order Id Does Not Match", 400));
  

  res.status(200).json({
    success: true,
    orderData: order,
    cartItemData:cartArray
  });
});

// Caching
export const myOrders = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  const orders = await order_Model.find({ user: id });

  if (!orders) return next(new ErrorHandler("No Orders Found", 400));

  res.status(200).json({
    success: true,
    orderData: orders,
  });
});
