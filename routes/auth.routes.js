import { Router } from "express";

import { signUp, signIn, signOut } from "../controllers/auth.controller.js";
import arcjetEmailMiddleware from "../middlewares/arcjet-email.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", arcjetEmailMiddleware, signUp);
authRouter.post("/sign-in", arcjetEmailMiddleware, signIn);
authRouter.post("/sign-out", signOut);

export default authRouter;
