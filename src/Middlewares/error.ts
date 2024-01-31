import { NextFunction, Request, Response } from "express";

interface errorHandlerProps {
  statusCode: number;
}

export class ErrorHandler extends Error implements errorHandlerProps {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const ErrorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};
