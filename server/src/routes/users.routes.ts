import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../schemas/auth.schema";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/", usersController.list);
router.post("/", validate(createUserSchema), usersController.create);
router.put("/:id", validate(updateUserSchema), usersController.update);
router.delete("/:id", usersController.remove);

export default router;
