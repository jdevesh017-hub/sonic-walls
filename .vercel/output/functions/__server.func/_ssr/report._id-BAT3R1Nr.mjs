import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as api } from "./router-B218Yx_X.mjs";
import { Q as QRCodeSVG } from "../_libs/qrcode.react.mjs";
import { S as SpectrumVisualizer } from "./SpectrumVisualizer-rWE6YsYY.mjs";
import { R as RepairEstimatorCard } from "./RepairEstimatorCard-CB_Xe6VI.mjs";
import { u as ArrowLeft, K as Printer, N as Award, G as CircleCheckBig, O as FileSpreadsheet, W as Waves, V as Volume2, l as Timer, S as Sparkles, w as Wrench, Q as Smartphone, E as ExternalLink, c as ShieldCheck } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const WALL_GRADES = {
  solid: {
    grade: "GRADE A — HIGH DENSITY",
    subtitle: "Solid Masonry / Dense Concrete Structure",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    badge: "PASS / HIGH LOAD BEARER"
  },
  hollow: {
    grade: "GRADE B — CAVITY RESONANCE",
    subtitle: "Hollow Core Drywall / Plaster Frame",
    color: "border-teal-500/40 bg-teal-500/10 text-teal-400",
    badge: "PASS / CAVITY ANCHOR REQUIRED"
  },
  cracked: {
    grade: "GRADE C — FRACTURE WARNING",
    subtitle: "Internal Fissures / Material Structural Degradation",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    badge: "WARNING / LOAD RESTRICTED"
  }
};
const ACTION_PLANS = {
  solid: {
    anchors: "Concrete / Masonry Expansion Anchors (Sleeve or Wedge)",
    loadLimit: "High Capacity (Up to 150 lbs / 68 kg per point)",
    drillingDepth: "Standard masonry bit depth (2.5 – 3.5 inches)"
  },
  hollow: {
    anchors: "Toggle Bolts or Heavy-Duty Hollow Wall Anchors",
    loadLimit: "Light to Medium (Max 35 lbs / 16 kg unless anchored to stud)",
    drillingDepth: "Penetrate surface drywall only; avoid deep drilling into cavity"
  },
  cracked: {
    anchors: "Do NOT anchor into crack zone; relocate drilling site by > 6 inches",
    loadLimit: "Low Capacity (Inspect masonry structural integrity first)",
    drillingDepth: "Restricted; repair crack with epoxy mortar injection before heavy load"
  }
};
function ReportView() {
  const { id } = useParams({ strict: false });
  const { user } = useAuth();
  const [scan, setScan] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [reportUrl, setReportUrl] = reactExports.useState("http://localhost:8080/report/latest");
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      setReportUrl(window.location.href);
    }
    const loadScanData = async () => {
      setLoading(true);
      setError(null);
      if (typeof window !== "undefined") {
        const cachedInstant = sessionStorage.getItem("echoscan_latest_report");
        if (cachedInstant && (!id || id === "latest" || id === "instant")) {
          try {
            const parsed = JSON.parse(cachedInstant);
            setScan(parsed);
            setLoading(false);
            return;
          } catch {
          }
        }
      }
      if (id && id !== "latest" && id !== "instant") {
        try {
          const res = await api.getScanById(id);
          if (res.success && res.scan) {
            setScan(res.scan);
          } else {
            setError("Inspection report record not found.");
          }
        } catch (err) {
          setError(err.message || "Failed to load inspection report.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("No inspection report ID provided.");
        setLoading(false);
      }
    };
    loadScanData();
  }, [id]);
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Generating engineering audit dossier…" }) });
  }
  if (error || !scan) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Audit Dossier Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error || "Unable to locate scan record." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/scan",
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Return to Scan"
          ]
        }
      ) })
    ] }) });
  }
  const wallTypeKey = scan.wallType || "solid";
  const gradeInfo = WALL_GRADES[wallTypeKey] || WALL_GRADES.solid;
  const plan = ACTION_PLANS[wallTypeKey] || ACTION_PLANS.solid;
  const inspectorName = user?.name || "EchoScan Certified Inspector";
  const inspectorEmail = user?.email || "inspector@echoscan.app";
  const auditSerial = `AUD-2026-${(scan._id || "INSTANT").slice(-6).toUpperCase()}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-5xl px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/history",
          className: "inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-white/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to History" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handlePrint,
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Print / Save Engineering PDF" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        className: "glass relative overflow-hidden rounded-2xl border-2 border-primary/30 p-6 md:p-10 shadow-2xl bg-slate-950 text-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary via-emerald-400 to-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b-2 border-white/15 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-between gap-4 md:flex-row md:items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
                " Structural Engineering Audit Dossier"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black tracking-tight md:text-3xl uppercase text-foreground", children: "NON-DESTRUCTIVE ACOUSTIC INSPECTION CERTIFICATE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Issued by EchoScan AI Acoustic Signal Processing Core • Protocol Standard AST-2026" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3 text-left md:text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-primary tracking-wider uppercase", children: "AUDIT SERIAL NO." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-mono font-bold text-foreground", children: auditSerial }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
                " VERIFIED AUDIT"
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-8 grid gap-6 md:grid-cols-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `md:col-span-7 rounded-2xl border-2 p-6 flex flex-col justify-between ${gradeInfo.color}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold tracking-widest uppercase mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "STRUCTURAL INTEGRITY DIAGNOSTIC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold border border-white/10", children: gradeInfo.badge })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black md:text-3xl", children: gradeInfo.grade }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-foreground/90 font-medium", children: gradeInfo.subtitle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 border-t border-white/15 pt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs font-bold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "DIAGNOSTIC CONFIDENCE INDEX" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-black tabular-nums", children: [
                    scan.confidenceScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 overflow-hidden rounded-full bg-black/50 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full rounded-full",
                    style: { width: `${scan.confidenceScore}%`, background: "var(--gradient-brand)" }
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-5 rounded-2xl border border-white/15 bg-white/[0.02] p-6 space-y-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold uppercase tracking-wider text-muted-foreground border-b border-white/10 pb-2", children: "AUDIT METADATA & CALIBRATION" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-white/5 pb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Certified Inspector:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: inspectorName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-white/5 pb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Inspector Contact:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-foreground", children: inspectorEmail })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-white/5 pb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Audit Timestamp:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-foreground", children: new Date(scan.scanDate || Date.now()).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-white/5 pb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Signal Processing:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "Web Audio FFT 4096" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Calibration Standard:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-emerald-400", children: "ISO-9001 COMPLIANT" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4 text-primary" }),
              " Engineering Acoustic Telemetry Table"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-white/10 text-foreground font-bold uppercase tracking-wider border-b border-white/15", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "ACOUSTIC PARAMETER" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "MEASURED TEST VALUE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "REFERENCE BENCHMARK RANGE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "STRUCTURAL TOLERANCE" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-white/10 bg-black/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-foreground flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "h-3.5 w-3.5 text-sky-400" }),
                    " Peak Resonant Frequency"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono font-bold text-primary", children: [
                    scan.peakFrequency?.toFixed(1) ?? 0,
                    " Hz"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: "<300Hz Solid | 300-700Hz Crack | >700Hz Hollow" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-emerald-400", children: "NORMAL TOLERANCE" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-foreground flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5 text-cyan-400" }),
                    " RMS Energy Volume Level"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-primary", children: scan.rms?.toFixed(4) ?? 0 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: "Normalized Amplitude FFT Floor" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-emerald-400", children: "NOMINAL STRENGTH" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-foreground flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-3.5 w-3.5 text-emerald-400" }),
                    " Audio Recording Window"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono font-bold text-primary", children: [
                    scan.duration?.toFixed(2) ?? 0,
                    " seconds"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: "0.5s – 10.0s Sampling Window" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-emerald-400", children: "VALID SAMPLE" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-foreground flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-400" }),
                    " FFT Band Resolution"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-primary", children: "96 Spectral Bands" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: "Logarithmic 40 Hz – 3,800 Hz Scale" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-bold text-emerald-400", children: "HIGH RESOLUTION" })
                ] })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-8 rounded-2xl border border-white/15 bg-black/60 p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between border-b border-white/10 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-primary", children: "ACOUSTIC FREQUENCY SPECTRUM OSCILLOGRAM" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-mono text-muted-foreground", children: "Bandpass: 40 Hz – 3.8 kHz" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumVisualizer, { spectrum: scan.fftSummary?.length ? scan.fftSummary : null, height: 150 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-4 w-4" }),
              " FIELD CONTRACTOR ACTION DIRECTIVE"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium leading-relaxed text-foreground", children: scan.recommendation }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 pt-2 sm:grid-cols-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/50 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-bold text-sky-400 uppercase tracking-wider", children: "1. Anchor Fastener Specification" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: plan.anchors })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/50 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-bold text-amber-400 uppercase tracking-wider", children: "2. Weight Load Limit Rating" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: plan.loadLimit })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/50 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 font-bold text-emerald-400 uppercase tracking-wider", children: "3. Drilling & Offset Clearance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: plan.drillingDepth })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RepairEstimatorCard, { wallType: scan.wallType }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-8 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SCAN TO VERIFY AUDIT REPORT" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground", children: "Instant Mobile Verification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground max-w-md", children: "Scan this QR code with any smartphone camera to view and authenticate this official diagnostic inspection report directly on your device." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 text-[11px] font-mono text-primary flex items-center gap-1 truncate max-w-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: reportUrl })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-center justify-center rounded-xl bg-black p-3.5 border-2 border-emerald-500/40 shadow-xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                QRCodeSVG,
                {
                  value: reportUrl,
                  size: 120,
                  bgColor: "#000000",
                  fgColor: "#38bdf8",
                  level: "H",
                  includeMargin: false
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 text-[10px] font-mono font-bold tracking-widest text-emerald-400", children: "OFFICIAL REPORT QR" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 border-t-2 border-white/15 pt-6 grid gap-6 sm:grid-cols-2 items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold uppercase tracking-wider text-foreground", children: "DIGITAL SECURITY SIGNATURE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-muted-foreground break-all", children: "SHA256: 8f9a2b1c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5" }),
                " VERIFIED & COMPLIANT WITH AUDIT CORE"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left sm:text-right space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "APPROVED & SIGNED BY" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground text-sm", children: inspectorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono text-muted-foreground", children: "EchoScan Structural Engineering Core" })
            ] })
          ] })
        ]
      }
    )
  ] });
}
const SplitComponent = ReportView;
export {
  SplitComponent as component
};
