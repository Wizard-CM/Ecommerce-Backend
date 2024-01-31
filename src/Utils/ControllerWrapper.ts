import { NextFunction, Request, Response } from "express";
import { createProductRequestBody, createUserRequestBody } from "../types/apiTypes.js";

export interface reqParamsType {
  id?:string,
  cartItemId?:string,
  productId?:string
}

type functionType = (
  req: Request<reqParamsType>,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export const tryCatchWrapper = (fn: functionType) => {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// const controllerFunction = tryCatch(fn);
// userRouter.post("/new",contorllerFunction)
