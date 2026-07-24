export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SeverityLevel = "Low" | "Medium" | "High";
export type WallCondition = "Excellent" | "Good" | "Needs Monitoring" | "Poor";
export type ScaleReferenceType = "none" | "a4" | "coin" | "ruler";

export interface ReferenceScale {
  type: ScaleReferenceType;
  label: string;
  mmPerPx?: number;
}

export interface DetectedCrack {
  id: number;
  boundingBox: BoundingBox;
  maskPoints: Point[];
  confidence: number; // 0 - 100
  lengthPx: number;
  widthPx: number;
  lengthRealMm?: number;
  widthRealMm?: number;
  severity: SeverityLevel;
}

export interface VisualAnalysisResult {
  hasCrack: boolean;
  crackCount: number;
  cracks: DetectedCrack[];
  avgConfidence: number;
  largestCrackPx: number;
  avgWidthPx: number;
  largestCrackRealMm?: number;
  avgWidthRealMm?: number;
  overallSeverity: SeverityLevel | "None";
  wallCondition: WallCondition;
  wallHealthScore: number; // 0 - 100
  recommendation: string;
  originalImageDataUrl: string;
  enhancedImageDataUrl: string;
  annotatedImageDataUrl: string;
  scaleReference: ReferenceScale;
  scaleWarning?: string;
  processedDate: string;
}

export interface VisualScanDTO {
  _id: string;
  userId?: string;
  scanDate: string;
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
  cracks: DetectedCrack[];
  scaleReferenceType: string;
  createdAt: string;
}
