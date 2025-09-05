import Joi from "joi";

import { phoneRegExp } from "../constants/contacts-constants.js";

const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().pattern(phoneRegExp).required(),
});

const updateContactSchema = Joi.object({
  phone: Joi.string().pattern(phoneRegExp).required(),
});

export default {
  createContactSchema,
  updateContactSchema,
};
