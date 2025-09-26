import express from "express";

import { validateBody } from "../decorators/index.js";
import { authenticate, upload } from "../middlewares/index.js";

import usersSchemas from "../schemas/usersSchemas.js";
import usersController from "../controllers/usersController.js";

const usersRouter = express.Router();

usersRouter.post(
  "/signup",
  validateBody(usersSchemas.userSignUpSchema),
  usersController.signup
);

usersRouter.post(
  "/signin",
  validateBody(usersSchemas.userSignInSchema),
  usersController.signin
);

usersRouter.get("/current", authenticate, usersController.getCurrent);

usersRouter.post("/signout", authenticate, usersController.signout);

usersRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  usersController.updateAvatar
);

export default usersRouter;
