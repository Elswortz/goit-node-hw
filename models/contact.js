import { Schema, model } from "mongoose";

import { handleSaveError, handleUpdateValidate } from "./hooks.js";

import { phoneRegExp } from "../constants/contacts-constants.js";

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: {
      type: String,
      match: phoneRegExp,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.pre("findOneAndUpdate", handleUpdateValidate);
contactSchema.post("save", handleSaveError);
contactSchema.post("findOneAndUpdate", handleSaveError);

const Contact = model("contact", contactSchema);

export default Contact;
