import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const uploadAudio = (req: AuthRequest, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No audio file provided" });
      return;
    }

    const audioPath = `uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "Audio file uploaded successfully",
      audioPath,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to upload audio file" });
  }
};
