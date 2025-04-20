import { NextFunction, Request, Response } from "express";
import { createUserRequestBody } from "../types/apiTypes.js";
import { userModel } from "../Models/user.model.js";
import { ErrorHandler } from "../Middlewares/error.js";
import { tryCatchWrapper } from "../Utils/ControllerWrapper.js";
import { revalidateCache } from "../Utils/features.js";
import { nodeCache } from "../index.js";

// revalidate
export const createUser = tryCatchWrapper(
  async (req: Request<{}, {}, createUserRequestBody>, res, next) => {
    const { username, email, photo, dob, gender ,uid} = req.body;
    
    if (!username || !email || !dob || !gender || !uid) {
      console.log("user Details field data is missing");
      return next(
        new ErrorHandler("Fill All The User's Information Field", 400)
      );
    }
    
    // Condition for checking if user already exist and if it exists then return
    const userExists = await userModel.findOne({ email,uid });
    if (userExists?.username) {
      console.log("user Already Exists");
      console.log(userExists.age);
      return res.status(200).json({
        success: true,
        messsage: `Welcome Back ${userExists.username}`,
        userData:userExists
      });
    }



    const user = await userModel.create({
      username,
      email,
      dob: new Date(dob),
      gender,
      uid,
      photo
    });

    revalidateCache({ user: true });

    res.status(201).json({
      success: true,
      messgae: "User Successfully Created",
      userData:user
    });
  }
);
// revalidate
export const deleteSingleUser = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;

  revalidateCache({ user: true, id });
  const user = await userModel.findById(id);

  if (!user)
    return next(
      new ErrorHandler("Invalid User Id , Unable To Find Single User", 400)
    );
  await user.deleteOne();
  revalidateCache({ user: true, id });

  res.status(200).json({
    success: true,
    message: "User Successfully Deleted",
  });
});
// revalidate
export const updateSingleUser = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const {role} = req.body;

  const user = await userModel.findById(id);

  if (!user)
    return next(
      new ErrorHandler("Invalid User Id , Unable To Find Single User ", 400)
    );
  user.role = role;
  await user.save();
  revalidateCache({ user: true, id });

  res.status(200).json({
    success: true,
    message: "User Successfully Updated",
  });
});


// caching
export const allUsers = tryCatchWrapper(async (req, res, next) => {
  let allUsers;
  if (nodeCache.has("all-users")) {
    allUsers = nodeCache.get("all-users");
  } else {
    allUsers = await userModel.find();
    nodeCache.set("all-users", allUsers);
  }

  res.status(200).json({
    success: true,
    userData: allUsers,
  });
});
// caching
// Checking the login Purpose for the frontend
export const singleUser = tryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;

  let  user = await userModel.findOne({uid:id});
  

  if (!user) {
    return next(
      new ErrorHandler("Invalid User Id , Unable To Find Single User Data", 400)
    );
  }

  res.status(200).json({
    success: true,
    userData: user,
  });
});
