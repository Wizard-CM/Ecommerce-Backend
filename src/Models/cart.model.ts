import mongoose, { Schema, Types } from "mongoose";

export interface cartModel extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  quantity: number;
  _id: Types.ObjectId;
}

const cart_Schema = new Schema<cartModel>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_Model",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

export const cart_Model = mongoose.model("cart_Model", cart_Schema);
