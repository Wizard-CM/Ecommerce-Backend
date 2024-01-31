import mongoose, { Types, mongo } from "mongoose";

export interface IProduct {
    name: string;
    photo: string;
    user: Types.ObjectId;
    category: string;
    stock: number;
    price: number;
  }
  
  export interface IProductDocument extends IProduct,Document {
    _id:Types.ObjectId
    createdAt: Date;
    updatedAt: Date;
  }
  

const product_Schema = new mongoose.Schema<IProductDocument>({
    name:{
        type:String,
        required:[true,"Product Name Required"]
    },
    photo:{
        type:String,
        required:[true,"Product Photo Required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user_Model",
        required:true
    },
    category:{
        type:String,
        required:[true,"Product Category Required"]
    },
    stock:{
        type:Number,
        required:[true,"Product Stock Required"]
    },
    price:{
        type:Number,
        required:[true,"Product Price Required"]
    },
},{timestamps:true})


export const product_Model = mongoose.model("product_Model",product_Schema)