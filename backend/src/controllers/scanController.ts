import { Response } from "express";
import { Scan } from "../models/Scan.js";
import { memoryStore, MemoryScan } from "../models/memoryStore.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      wallType,
      label,
      confidenceScore,
      peakFrequency,
      rms,
      duration,
      fftSummary,
      recommendation,
      audioPath,
    } = req.body;

    if (!wallType || confidenceScore === undefined || peakFrequency === undefined || rms === undefined) {
      res.status(400).json({ success: false, message: "Missing required scan data fields" });
      return;
    }

    const scanLabel = label || `${wallType.charAt(0).toUpperCase() + wallType.slice(1)} Wall`;
    const recText = recommendation || "Standard structural recommendation";

    if (memoryStore.isMongoConnected()) {
      const scan = await Scan.create({
        userId: req.user.id,
        wallType,
        label: scanLabel,
        confidenceScore,
        peakFrequency,
        rms,
        duration: duration || 1.0,
        fftSummary: fftSummary || [],
        recommendation: recText,
        audioPath,
      });

      res.status(201).json({
        success: true,
        message: "Scan saved successfully",
        scan,
      });
    } else {
      // Memory Store Fallback
      const newScan: MemoryScan = {
        _id: memoryStore.generateId(),
        userId: req.user.id,
        scanDate: new Date(),
        wallType,
        label: scanLabel,
        confidenceScore,
        peakFrequency,
        rms,
        duration: duration || 1.0,
        fftSummary: fftSummary || [],
        recommendation: recText,
        audioPath,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.scans.push(newScan);

      res.status(201).json({
        success: true,
        message: "Scan saved successfully (In-Memory mode)",
        scan: newScan,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to save scan" });
  }
};

export const getScans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { wallType, search } = req.query;

    if (memoryStore.isMongoConnected()) {
      const filter: any = { userId: req.user.id };

      if (wallType && ["solid", "hollow", "cracked"].includes(wallType as string)) {
        filter.wallType = wallType;
      }

      if (search && typeof search === "string" && search.trim() !== "") {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { label: regex },
          { recommendation: regex },
          { wallType: regex },
        ];
      }

      const scans = await Scan.find(filter).sort({ scanDate: -1 });

      res.status(200).json({
        success: true,
        count: scans.length,
        scans,
      });
    } else {
      // Memory Store Fallback
      let userScans = memoryStore.scans.filter((s) => s.userId === req.user?.id);

      if (wallType && ["solid", "hollow", "cracked"].includes(wallType as string)) {
        userScans = userScans.filter((s) => s.wallType === wallType);
      }

      if (search && typeof search === "string" && search.trim() !== "") {
        const q = search.trim().toLowerCase();
        userScans = userScans.filter(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.recommendation.toLowerCase().includes(q) ||
            s.wallType.toLowerCase().includes(q)
        );
      }

      userScans.sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime());

      res.status(200).json({
        success: true,
        count: userScans.length,
        scans: userScans,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch scans" });
  }
};

export const getScanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scan = await Scan.findOne({ _id: req.params.id, userId: req.user.id });

      if (!scan) {
        res.status(404).json({ success: false, message: "Scan not found" });
        return;
      }

      res.status(200).json({
        success: true,
        scan,
      });
    } else {
      const scan = memoryStore.scans.find(
        (s) => s._id === req.params.id && s.userId === req.user?.id
      );

      if (!scan) {
        res.status(404).json({ success: false, message: "Scan not found" });
        return;
      }

      res.status(200).json({
        success: true,
        scan,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch scan details" });
  }
};

export const deleteScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (memoryStore.isMongoConnected()) {
      const scan = await Scan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

      if (!scan) {
        res.status(404).json({ success: false, message: "Scan not found or not authorized to delete" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Scan deleted successfully",
        id: req.params.id,
      });
    } else {
      const idx = memoryStore.scans.findIndex(
        (s) => s._id === req.params.id && s.userId === req.user?.id
      );

      if (idx === -1) {
        res.status(404).json({ success: false, message: "Scan not found or not authorized to delete" });
        return;
      }

      memoryStore.scans.splice(idx, 1);

      res.status(200).json({
        success: true,
        message: "Scan deleted successfully",
        id: req.params.id,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete scan" });
  }
};
