import express from "express";
import { allUsers, createUser, deleteSingleUser, singleUser, updateSingleUser } from "../Controllers/user.js";
import { isAdmin } from "../Middlewares/authendication.js";

const userRouter = express.Router();

// Get Routes
userRouter.get("/all",  allUsers);
userRouter.route("/:id").get(singleUser).delete(deleteSingleUser).put(updateSingleUser)

// Post Routes
userRouter.post("/new", createUser);

export default userRouter;
