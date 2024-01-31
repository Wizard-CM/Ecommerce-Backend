import mongoose from "mongoose";

export const connectDb = async (mongo_uri:string) => {
  try {
    await mongoose.connect(mongo_uri, {
      dbName: "Self_Ecommerce_App",
    });
    console.log("DB Successfully Connected");
  } catch (error) {
    console.log("DB Connection error");
    process.exit(1);
  }
};
