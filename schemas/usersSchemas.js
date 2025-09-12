import Joi from "joi";
import { emailRegExp } from "../constants/user-constants.js";

const userSignUpSchema = Joi.object({
  email: Joi.string().pattern(emailRegExp).required(),
  password: Joi.string().required(),
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter"),
});

const userSignInSchema = Joi.object({
  email: Joi.string().pattern(emailRegExp).required(),
  password: Joi.string().required(),
});

export default {
  userSignUpSchema,
  userSignInSchema,
};
