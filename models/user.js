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
    avatarURL: {
      type: String,
      required: true,
    },
    token: { type: String, default: null },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre("findOneAndUpdate", handleUpdateValidate);
userSchema.post("save", handleSaveError);
userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
