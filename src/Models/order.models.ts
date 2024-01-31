import mongoose, { DataSizeOperatorReturningNumber, Schema, Types } from "mongoose";

export type shippingInfoProps = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
};
export interface OrderDocument extends Document {
  user: Types.ObjectId;
  shippingInfo: shippingInfoProps;
  cartItems: Types.ObjectId[];
  status: "Processing" | "Shipped" | "Delivered";
  subTotal: number;
  tax: number;
  discount: number;
  total: number;
  shippingCharge: number;
  quantity:number;
  _id:Types.ObjectId;
}

const order_Schema = new Schema<OrderDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    shippingInfo: {
      address: String,
      city: String,
      state: String,
      country: String,
      pinCode: Number,
    },
    cartItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart_Model",
      },
    ],
    quantity:{
      type:Number,
      required:true
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default:"Processing"
    },
    subTotal: {
      type: Number,
      required: [true, "subTotal is a required feild"],
    },
    tax: {
      type: Number,
      required: [true, "tax is a required feild"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: [true, "Total is a required feild"],
    },
    // quantity: In the cartItem
  },

  { timestamps: true }
);

export const order_Model = mongoose.model("order_Model", order_Schema);
