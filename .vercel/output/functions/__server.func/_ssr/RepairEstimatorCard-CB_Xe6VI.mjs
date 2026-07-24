import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { w as Wrench, Y as DollarSign, v as Clock, h as ShieldAlert, g as Layers, _ as Package, f as CircleCheck, S as Sparkles } from "../_libs/lucide-react.mjs";
function calculateRepairEstimate(params) {
  const { wallType, hasCrack = false, crackCount = 0, severity = "Low" } = params;
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
        { name: "Wedge Anchor Bolt", type: "Solid Concrete", maxLoadKg: 90, recommendedDrillBitMm: 10 }
      ],
      materials: [
        { item: "No Repair Materials Required", purpose: "Wall core is structurally sound, dense, and intact." }
      ],
      repairSteps: [
        "Wall core exhibits high structural density with zero defects. No repair required.",
        "Optimal condition for mounting heavy fixtures up to 68 kg (150 lbs).",
        "Use masonry expansion anchors when mounting fixtures into solid masonry core."
      ]
    };
  }
  if (wallType === "hollow" && !hasCrack) {
    return {
      minCostUsd: 25,
      maxCostUsd: 75,
      minCostInr: 2e3,
      maxCostInr: 6e3,
      laborHours: "1 – 2 hrs",
      difficulty: "Easy DIY",
      urgencyLevel: "Prompt Attention Recommended",
      urgencyColor: "amber",
      anchors: [
        { name: "Heavy-Duty Toggle Bolt", type: "Hollow Wall / Drywall Cavity", maxLoadKg: 35, recommendedDrillBitMm: 12 },
        { name: "SnapSkru Self-Drilling Hollow Anchor", type: "Cavity Drywall", maxLoadKg: 18, recommendedDrillBitMm: 6 }
      ],
      materials: [
        { item: "Toggle Bolt Hardware Pack", purpose: "Spreading load behind hollow drywall cavity" },
        { item: "Wall Stud Finder Scanner", purpose: "Locating wooden or steel studs for heavy loads" }
      ],
      repairSteps: [
        "Internal cavity/void detected behind wall face.",
        "Avoid mounting heavy fixtures (> 16kg / 35lbs) directly to drywall cavity without stud support.",
        "Use spring toggle bolts that expand behind the hollow cavity layer."
      ]
    };
  }
  const isHighSeverity = severity === "High" || crackCount > 2;
  return {
    minCostUsd: isHighSeverity ? 180 : 60,
    maxCostUsd: isHighSeverity ? 550 : 180,
    minCostInr: isHighSeverity ? 14500 : 4800,
    maxCostInr: isHighSeverity ? 44e3 : 14500,
    laborHours: isHighSeverity ? "6 – 12 hrs" : "2 – 4 hrs",
    difficulty: "Professional Required",
    urgencyLevel: isHighSeverity ? "Urgent Structural Action Needed" : "Prompt Attention Recommended",
    urgencyColor: isHighSeverity ? "rose" : "amber",
    anchors: [
      { name: "Do NOT Anchor in Crack Zone", type: "Relocate > 15 cm Away", maxLoadKg: 0, recommendedDrillBitMm: 0 },
      { name: "Epoxy Resin Injection Port (Deep Repair)", type: "Pressure Grouting (If Deep Void)", maxLoadKg: 50, recommendedDrillBitMm: 8 }
    ],
    materials: [
      { item: "High-Viscosity Structural Epoxy Injection Resin", purpose: "Bonding cracked masonry cores and sealing void gaps without drilling" },
      { item: "Polyurethane Foam Wall Crack Filler", purpose: "Waterproofing and sealing surface hairline fracture cracks" },
      { item: "Fiberglass Wall Reinforcement Mesh Tape", purpose: "Preventing crack recurrence under thermal expansion" }
    ],
    repairSteps: [
      "NO DRILLING REQUIRED for surface crack repair: Clean loose dust from crack channel using air compressor.",
      "Inject structural epoxy resin directly into crack channel and apply fiberglass reinforcement mesh tape.",
      "CRITICAL: Do NOT drill or anchor mounting hardware into the crack path; relocate fixture holes by > 15 cm (6 in).",
      "Allow 24 hours full cure time before applying paint or structural load testing."
    ]
  };
}
function RepairEstimatorCard({
  wallType,
  hasCrack = false,
  crackCount = 0,
  severity = "Low",
  crackLengthPx
}) {
  const [currency, setCurrency] = reactExports.useState("usd");
  const estimate = calculateRepairEstimate({ wallType, hasCrack, crackCount, severity });
  const urgencyStyles = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/40 bg-rose-500/15 text-rose-300"
  }[estimate.urgencyColor];
  const minCost = currency === "usd" ? `$${estimate.minCostUsd}` : `₹${estimate.minCostInr.toLocaleString()}`;
  const maxCost = currency === "usd" ? `$${estimate.maxCostUsd}` : `₹${estimate.maxCostInr.toLocaleString()}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6 shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-foreground", children: "Repair Cost & Hardware Anchor Estimator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Automated material recommendations & cost projections" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center rounded-lg border border-white/15 bg-white/5 p-1 text-xs font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCurrency("usd"),
            className: `rounded-md px-3 py-1 transition ${currency === "usd" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`,
            children: "$ USD"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCurrency("inr"),
            className: `rounded-md px-3 py-1 transition ${currency === "inr" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`,
            children: "₹ INR"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-emerald-400" }),
          " Estimated Repair Cost"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-foreground tabular-nums", children: estimate.maxCostUsd === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-400 text-xl font-bold", children: [
          currency === "usd" ? "$0" : "₹0",
          " (No Repair Needed)"
        ] }) : `${minCost} – ${maxCost}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: estimate.maxCostUsd === 0 ? "Wall is structurally optimal" : "Includes materials & labor" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-sky-400" }),
          " Estimated Labor Time"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-foreground tabular-nums", children: estimate.laborHours }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sky-400 font-medium", children: estimate.difficulty })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 space-y-1 ${urgencyStyles}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
          " Urgency Level"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold leading-tight", children: estimate.urgencyLevel })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
        " Recommended Hardware & Mounting Anchors"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-white/10 bg-black/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-white/10 bg-white/5 text-muted-foreground font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Hardware Anchor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Suitable Surface" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Max Load Limit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Drill Bit Size" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-white/5 text-foreground", children: estimate.anchors.map((anchor, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/[0.02]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-primary", children: anchor.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: anchor.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold tabular-nums", children: anchor.maxLoadKg > 0 ? `${anchor.maxLoadKg} kg (${Math.round(anchor.maxLoadKg * 2.20462)} lbs)` : "N/A (Restricted)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 tabular-nums", children: anchor.recommendedDrillBitMm > 0 ? `${anchor.recommendedDrillBitMm} mm` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-400 font-bold", children: "Do Not Drill (Relocate Hole)" }) })
        ] }, idx)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
          " Recommended Materials & Supplies"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: estimate.materials.map((mat, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-amber-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: mat.item })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground pl-5", children: mat.purpose })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          " Structural Action Plan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: estimate.repairSteps.map((step, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]", children: idx + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/90 leading-relaxed", children: step })
        ] }, idx)) })
      ] })
    ] })
  ] });
}
export {
  RepairEstimatorCard as R
};
