import { Router } from "express";
import { getScanReport, generateInstantReport } from "../controllers/reportController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/instant", generateInstantReport as any);
router.get("/:id", authenticateToken as any, getScanReport as any);

export default router;
