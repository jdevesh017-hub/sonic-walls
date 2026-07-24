import { Response } from "express";
import { Scan } from "../models/Scan.js";
import { memoryStore } from "../models/memoryStore.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (memoryStore.isMongoConnected()) {
      const [totalScans, todayScans, solidCount, hollowCount, crackedCount, recentScans] =
        await Promise.all([
          Scan.countDocuments({ userId }),
          Scan.countDocuments({ userId, scanDate: { $gte: startOfToday } }),
          Scan.countDocuments({ userId, wallType: "solid" }),
          Scan.countDocuments({ userId, wallType: "hollow" }),
          Scan.countDocuments({ userId, wallType: "cracked" }),
          Scan.find({ userId }).sort({ scanDate: -1 }).limit(5),
        ]);

      res.status(200).json({
        success: true,
        stats: {
          totalScans,
          todayScans,
          solidCount,
          hollowCount,
          crackedCount,
        },
        recentScans,
      });
    } else {
      // Memory Store Fallback
      const userScans = memoryStore.scans.filter((s) => s.userId === userId);
      const totalScans = userScans.length;
      const todayScans = userScans.filter((s) => new Date(s.scanDate) >= startOfToday).length;
      const solidCount = userScans.filter((s) => s.wallType === "solid").length;
      const hollowCount = userScans.filter((s) => s.wallType === "hollow").length;
      const crackedCount = userScans.filter((s) => s.wallType === "cracked").length;

      const recentScans = [...userScans]
        .sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime())
        .slice(0, 5);

      res.status(200).json({
        success: true,
        stats: {
          totalScans,
          todayScans,
          solidCount,
          hollowCount,
          crackedCount,
        },
        recentScans,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to load dashboard statistics" });
  }
};
