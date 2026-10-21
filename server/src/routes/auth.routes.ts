import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
