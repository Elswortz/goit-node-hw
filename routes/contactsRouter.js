import express from "express";

import contactsController from "../controllers/contactsControllers.js";

import { validateBody } from "../decorators/index.js";

import { authenticate, isEmptyBody, isValidId } from "../middlewares/index.js";

import contactsSchemas from "../schemas/contactsSchemas.js";

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", contactsController.getAllContacts);

contactsRouter.get("/:id", isValidId, contactsController.getOneContact);

contactsRouter.post(
  "/",
  isEmptyBody,
  validateBody(contactsSchemas.createContactSchema),
  contactsController.createContact
);

contactsRouter.put(
  "/:id",
  isValidId,
  isEmptyBody,
  validateBody(contactsSchemas.createContactSchema),
  contactsController.updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  isValidId,
  isEmptyBody,
  validateBody(contactsSchemas.updateContactSchema),
  contactsController.updateFavorite
);

contactsRouter.delete("/:id", isValidId, contactsController.deleteContact);

export default contactsRouter;
