import { Types } from "mongoose";
import { OrderDocument, order_Model } from "../Models/order.models.js";
import { cartModel, cart_Model } from "../Models/cart.model.js";
import { IProductDocument, product_Model } from "../Models/product.model.js";
import { userModel, userSchema } from "../Models/user.model.js";
import { nodeCache } from "../index.js";

interface twelveMonthDataCalculationProps {
  users?: boolean;
  revenue?: boolean;
  discount?: boolean;
}
interface sixMonthDataCalculationProps {
  dashboard?: boolean;
  bar?: boolean;
}
interface revalidateCacheProps {
  product?: boolean;
  admin?: boolean;
  order?: boolean;
  cart?: boolean;
  user?: boolean;
  id?: string;
}

// But Instead of doing the things like this.
// The shorter way could be,
// While placing an order from the frontend , the whole cartItem Array state of the fronted can be sent.
// Inside the cartItems array , inside each product Object it's corresponding quantity can also be sent.
export const reduceStock = async (id: Types.ObjectId) => {
  const orderModel = await order_Model.findById(id).populate("cartItems");
  // let totalOrderQuantity: number = 0;

  const cartSchemasId = orderModel?.cartItems.map((cartItem) => cartItem._id);

  if (cartSchemasId) {
    // Use Promise.all to wait for all asynchronous operations to complete
    await Promise.all(
      cartSchemasId.map(async (schemaId) => {
        const cartItem = await cart_Model
          .findById(schemaId)
          .populate("product");

        if (cartItem) {
          console.log("CartItem.quantity Exists");
          // totalOrderQuantity += cartItem.quantity!;

          const product = await product_Model.findById(cartItem.product?._id);

          if (product) {
            product.stock = product.stock - cartItem.quantity!;
            await product.save();
          }
        }
      })
    );
  }
};
export const calculatePercentage = (currNumber: number, prevNumber: number) => {
  if (prevNumber === 0) {
  }
  let percentageChange = ((currNumber - prevNumber) / prevNumber) * 100;

  if (prevNumber < 1) {
    percentageChange = currNumber * 100;
  }

  return percentageChange;
};
export const revalidateCache = ({
  product = false,
  admin = true,
  order = false,
  cart = false,
  user = false,
  id,
}: revalidateCacheProps) => {
  if (admin) {
    const keys = [
      "currentMonthOrder",
      "previousMonthOrder",
      "currentMonthUsers",
      "previousMonthUsers",
      "currentMonthProducts",
      "previousMonthProducts",
      "ALLPRODUCTS",
      "latestFiveOrders",
    ];
    nodeCache.del(keys);
  }

  if (product) {
    const keys = ["all-product", `single-product-${id}`];
    nodeCache.del(keys);
  }
  if (user) {
    const keys = ["all-users", `single-user-${id}`];
    nodeCache.del(keys);
  }
  if (order) {
    const keys = ["all-orders", `single-order-${id}`];
    nodeCache.del(keys);
  }

  if (cart) {
    const keys = `single-user-cartItems-${id}`;
    nodeCache.del(keys);
  }
};

