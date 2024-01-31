import { NextFunction, Request, Response } from "express";
import { userModel } from "../Models/user.model.js";
import { ErrorHandler } from "./error.js";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;
    if (!id) return next(new ErrorHandler("User ID Not Sent", 400));
    const user = await userModel.findById(id);

    if (!user) return next(new ErrorHandler("Invalid User ID", 400));
    if (user.role !== "admin")
      return next(new ErrorHandler("Only Admin Can Access", 401));
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
