import mongoose from "mongoose";

export interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryScan {
  _id: string;
  userId: string;
  scanDate: Date;
  wallType: "solid" | "hollow" | "cracked";
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

export interface MemoryVisualScan {
  _id: string;
  userId: string;
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

class MemoryStore {
  public users: MemoryUser[] = [];
  public scans: MemoryScan[] = [];
  public visualScans: MemoryVisualScan[] = [];

  public generateId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  public isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const memoryStore = new MemoryStore();
