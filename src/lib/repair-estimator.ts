import { WallType } from "./audio-analyzer";

export interface RepairEstimate {
  minCostUsd: number;
  maxCostUsd: number;
  minCostInr: number;
  maxCostInr: number;
  laborHours: string;
  difficulty: "Easy DIY" | "Moderate DIY" | "Professional Required";
  urgencyLevel: "Optimal Condition (No Repair Needed)" | "Routine Maintenance" | "Prompt Attention Recommended" | "Urgent Structural Action Needed";
  urgencyColor: "emerald" | "amber" | "rose";
  anchors: {
    name: string;
    type: string;
    maxLoadKg: number;
    recommendedDrillBitMm: number;
  }[];
  materials: {
    item: string;
    purpose: string;
  }[];
  repairSteps: string[];
}

export function calculateRepairEstimate(params: {
  wallType: WallType;
  hasCrack?: boolean;
  crackCount?: number;
  severity?: "Low" | "Medium" | "High" | "None";
  crackLengthPx?: number;
}): RepairEstimate {
  const { wallType, hasCrack = false, crackCount = 0, severity = "Low" } = params;

  // Base calculation logic
  if (wallType === "solid" && !hasCrack) {
    return {
      minCostUsd: 0,
      maxCostUsd: 0,
      minCostInr: 0,
      maxCostInr: 0,
      laborHours: "0 hrs",
      difficulty: "Easy DIY",
      urgencyLevel: "Optimal Condition (No Repair Needed)",
      urgencyColor: "emerald",
      anchors: [
        { name: "Concrete Sleeve Expansion Anchor", type: "Heavy Duty Masonry", maxLoadKg: 68, recommendedDrillBitMm: 8 },
        { name: "Wedge Anchor Bolt", type: "Solid Concrete", maxLoadKg: 90, recommendedDrillBitMm: 10 },
      ],
      materials: [
        { item: "No Repair Materials Required", purpose: "Wall core is structurally sound, dense, and intact." },
      ],
      repairSteps: [
        "Wall core exhibits high structural density with zero defects. No repair required.",
        "Optimal condition for mounting heavy fixtures up to 68 kg (150 lbs).",
        "Use masonry expansion anchors when mounting fixtures into solid masonry core.",
      ],
    };
  }

  if (wallType === "hollow" && !hasCrack) {
    return {
      minCostUsd: 25,
      maxCostUsd: 75,
      minCostInr: 2000,
      maxCostInr: 6000,
      laborHours: "1 – 2 hrs",
      difficulty: "Easy DIY",
      urgencyLevel: "Prompt Attention Recommended",
      urgencyColor: "amber",
      anchors: [
        { name: "Heavy-Duty Toggle Bolt", type: "Hollow Wall / Drywall Cavity", maxLoadKg: 35, recommendedDrillBitMm: 12 },
        { name: "SnapSkru Self-Drilling Hollow Anchor", type: "Cavity Drywall", maxLoadKg: 18, recommendedDrillBitMm: 6 },
      ],
      materials: [
        { item: "Toggle Bolt Hardware Pack", purpose: "Spreading load behind hollow drywall cavity" },
        { item: "Wall Stud Finder Scanner", purpose: "Locating wooden or steel studs for heavy loads" },
      ],
      repairSteps: [
        "Internal cavity/void detected behind wall face.",
        "Avoid mounting heavy fixtures (> 16kg / 35lbs) directly to drywall cavity without stud support.",
        "Use spring toggle bolts that expand behind the hollow cavity layer.",
      ],
    };
  }

  // Cracked Wall or High Severity Visual Crack
  const isHighSeverity = severity === "High" || crackCount > 2;

  return {
    minCostUsd: isHighSeverity ? 180 : 60,
    maxCostUsd: isHighSeverity ? 550 : 180,
    minCostInr: isHighSeverity ? 14500 : 4800,
    maxCostInr: isHighSeverity ? 44000 : 14500,
    laborHours: isHighSeverity ? "6 – 12 hrs" : "2 – 4 hrs",
    difficulty: "Professional Required",
    urgencyLevel: isHighSeverity ? "Urgent Structural Action Needed" : "Prompt Attention Recommended",
    urgencyColor: isHighSeverity ? "rose" : "amber",
    anchors: [
      { name: "Do NOT Anchor in Crack Zone", type: "Relocate > 15 cm Away", maxLoadKg: 0, recommendedDrillBitMm: 0 },
      { name: "Epoxy Resin Injection Port (Deep Repair)", type: "Pressure Grouting (If Deep Void)", maxLoadKg: 50, recommendedDrillBitMm: 8 },
    ],
    materials: [
      { item: "High-Viscosity Structural Epoxy Injection Resin", purpose: "Bonding cracked masonry cores and sealing void gaps without drilling" },
      { item: "Polyurethane Foam Wall Crack Filler", purpose: "Waterproofing and sealing surface hairline fracture cracks" },
      { item: "Fiberglass Wall Reinforcement Mesh Tape", purpose: "Preventing crack recurrence under thermal expansion" },
    ],
    repairSteps: [
      "NO DRILLING REQUIRED for surface crack repair: Clean loose dust from crack channel using air compressor.",
      "Inject structural epoxy resin directly into crack channel and apply fiberglass reinforcement mesh tape.",
      "CRITICAL: Do NOT drill or anchor mounting hardware into the crack path; relocate fixture holes by > 15 cm (6 in).",
      "Allow 24 hours full cure time before applying paint or structural load testing.",
    ],
  };
}
