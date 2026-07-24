import { Router } from "express";
import {
  createScan,
  getScans,
  getScanById,
  deleteScan,
} from "../controllers/scanController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken as any);

router.post("/", createScan as any);
router.get("/", getScans as any);
router.get("/:id", getScanById as any);
router.delete("/:id", deleteScan as any);

export default router;
