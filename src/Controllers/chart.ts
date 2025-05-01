import { OrderDocument, order_Model } from "../Models/order.models.js";
import { IProductDocument, product_Model } from "../Models/product.model.js";
import { userModel, userSchema } from "../Models/user.model.js";
import { tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import { ChartCaching } from "../Utils/chartCaching.js";
import {
  calculatePercentage,
  calculatePreviousDataArray3,
  revalidateCache,
  sixMonthDataCalculation,
  twelveMonthLineChartData,
} from "../Utils/features.js";

// API Controller Functions
export const dashboardChartData = tryCatchWrapper(async (req, res, next) => {
  const currentMonth = new Date();
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const currentMonthObject = {
    start: new Date(currentMonth.setDate(1)),
    end: new Date(),
  };
  const previousMonthObject = {
    start: new Date(previousMonth.setDate(1)),
    end: new Date(currentMonth.setDate(0)),
  };

  //  ----------------------Order Data for Revenue Calculation and Transaction Calculation ----------------------//

  const currentMonthOrderPromise = order_Model
    .find()
    .select(["total", "tax", "shippingCharge", "discount", "status"]);

  const previousMonthOrderPromise = order_Model
    .find({
      $and: [
        { createdAt: { $gte: previousMonthObject.start } },
        { createdAt: { $lte: previousMonthObject.end } },
      ],
    })
    .select(["total", "tax", "shippingCharge", "discount", "status"]);

  //---------------------------------------------------User Data---------------------------------------------------//
  const currentMonthUsersPromise = userModel.find({
    $and: [
      { createdAt: { $gte: currentMonthObject.start } },
      { createdAt: { $lte: currentMonthObject.end } },
    ],
  });
  const previousMonthUsersPromise = userModel.find({
    $and: [
      { createdAt: { $gte: previousMonthObject.start } },
      { createdAt: { $lte: previousMonthObject.end } },
    ],
  });
  //---------------------------------------------------Product Data---------------------------------------------------//
  const currentMonthProductsPromise = product_Model
    .find({
      $and: [
        { createdAt: { $gte: currentMonthObject.start } },
        { createdAt: { $lte: currentMonthObject.end } },
      ],
    })
    .select("category");
  const previousMonthProductsPromise = product_Model
    .find({
      $and: [
        { createdAt: { $gte: previousMonthObject.start } },
        { createdAt: { $lte: previousMonthObject.end } },
      ],
    })
    .select("category");

  //------------------------------------------------Promise Resolving------------------------------------------------//

  const [
    currentMonthOrder,
    previousMonthOrder,
    currentMonthUsers,
    previousMonthUsers,
    currentMonthProducts,
    previousMonthProducts,
    allProduct,
    allUsers,
    femaleGenderCount,
    productsOutOfStock,
    totalAdminUsers,
    latestFiveOrders,
  ] = await Promise.all([
    ChartCaching<OrderDocument>({
      key: "currentMonthOrder",
      promise: currentMonthOrderPromise,
    }),
    ChartCaching<OrderDocument>({
      key: "previousMonthOrder",
      promise: previousMonthOrderPromise,
    }),
    ChartCaching<userSchema>({
      key: "currentMonthUsers",
      promise: currentMonthUsersPromise,
    }),
    ChartCaching<userSchema>({
      key: "previousMonthUsers",
      promise: previousMonthUsersPromise,
    }),
    ChartCaching<IProductDocument>({
      key: "currentMonthProducts",
      promise: currentMonthProductsPromise,
    }),
    ChartCaching<IProductDocument>({
      key: "previousMonthProducts",
      promise: previousMonthProductsPromise,
    }),
    ChartCaching<IProductDocument>({
      key: "ALLPRODUCTS",
      promise: product_Model.find(),
    }),

    // caching the countDocument is not necesssary as it just returns a single
    userModel.countDocuments(),
    userModel.countDocuments({ gender: "female" }),
    product_Model.countDocuments({ stock: 0 }),
    userModel.countDocuments({ role: "admin" }),

    ChartCaching<OrderDocument>({
      key: "latestFiveOrders",
      promise: order_Model.find().sort({ createdAt: 1 }).limit(5),
    }),
  ]);

  // -----------------------------------------------Revenue Calculation -----------------------------------------------//
  const currentMonthRevenue = currentMonthOrder?.reduce((acc, curr) => {
    let currentValue =
      +curr.total - (curr.tax + curr.discount + curr.shippingCharge);
    return (acc += currentValue);
  }, 0);
  const previousMonthRevenue = previousMonthOrder.reduce((acc, curr) => {
    let currentValue =
      +curr.total - (curr.tax + curr.discount + curr.shippingCharge);
    return (acc += currentValue);
  }, 0);

  //------------------------------------------Percentage Calculation----------------------------------------------------//
  // const revenuePercentage = calculatePercentage(
  //   currentMonthRevenue!,
  //   previousMonthRevenue
  // );
  // const userPercentage = calculatePercentage(
  //   currentMonthUsers.length,
  //   previousMonthUsers.length
  // );
  // const productPercentage = calculatePercentage(
  //   currentMonthProducts.length,
  //   previousMonthProducts.length
  // );
  // const transactionPercentage = calculatePercentage(
  //   currentMonthOrder!.length,
  //   previousMonthOrder.length
  // );
  //------------------------------------------Category Percentage Calculation------------------------------------------//
  const categoryObject: Record<string, number> = {};
  const totalProductsLength = allProduct.length;

  allProduct.map((productObject) => {
    categoryObject[productObject.category] =
      categoryObject[productObject.category] + 1 || 1;
  });

  for (const key in categoryObject) {
    categoryObject[key] = Math.round(
      (categoryObject[key] / totalProductsLength) * 100
    );
  }
  //------------------------------------------Gender Ratio Calculation----------------------------------------------//

  const maleGenderPercentage = Math.round(
    ((allUsers - femaleGenderCount) / allUsers) * 100
  );
  const femaleGenderPercentage = 100 - maleGenderPercentage;
  const genderRatioObject = {
    male: maleGenderPercentage,
    female: femaleGenderPercentage,
  };

  //---------------------------------------------6 Months Data Calculations---------------------------------------------//

  const barChartData = await sixMonthDataCalculation({ dashboard: true });

  //---------------------------------------------Pie Chart Page Data Calculation---------------------------------------------//

  // Order Status Calculation -- Pie Chart
  const orderStatusObject: Record<string, number> = {};
  currentMonthOrder?.map((orderObject) => {
    orderStatusObject[orderObject.status] =
      orderStatusObject[orderObject.status] + 1 || 1;
  });

  // Product Out of stock and In Stock
  const productInStock = currentMonthProducts.length - productsOutOfStock;

  const productStockObject = {
    InStock: productInStock,
    OutOfStock: productsOutOfStock,
  };

  // Age Group Calculation
  const ageGroupObject = {
    teenager: 0,
    adult: 0,
    older: 0,
  };
  const userAgeArray = currentMonthUsers.map((i) => i.age);

  userAgeArray.forEach((i) => {
    if (+i < 20) {
      ageGroupObject.teenager = ageGroupObject.teenager + 1;
    } else if (+i >= 20 && +i < 50) {
      ageGroupObject.adult = ageGroupObject.adult + 1;
    } else {
      ageGroupObject.older = ageGroupObject.older + 1;
    }
  });

  // User and Admin Role Users
  const userRoleObject = {
    users: allUsers - totalAdminUsers,
    admin: totalAdminUsers,
  };

  // ------------------------------------------------------Data Objects ------------------------------------------------------//
  const topWidgetValues = {
    revenue: currentMonthRevenue,
    users: allUsers,
    products: allProduct.length,
    transactions: currentMonthOrder?.length,
  };
  // const topWidgetPercentage = {
  //   revenuePercentage,
  //   userPercentage,
  //   productPercentage,
  //   transactionPercentage,
  // };

  const products = await product_Model.find();

  const pieChartPageData = {
    orderStatusObject,
    productStockObject,
    ageGroupObject,
    userRoleObject,
  };
  // Dashboard Table Transaction Data
  const dashboardTableData = latestFiveOrders.map((i) => ({
    _id: i._id,
    amount: i.total,
    quantity: i.quantity,
    discount: i.discount,
    status: i.status,
  }));

  console.log(barChartData,"barchartData")

  res.status(200).json({
    message: true,
    chartData: [
      // topWidgetPercentage,
      topWidgetValues,
      categoryObject,
      genderRatioObject,
      barChartData,
      dashboardTableData,
      pieChartPageData,
    ],
  });
});
export const lineChartPageData = tryCatchWrapper(async (req, res, next) => {
  revalidateCache({ admin: true });

  const tweleveMonthUserData = await twelveMonthLineChartData({
    users: true,
  });
  const tweleveMonthDiscountData = await twelveMonthLineChartData({
    discount: true,
  });
  const tweleveMonthRevenueData = await twelveMonthLineChartData({
    revenue: true,
  });
  const lineChartObject = {
    users: tweleveMonthUserData,
    discount: tweleveMonthDiscountData,
    revenue: tweleveMonthRevenueData,
  };

  res.status(200).json({
    message: true,
    lineChartPageData: lineChartObject,
  });
});
export const barChartPageData = tryCatchWrapper(async (req, res, next) => {
  revalidateCache({ admin: true });

  const barChartSixMonthData = await sixMonthDataCalculation({ bar: true });
  const barCharttwelveMonthData = await calculatePreviousDataArray3();

  res.status(200).json({
    message: true,
    sixMonthBarChartData: barChartSixMonthData,
    twelveMonthBarChartData: barCharttwelveMonthData,
  });
});