// 6 and 12 months data calculators
export const sixMonthDataCalculation = async ({
  dashboard = false,
  bar = false,
}: sixMonthDataCalculationProps) => {
  // Initialize arrays to store monthly data
  const sixMonthRevenueArray = new Array(6).fill(0);
  const sixMonthTransactionArray = new Array(6).fill(0);
  const sixMonthProductsArray = new Array(6).fill(0);
  const sixMonthUsersArray = new Array(6).fill(0);
  
  // Get current date (today)
  const today = new Date();
  
  // Create month boundaries for the last 6 months
  const monthBoundaries = [];
  
  for (let i = 0; i < 6; i++) {
    // Calculate the month: current month - i
    const monthOffset = i;
    
    // Create date for the first day of the target month
    const firstDayOfMonth = new Date(today);
    firstDayOfMonth.setMonth(today.getMonth() - monthOffset);
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    // Create date for the last day of the target month
    const lastDayOfMonth = new Date(firstDayOfMonth);
    lastDayOfMonth.setMonth(firstDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(0); // Sets to last day of the month
    lastDayOfMonth.setHours(23, 59, 59, 999);
    
    // For the current month (i=0), use today as the end date
    if (i === 0) {
      lastDayOfMonth.setTime(today.getTime());
      lastDayOfMonth.setHours(23, 59, 59, 999);
    }
    
    monthBoundaries.push({
      startDate: new Date(firstDayOfMonth),
      endDate: new Date(lastDayOfMonth)
    });
  }
  
  // Process each month's data
  for (let i = 0; i < 6; i++) {
    const { startDate, endDate } = monthBoundaries[i];
    
    // Arrays are filled in reverse chronological order (most recent month first)
    const arrayIndex = i;
    
    let data: IProductDocument[] = [];
    let user: userSchema[] = [];
    let transaction: OrderDocument[] = [];
    let revenue: number = 0;

    // Query data based on the date range
    if (bar) {
      data = await product_Model.find({
        $and: [
          { createdAt: { $gte: startDate } },
          { createdAt: { $lte: endDate } },
        ],
      });
      user = await userModel.find({
        $and: [
          { createdAt: { $gte: startDate } },
          { createdAt: { $lte: endDate } },
        ],
      });

      // Store results in the appropriate arrays
      sixMonthProductsArray[arrayIndex] = data.length;
      sixMonthUsersArray[arrayIndex] = user.length;
    } else {
      transaction = await order_Model.find({
        $and: [
          { createdAt: { $gte: startDate } },
          { createdAt: { $lte: endDate } },
        ],
      });
      
      // Calculate revenue
      revenue = transaction.reduce(
        (acc, curr) =>
          (acc +=
            curr.total - (curr.tax + curr.shippingCharge + curr.discount)),
        0
      );

      // Store results in the appropriate arrays
      sixMonthTransactionArray[arrayIndex] = transaction.length;
      sixMonthRevenueArray[arrayIndex] = revenue;
    }
  }

  sixMonthRevenueArray.reverse();
  sixMonthTransactionArray.reverse();

  // Return the appropriate data based on the parameters
  return bar ? 
    { sixMonthProductsArray, sixMonthUsersArray } : 
    { sixMonthRevenueArray, sixMonthTransactionArray };
};
export const calculatePreviousDataArray3 = async () => {
  const twelveMonthPreviousDate = new Date();
  twelveMonthPreviousDate.setMonth(twelveMonthPreviousDate.getMonth() - 12);
  twelveMonthPreviousDate.setDate(1);

  const twelveMonthUserArray = new Array(12).fill(0);
  const twelveMonthOrderArray = new Array(12).fill(0);

  for (let i = 0; i < 12; i++) {
    twelveMonthPreviousDate.setMonth(twelveMonthPreviousDate.getMonth() + 1);
    const endDate = new Date(twelveMonthPreviousDate);
    endDate.setMonth(twelveMonthPreviousDate.getMonth() + 1);
    endDate.setDate(0);

    const data = await order_Model.find({
      $and: [
        { createdAt: { $gte: twelveMonthPreviousDate } },
        { createdAt: { $lte: endDate } },
      ],
    });

    twelveMonthOrderArray[i] = data.length;
  }

  return {
    twelveMonthOrderArray,
  };
};
export const twelveMonthLineChartData = async ({
  users = false,
  revenue = false,
  discount = false,
}: twelveMonthDataCalculationProps) => {
  const twelveMonthPreviousDate = new Date();
  twelveMonthPreviousDate.setMonth(twelveMonthPreviousDate.getMonth() - 12);
  twelveMonthPreviousDate.setDate(1);

  const twelveMonthUserArray = new Array(12).fill(0);
  const twelveMonthRevenueArray = new Array(12).fill(0);
  const twelveMonthDiscountArray = new Array(12).fill(0);
  let userData: userSchema[] = [];
  let orderData: OrderDocument[] = [];
  let discountSum: number = 0;
  let revenueSum: number = 0;

  for (let i = 0; i < 12; i++) {
    twelveMonthPreviousDate.setMonth(twelveMonthPreviousDate.getMonth() + 1);
    const endDate = new Date(twelveMonthPreviousDate);
    endDate.setMonth(twelveMonthPreviousDate.getMonth() + 1);
    endDate.setDate(0);

    if (users) {
      userData = await userModel.find({
        $and: [
          { createdAt: { $gte: twelveMonthPreviousDate } },
          { createdAt: { $lte: endDate } },
        ],
      });
    } else {
      orderData = await order_Model.find({
        $and: [
          { createdAt: { $gte: twelveMonthPreviousDate } },
          { createdAt: { $lte: endDate } },
        ],
      });
    }

    if (discount) {
      discountSum = orderData?.reduce((acc, curr) => {
        return (acc += curr.discount);
      }, 0);
    } else {
      revenueSum = orderData?.reduce((acc, curr) => {
        return (acc +=
          curr.total - (curr.discount + curr.shippingCharge + curr.tax));
      }, 0);
    }

    users && (twelveMonthUserArray[i] = userData.length);
    discount && (twelveMonthDiscountArray[i] = discountSum);
    revenue && (twelveMonthRevenueArray[i] = revenueSum);
  }

  return users
    ? twelveMonthUserArray
    : discount
    ? twelveMonthDiscountArray
    : twelveMonthRevenueArray;
};
