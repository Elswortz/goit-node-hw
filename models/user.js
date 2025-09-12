import { Schema, model } from "mongoose";
import { handleSaveError, handleUpdateValidate } from "./hooks.js";
import { emailRegExp } from "../constants/user-constants.js";

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: emailRegExp,
      unique: true,
      required: [true, "Email is required"],
    },
    password: { type: String, required: [true, "Password is required"] },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: { type: String, default: null },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("findOneAndUpdate", handleUpdateValidate);
userSchema.post("save", handleSaveError);
userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
