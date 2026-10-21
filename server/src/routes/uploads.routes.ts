import { Router } from "express";
import * as uploadsController from "../controllers/uploads.controller";
import { upload } from "../config/upload";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/roles";

const router = Router();

// Solo admin: autenticación y rol se comprueban ANTES de procesar el archivo.
router.post("/", authenticate, authorize("admin"), upload.single("file"), uploadsController.uploadFile);

export default router;
