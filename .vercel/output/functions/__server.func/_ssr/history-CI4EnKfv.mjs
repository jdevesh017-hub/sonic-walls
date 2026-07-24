import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as api } from "./router-B218Yx_X.mjs";
import { B as Button } from "./button-DLB67tUv.mjs";
import { S as SpectrumVisualizer } from "./SpectrumVisualizer-rWE6YsYY.mjs";
import { c as ShieldCheck, d as ArrowRight, k as Radio, T as TriangleAlert, B as Box, u as ArrowLeft, v as Clock, W as Waves, V as Volume2, l as Timer, S as Sparkles, w as Wrench, h as ShieldAlert, F as FileText, E as ExternalLink, x as Trash2, g as Layers, M as Mic, C as Camera, y as Search, z as Funnel } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const WALL_META = {
  solid: { icon: Box, color: "from-stone-300 to-stone-400", ring: "ring-stone-300/30" },
  cracked: { icon: TriangleAlert, color: "from-amber-300 to-orange-400", ring: "ring-amber-300/30" },
  hollow: { icon: Radio, color: "from-teal-300 to-cyan-400", ring: "ring-teal-300/30" }
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
function HistoryView() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [scans, setScans] = reactExports.useState([]);
  const [visualScans, setVisualScans] = reactExports.useState([]);
  const [selectedScan, setSelectedScan] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [modeFilter, setModeFilter] = reactExports.useState("all");
  const [wallTypeFilter, setWallTypeFilter] = reactExports.useState("all");
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [acousticRes, visualRes] = await Promise.all([
        api.getScans({ wallType: wallTypeFilter, search }),
        api.getVisualScans().catch(() => ({ success: false, scans: [] }))
      ]);
      if (acousticRes.success) {
        setScans(acousticRes.scans || []);
      }
      if (visualRes.success) {
        setVisualScans(visualRes.scans || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch scan history");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      fetchScans();
    }
  }, [isAuthenticated, wallTypeFilter]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      fetchScans();
    }
  };
  const handleDeleteAcoustic = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan from history?")) return;
    setDeletingId(id);
    try {
      const res = await api.deleteScan(id);
      if (res.success) {
        setScans((prev) => prev.filter((s) => s._id !== id));
        if (selectedScan?._id === id) setSelectedScan(null);
      }
    } catch (err) {
      alert(err.message || "Failed to delete scan");
    } finally {
      setDeletingId(null);
    }
  };
  const handleDeleteVisual = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this visual scan from history?")) return;
    setDeletingId(id);
    try {
      const res = await api.deleteVisualScan(id);
      if (res.success) {
        setVisualScans((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      alert(err.message || "Failed to delete visual scan");
    } finally {
      setDeletingId(null);
    }
  };
  if (authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Loading authentication state…" }) });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Authentication Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please log in or create an account to view and manage your acoustic & visual scan history logs." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/auth",
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90",
          children: [
            "Sign In to View History",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  }
  if (selectedScan) {
    const meta = WALL_META[selectedScan.wallType] || WALL_META.solid;
    const plan = ACTION_PLANS[selectedScan.wallType] || ACTION_PLANS.solid;
    const Icon = meta.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-5xl px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSelectedScan(null),
          className: "mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-white/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to History List" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10 space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Inspection Timestamp: ",
                  new Date(selectedScan.scanDate).toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Scan ID: ",
                selectedScan._id
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-4 ${meta.ring} shadow-brand`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-10 w-10 text-background" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.25em] text-muted-foreground", children: "Detected" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl font-bold md:text-4xl", children: selectedScan.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Confidence Score" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-foreground", children: [
                    selectedScan.confidenceScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full rounded-full",
                    style: { width: `${selectedScan.confidenceScore}%`, background: "var(--gradient-brand)" }
                  }
                ) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "h-4 w-4" }),
                  " Peak Frequency"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xl font-semibold tabular-nums text-foreground", children: [
                  selectedScan.peakFrequency.toFixed(0),
                  " Hz"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }),
                  " RMS Volume"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-semibold tabular-nums text-foreground", children: selectedScan.rms.toFixed(3) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-4 w-4" }),
                  " Duration"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xl font-semibold tabular-nums text-foreground", children: [
                  selectedScan.duration.toFixed(2),
                  " s"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/30 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Frequency spectrum (40 Hz – 3.8 kHz)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary font-medium", children: "Spectral Line Curve" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumVisualizer, { spectrum: selectedScan.fftSummary?.length ? selectedScan.fftSummary : null, height: 150 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
                " Structural Inspection Recommendation"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-foreground font-medium", children: selectedScan.recommendation }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border-t border-white/10 pt-3 grid gap-3 sm:grid-cols-3 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-black/30 p-3 border border-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground font-semibold mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-3.5 w-3.5 text-sky-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recommended Anchors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: plan.anchors })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-black/30 p-3 border border-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground font-semibold mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5 text-amber-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Load Capacity" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: plan.loadLimit })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-black/30 p-3 border border-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground font-semibold mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-3.5 w-3.5 text-emerald-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Drilling Safety Limit" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: plan.drillingDepth })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/report/$id",
                  params: { id: selectedScan._id },
                  className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Web Inspection Report" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-80" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => handleDeleteAcoustic(selectedScan._id),
                  className: "inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delete Scan Log" })
                  ]
                }
              )
            ] })
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-6xl px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight md:text-4xl", children: "Inspection Scan History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage and review all your saved Acoustic FFT diagnostics and AI Visual Crack inspections" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex gap-2 border-b border-white/10 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: modeFilter === "all" ? "default" : "outline",
          onClick: () => setModeFilter("all"),
          className: "gap-2 text-xs font-semibold",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3.5 w-3.5" }),
            " All Scans (",
            scans.length + visualScans.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: modeFilter === "acoustic" ? "default" : "outline",
          onClick: () => setModeFilter("acoustic"),
          className: "gap-2 text-xs font-semibold",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3.5 w-3.5 text-primary" }),
            " Acoustic FFT Scans (",
            scans.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: modeFilter === "visual" ? "default" : "outline",
          onClick: () => setModeFilter("visual"),
          className: "gap-2 text-xs font-semibold",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5 text-amber-400" }),
            " Visual Crack Scans (",
            visualScans.length,
            ")"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass mb-8 flex flex-col gap-4 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSearchSubmit, className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search scan logs by keyword or label…",
            className: "w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-20 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", className: "absolute right-1 top-1 h-7 text-xs px-3", children: "Search" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: wallTypeFilter,
            onChange: (e) => setWallTypeFilter(e.target.value),
            className: "rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Wall Types" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "solid", children: "Solid Walls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hollow", children: "Hollow Walls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cracked", children: "Cracked Walls" })
            ]
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground", children: error }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-muted-foreground", children: "Loading inspection history…" }) : scans.length === 0 && visualScans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-12 text-center border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mx-auto h-8 w-8 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold", children: "No Scans Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "No matching scan records found in history. Try performing a new acoustic or visual scan." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/scan", className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
          " Acoustic Scan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/visual-scan", className: "inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-medium text-slate-950", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
          " Visual Scan"
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
      (modeFilter === "all" || modeFilter === "acoustic") && scans.map((scan) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          onClick: () => setSelectedScan(scan),
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95 },
          className: "glass cursor-pointer rounded-xl border border-white/10 p-5 transition hover:border-primary/50 hover:bg-white/[0.04] group",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${scan.wallType === "solid" ? "bg-stone-500/20 text-stone-300 ring-1 ring-stone-400/30" : scan.wallType === "cracked" ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30" : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30"}`,
                  children: [
                    scan.wallType === "solid" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "h-6 w-6" }),
                    scan.wallType === "cracked" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6" }),
                    scan.wallType === "hollow" && /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-6 w-6" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3 w-3" }),
                    " ACOUSTIC"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground group-hover:text-primary transition", children: scan.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-primary", children: [
                    scan.confidenceScore,
                    "% Confidence"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
                    new Date(scan.scanDate).toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Peak: ",
                    scan.peakFrequency.toFixed(0),
                    " Hz"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "RMS: ",
                    scan.rms.toFixed(3)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-foreground/80 line-clamp-2", children: scan.recommendation })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/report/$id",
                  params: { id: scan._id },
                  onClick: (e) => e.stopPropagation(),
                  className: "inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Report" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => handleDeleteAcoustic(scan._id, e),
                  disabled: deletingId === scan._id,
                  className: "inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ] })
        },
        scan._id
      )),
      (modeFilter === "all" || modeFilter === "visual") && visualScans.map((vScan) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95 },
          className: "glass rounded-xl border border-amber-500/20 p-5 transition hover:border-amber-500/40",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3 w-3" }),
                    " VISUAL AI"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground", children: vScan.hasCrack ? `⚠ ${vScan.crackCount} Visible Crack(s)` : "✓ No Visible Crack" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-amber-300", children: [
                    "Health Score: ",
                    vScan.wallHealthScore,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
                    new Date(vScan.scanDate).toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Severity: ",
                    vScan.overallSeverity
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Largest: ",
                    vScan.largestCrackPx,
                    " px"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-foreground/80 line-clamp-2", children: vScan.recommendation })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => handleDeleteVisual(vScan._id, e),
                disabled: deletingId === vScan._id,
                className: "inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Delete" })
                ]
              }
            ) })
          ] })
        },
        vScan._id
      ))
    ] }) })
  ] });
}
const SplitComponent = HistoryView;
export {
  SplitComponent as component
};
