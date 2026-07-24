import { Router } from "express";
import {
  createVisualScan,
  getVisualScans,
  getVisualScanById,
  deleteVisualScan,
} from "../controllers/visualScanController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken as any);

router.post("/", createVisualScan as any);
router.get("/", getVisualScans as any);
router.get("/:id", getVisualScanById as any);
router.delete("/:id", deleteVisualScan as any);

export default router;
