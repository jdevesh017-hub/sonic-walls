import { Router } from "express";
import { uploadAudio } from "../controllers/uploadController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticateToken as any, upload.single("audio"), uploadAudio as any);

export default router;
