import mongoose, { Schema } from "mongoose";

export interface userSchema {
  username: string;
  email: string;
  gender: string;
  dob: Date;
  role: string;
  age: string;
  photo: string;
  uid?: string;
}

const user_Schema = new Schema<userSchema>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    photo: {
      type: String,
    },
    uid: String,
  },
  { timestamps: true }
);

user_Schema.virtual("age").get(function () {
  const userDOB = this.dob;
  const currentDate = new Date();
  const userBirthYear = userDOB.getFullYear();
  const currentYear = currentDate.getFullYear();
  let age = currentYear - userBirthYear;

  if (
    userDOB.getMonth() > currentDate.getMonth() ||
    (userDOB.getMonth() == currentDate.getMonth() &&
      userDOB.getDay() > currentDate.getDay())
  ) {
    age--;
    return age;
  }

  return age;
});

export const userModel = mongoose.model("userModel", user_Schema);
