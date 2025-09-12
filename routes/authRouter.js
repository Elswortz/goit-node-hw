import express from "express";

import { validateBody } from "../decorators/index.js";
import usersSchemas from "../schemas/usersSchemas.js";
import authController from "../controllers/authController.js";
import { authenticate } from "../middlewares/index.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateBody(usersSchemas.userSignUpSchema),
  authController.signup
);

authRouter.post(
  "/signin",
  validateBody(usersSchemas.userSignInSchema),
  authController.signin
);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/signout", authenticate, authController.signout);

export default authRouter;
