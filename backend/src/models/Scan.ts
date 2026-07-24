import mongoose, { Schema, Document } from "mongoose";

export type WallType = "solid" | "hollow" | "cracked";

export interface IScan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  scanDate: Date;
  wallType: WallType;
  label: string;
  confidenceScore: number;
  peakFrequency: number;
  rms: number;
  duration: number;
  fftSummary: number[];
  recommendation: string;
  audioPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema: Schema<IScan> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scanDate: {
      type: Date,
      default: Date.now,
    },
    wallType: {
      type: String,
      enum: ["solid", "hollow", "cracked"],
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    peakFrequency: {
      type: Number,
      required: true,
    },
    rms: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    fftSummary: {
      type: [Number],
      default: [],
    },
    recommendation: {
      type: String,
      required: true,
    },
    audioPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Scan = mongoose.model<IScan>("Scan", ScanSchema);
