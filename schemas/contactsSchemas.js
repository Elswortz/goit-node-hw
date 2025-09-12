import Joi from "joi";

import { phoneRegExp } from "../constants/contacts-constants.js";

const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().pattern(phoneRegExp).required(),
  favorite: Joi.boolean().default(false),
});

const updateContactSchema = Joi.object({
  favorite: Joi.boolean(),
});

export default {
  createContactSchema,
  updateContactSchema,
};
