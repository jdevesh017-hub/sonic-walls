import { Response } from "express";
import { VisualScan } from "../models/VisualScan.js";
import { memoryStore } from "../models/memoryStore.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createVisualScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      hasCrack,
      crackCount,
      avgConfidence,
      largestCrackPx,
      avgWidthPx,
      overallSeverity,
      wallCondition,
      wallHealthScore,
      recommendation,
      imagePath,
      originalImageBase64,
      cracks,
      scaleReferenceType,
    } = req.body;

    if (hasCrack === undefined || wallHealthScore === undefined) {
      res.status(400).json({ success: false, message: "Missing required visual scan metrics" });
      return;
    }

    const scanData = {
      userId: req.user.id,
      scanDate: new Date(),
      hasCrack: Boolean(hasCrack),
      crackCount: crackCount || 0,
      avgConfidence: avgConfidence || 95,
      largestCrackPx: largestCrackPx || 0,
      avgWidthPx: avgWidthPx || 0,
      overallSeverity: overallSeverity || "None",
      wallCondition: wallCondition || "Excellent",
      wallHealthScore: wallHealthScore || 100,
      recommendation: recommendation || "Standard recommendation",
      imagePath: imagePath || "",
      originalImageBase64: originalImageBase64 || "",
      cracks: cracks || [],
      scaleReferenceType: scaleReferenceType || "none",
    };

    if (memoryStore.isMongoConnected()) {
      const scan = new VisualScan(scanData);
      await scan.save();
      res.status(201).json({ success: true, scan });
    } else {
      const memoryScan = {
        _id: memoryStore.generateId(),
        ...scanData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.visualScans.unshift(memoryScan);
      res.status(201).json({ success: true, scan: memoryScan });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to save visual scan" });
  }
};

export const getVisualScans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scans = await VisualScan.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json({ success: true, count: scans.length, scans });
    } else {
      const userScans = memoryStore.visualScans.filter((s) => s.userId === req.user?.id);
      res.json({ success: true, count: userScans.length, scans: userScans });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch visual scans" });
  }
};

export const getVisualScanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scan = await VisualScan.findOne({ _id: req.params.id, userId: req.user.id });
      if (!scan) {
        res.status(404).json({ success: false, message: "Visual scan not found" });
        return;
      }
      res.json({ success: true, scan });
    } else {
      const scan = memoryStore.visualScans.find(
        (s) => s._id === req.params.id && s.userId === req.user?.id
      );
      if (!scan) {
        res.status(404).json({ success: false, message: "Visual scan not found" });
        return;
      }
      res.json({ success: true, scan });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch visual scan" });
  }
};

export const deleteVisualScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scan = await VisualScan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      if (!scan) {
        res.status(404).json({ success: false, message: "Visual scan not found" });
        return;
      }
      res.json({ success: true, message: "Visual scan deleted successfully", id: req.params.id });
    } else {
      const index = memoryStore.visualScans.findIndex(
        (s) => s._id === req.params.id && s.userId === req.user?.id
      );
      if (index === -1) {
        res.status(404).json({ success: false, message: "Visual scan not found" });
        return;
      }
      memoryStore.visualScans.splice(index, 1);
      res.json({ success: true, message: "Visual scan deleted successfully", id: req.params.id });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete visual scan" });
  }
};
