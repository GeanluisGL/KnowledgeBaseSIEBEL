import { Router } from "express";
import * as contentController from "../controllers/content.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";
import { validate } from "../middlewares/validate";
import { createContentSchema, updateContentSchema } from "../schemas/content.schema";

const router = Router();

// Cualquier usuario autenticado (admin o viewer)
router.use(authenticate);
router.get("/", contentController.list);
router.get("/:id", contentController.getById);

// Solo admin
router.post("/", authorize("admin"), validate(createContentSchema), contentController.create);
router.put("/:id", authorize("admin"), validate(updateContentSchema), contentController.update);
router.delete("/:id", authorize("admin"), contentController.remove);

export default router;
