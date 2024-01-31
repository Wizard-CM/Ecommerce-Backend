Backend With Typescript Documnetation : https://blog.logrocket.com/how-to-set-up-node-typescript-express/#create-package-json-file

=> Command : tsc -w 
    This code keeps the track of changes in the ts file to it's corresponding js file line by line.
=> Command : npx tsx 
    This code builds the JS files corresponding to it's TS files only once the command runs.
=> Command : ts-node 
    This code allows you to run ts files on the server .















    Code:

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
    currentMonthOrderPromise,
    previousMonthOrderPromise,
    currentMonthUsersPromise,
    previousMonthUsersPromise,
    currentMonthProductsPromise,
    previousMonthProductsPromise,
    product_Model.find(),

    // ChartCaching<OrderDocument>({
    //   key: "currentMonthOrder",
    //   promise: currentMonthOrderPromise,
    // }),
    // ChartCaching<OrderDocument>({
    //   key: "previousMonthOrder",
    //   promise: previousMonthOrderPromise,
    // }),
    // ChartCaching<userSchema>({
    //   key: "currentMonthUsers",
    //   promise: currentMonthUsersPromise,
    // }),
    // ChartCaching<userSchema>({
    //   key: "previousMonthUsers",
    //   promise: previousMonthUsersPromise,
    // }),
    // ChartCaching<IProductDocument>({
    //   key: "currentMonthProducts",
    //   promise: currentMonthProductsPromise,
    // }),
    // ChartCaching<IProductDocument>({
    //   key: "previousMonthProducts",
    //   promise: previousMonthProductsPromise,
    // }),
    // ChartCaching<IProductDocument>({
    //   key: "ALLPRODUCTS",
    //   promise: product_Model.find(),
    // }),

    // caching the countDocument is not necesssary as it just returns a single
    userModel.countDocuments(),
    userModel.countDocuments({ gender: "female" }),
    product_Model.countDocuments({ stock: 0 }),
    userModel.countDocuments({ role: "admin" }),

    // ChartCaching<OrderDocument>({
    //   key: "latestFiveOrders",
    //   promise: order_Model.find().sort({ createdAt: 1 }).limit(5),
    // }),
    order_Model.find().sort({ createdAt: 1 }).limit(5)
  ]);