import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken as any, getDashboardStats as any);

export default router;
