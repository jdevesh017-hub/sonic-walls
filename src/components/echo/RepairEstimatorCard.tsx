import React, { useState } from "react";
import { calculateRepairEstimate } from "@/lib/repair-estimator";
import { WallType } from "@/lib/audio-analyzer";
import {
  Wrench,
  DollarSign,
  Clock,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface RepairEstimatorCardProps {
  wallType: WallType;
  hasCrack?: boolean;
  crackCount?: number;
  severity?: "Low" | "Medium" | "High" | "None";
  crackLengthPx?: number;
}

export function RepairEstimatorCard({
  wallType,
  hasCrack = false,
  crackCount = 0,
  severity = "Low",
  crackLengthPx,
}: RepairEstimatorCardProps) {
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");
  const estimate = calculateRepairEstimate({ wallType, hasCrack, crackCount, severity, crackLengthPx });

  const urgencyStyles = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  }[estimate.urgencyColor];

  const minCost = currency === "usd" ? `$${estimate.minCostUsd}` : `₹${estimate.minCostInr.toLocaleString()}`;
  const maxCost = currency === "usd" ? `$${estimate.maxCostUsd}` : `₹${estimate.maxCostInr.toLocaleString()}`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6 shadow-xl">
      {/* Component Header & Currency Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Repair Cost & Hardware Anchor Estimator</h3>
            <p className="text-xs text-muted-foreground">Automated material recommendations & cost projections</p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-lg border border-white/15 bg-white/5 p-1 text-xs font-bold">
          <button
            onClick={() => setCurrency("usd")}
            className={`rounded-md px-3 py-1 transition ${
              currency === "usd" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            $ USD
          </button>
          <button
            onClick={() => setCurrency("inr")}
            className={`rounded-md px-3 py-1 transition ${
              currency === "inr" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ₹ INR
          </button>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Estimated Cost Range */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-4 w-4 text-emerald-400" /> Estimated Repair Cost
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">
            {estimate.maxCostUsd === 0 ? (
              <span className="text-emerald-400 text-xl font-bold">{currency === "usd" ? "$0" : "₹0"} (No Repair Needed)</span>
            ) : (
              `${minCost} – ${maxCost}`
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {estimate.maxCostUsd === 0 ? "Wall is structurally optimal" : "Includes materials & labor"}
          </div>
        </div>

        {/* Labor Time & Difficulty */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-4 w-4 text-sky-400" /> Estimated Labor Time
          </div>
          <div className="text-2xl font-black text-foreground tabular-nums">{estimate.laborHours}</div>
          <div className="text-[11px] text-sky-400 font-medium">{estimate.difficulty}</div>
        </div>

        {/* Urgency Level */}
        <div className={`rounded-xl border p-4 space-y-1 ${urgencyStyles}`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Urgency Level
          </div>
          <div className="text-base font-extrabold leading-tight">{estimate.urgencyLevel}</div>
        </div>
      </div>

      {/* Recommended Anchors Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Layers className="h-4 w-4" /> Recommended Hardware & Mounting Anchors
        </h4>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/50">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-2.5">Hardware Anchor Name</th>
                <th className="px-4 py-2.5">Suitable Surface</th>
                <th className="px-4 py-2.5">Max Load Limit</th>
                <th className="px-4 py-2.5">Drill Bit Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-foreground">
              {estimate.anchors.map((anchor, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-primary">{anchor.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{anchor.type}</td>
                  <td className="px-4 py-3 font-bold tabular-nums">
                    {anchor.maxLoadKg > 0 ? `${anchor.maxLoadKg} kg (${Math.round(anchor.maxLoadKg * 2.20462)} lbs)` : "N/A (Restricted)"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {anchor.recommendedDrillBitMm > 0 ? `${anchor.recommendedDrillBitMm} mm` : <span className="text-rose-400 font-bold">Do Not Drill (Relocate Hole)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Materials & Action Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recommended Repair Materials */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Recommended Materials & Supplies
          </h4>
          <div className="space-y-2">
            {estimate.materials.map((mat, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{mat.item}</span>
                </div>
                <p className="mt-1 text-muted-foreground pl-5">{mat.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Structural Action Plan
          </h4>
          <div className="space-y-2">
            {estimate.repairSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {idx + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
