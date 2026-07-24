import { Request, Response } from "express";
import { Scan } from "../models/Scan.js";
import { User } from "../models/User.js";
import { memoryStore } from "../models/memoryStore.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { generateScanPDFReport } from "../utils/pdfGenerator.js";

export const getScanReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });
      if (!scan) {
        res.status(404).json({ success: false, message: "Scan report not found" });
        return;
      }

      const user = await User.findById(req.user.id);
      const userName = user?.name || req.user.name || "EchoScan Inspector";
      const userEmail = user?.email || req.user.email || "inspector@echoscan.app";

      generateScanPDFReport(
        {
          id: scan._id.toString(),
          userName,
          userEmail,
          scanDate: scan.scanDate,
          wallType: scan.wallType,
          label: scan.label,
          confidenceScore: scan.confidenceScore,
          peakFrequency: scan.peakFrequency,
          rms: scan.rms,
          duration: scan.duration,
          recommendation: scan.recommendation,
        },
        res
      );
    } else {
      // Memory Store Fallback
      const scan = memoryStore.scans.find(
        (s) => s._id === req.params.id && s.userId === req.user?.id
      );

      if (!scan) {
        res.status(404).json({ success: false, message: "Scan report not found" });
        return;
      }

      const user = memoryStore.users.find((u) => u._id === req.user?.id);
      const userName = user?.name || req.user.name || "EchoScan Inspector";
      const userEmail = user?.email || req.user.email || "inspector@echoscan.app";

      generateScanPDFReport(
        {
          id: scan._id,
          userName,
          userEmail,
          scanDate: scan.scanDate,
          wallType: scan.wallType,
          label: scan.label,
          confidenceScore: scan.confidenceScore,
          peakFrequency: scan.peakFrequency,
          rms: scan.rms,
          duration: scan.duration,
          recommendation: scan.recommendation,
        },
        res
      );
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate report PDF" });
  }
};

export const generateInstantReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      wallType,
      label,
      confidenceScore,
      peakFrequency,
      rms,
      duration,
      recommendation,
      userName,
      userEmail,
    } = req.body;

    if (!wallType || confidenceScore === undefined || peakFrequency === undefined) {
      res.status(400).json({ success: false, message: "Missing required scan data for report generation" });
      return;
    }

    const tempId = "REP-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    generateScanPDFReport(
      {
        id: tempId,
        userName: userName || "EchoScan Inspector",
        userEmail: userEmail || "inspector@echoscan.app",
        scanDate: new Date(),
        wallType,
        label: label || `${wallType.charAt(0).toUpperCase() + wallType.slice(1)} Wall`,
        confidenceScore,
        peakFrequency,
        rms: rms || 0,
        duration: duration || 1,
        recommendation: recommendation || "Standard structural recommendation",
      },
      res
    );
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate instant report PDF" });
  }
};
