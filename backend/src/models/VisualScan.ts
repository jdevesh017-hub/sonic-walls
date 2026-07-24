import mongoose, { Schema, Document } from "mongoose";

export interface IVisualScan extends Document {
  userId: mongoose.Types.ObjectId | string;
  scanDate: Date;
  hasCrack: boolean;
  crackCount: number;
  avgConfidence: number;
  largestCrackPx: number;
  avgWidthPx: number;
  overallSeverity: string;
  wallCondition: string;
  wallHealthScore: number;
  recommendation: string;
  imagePath?: string;
  originalImageBase64?: string;
  cracks: any[];
  scaleReferenceType: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisualScanSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true, ref: "User" },
    scanDate: { type: Date, default: Date.now },
    hasCrack: { type: Boolean, required: true },
    crackCount: { type: Number, required: true, default: 0 },
    avgConfidence: { type: Number, required: true, default: 95 },
    largestCrackPx: { type: Number, required: true, default: 0 },
    avgWidthPx: { type: Number, required: true, default: 0 },
    overallSeverity: { type: String, required: true, default: "None" },
    wallCondition: { type: String, required: true, default: "Excellent" },
    wallHealthScore: { type: Number, required: true, default: 100 },
    recommendation: { type: String, required: true },
    imagePath: { type: String },
    originalImageBase64: { type: String },
    cracks: { type: Array, default: [] },
    scaleReferenceType: { type: String, default: "none" },
  },
  { timestamps: true }
);

export const VisualScan = mongoose.model<IVisualScan>("VisualScan", VisualScanSchema);
