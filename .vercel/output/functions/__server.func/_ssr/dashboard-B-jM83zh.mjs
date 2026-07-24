import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as api } from "./router-RbAlCkzs.mjs";
import { B as Button } from "./button-DLB67tUv.mjs";
import { c as ShieldCheck, d as ArrowRight, n as RefreshCw, S as Sparkles, M as Mic, C as Camera, A as Activity, D as Calendar, B as Box, k as Radio, T as TriangleAlert, v as Clock, F as FileText, G as CircleCheckBig, h as ShieldAlert } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function DashboardView() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = reactExports.useState(null);
  const [recentScans, setRecentScans] = reactExports.useState([]);
  const [recentVisualScans, setRecentVisualScans] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, visualRes] = await Promise.all([
        api.getDashboardStats(),
        api.getVisualScans().catch(() => ({ success: false, scans: [] }))
      ]);
      if (res.success) {
        setStats(res.stats);
        setRecentScans(res.recentScans || []);
      }
      if (visualRes.success) {
        setRecentVisualScans(visualRes.scans || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);
  if (authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Loading authentication state…" }) });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Authentication Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please log in or create an account to view your acoustic & visual wall analytics." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/auth",
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90",
          children: [
            "Sign In to Access Dashboard",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  }
  const latestAcoustic = recentScans[0];
  const latestVisual = recentVisualScans[0];
  const acousticHasDefect = latestAcoustic && latestAcoustic.wallType !== "solid";
  const visualHasDefect = latestVisual && latestVisual.hasCrack;
  let combinedVerdictText = "No structural defects detected. Wall exhibits solid resonance and zero surface cracks.";
  let combinedVerdictColor = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  let combinedVerdictIcon = /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-emerald-400" });
  if (acousticHasDefect && visualHasDefect) {
    combinedVerdictText = "High likelihood of wall damage. Professional structural inspection recommended.";
    combinedVerdictColor = "border-rose-500/40 bg-rose-500/15 text-rose-300";
    combinedVerdictIcon = /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 text-rose-400" });
  } else if (acousticHasDefect) {
    combinedVerdictText = "Internal cavity or resonance defect detected via acoustic echo. Monitor regularly.";
    combinedVerdictColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
    combinedVerdictIcon = /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-400" });
  } else if (visualHasDefect) {
    combinedVerdictText = "Surface crack detected visually; structural core retains solid acoustic resonance.";
    combinedVerdictColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
    combinedVerdictIcon = /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-400" });
  }
  const total = stats?.totalScans || 0;
  const solidPct = total > 0 ? Math.round((stats?.solidCount || 0) / total * 100) : 0;
  const hollowPct = total > 0 ? Math.round((stats?.hollowCount || 0) / total * 100) : 0;
  const crackedPct = total > 0 ? Math.round((stats?.crackedCount || 0) / total * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-6xl px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight md:text-4xl", children: "Inspection Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Combined Multi-Modal Acoustic Resonance & AI Visual Crack Analytics" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: fetchDashboardData,
          disabled: loading,
          className: "gap-2 border-white/15 bg-white/5 hover:bg-white/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }),
            "Refresh Data"
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        className: `mb-8 rounded-2xl border-2 p-6 shadow-xl ${combinedVerdictColor}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            " COMBINED MULTI-MODAL DIAGNOSTIC VERDICT"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              combinedVerdictIcon,
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-extrabold md:text-xl", children: combinedVerdictText })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/scan",
                  className: "inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3.5 w-3.5 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Acoustic Test" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/visual-scan",
                  className: "inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5 text-amber-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Visual Test" })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl border border-white/10 p-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
            " 1. Acoustic Resonance Result"
          ] }),
          latestAcoustic && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-primary", children: [
            latestAcoustic.confidenceScore,
            "% Confidence"
          ] })
        ] }),
        latestAcoustic ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: latestAcoustic.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Peak: ",
            latestAcoustic.peakFrequency.toFixed(0),
            " Hz • RMS: ",
            latestAcoustic.rms.toFixed(3)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-foreground/80", children: latestAcoustic.recommendation })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center text-xs text-muted-foreground", children: [
          "No acoustic scan recorded yet. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scan", className: "text-primary hover:underline", children: "Perform Acoustic Test" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl border border-white/10 p-6 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
            " 2. AI Visual Inspection Result"
          ] }),
          latestVisual && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300", children: [
            "Health Score: ",
            latestVisual.wallHealthScore,
            "%"
          ] })
        ] }),
        latestVisual ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: latestVisual.hasCrack ? `⚠ ${latestVisual.crackCount} Crack(s) Detected` : "✓ No Visible Crack" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Severity: ",
            latestVisual.overallSeverity,
            " • Largest Crack: ",
            latestVisual.largestCrackPx,
            " px"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-foreground/80", children: latestVisual.recommendation })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center text-xs text-muted-foreground", children: [
          "No visual scan recorded yet. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/visual-scan", className: "text-amber-400 hover:underline", children: "Perform Visual AI Test" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl border border-white/10 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Scans" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums text-foreground", children: stats?.totalScans ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Lifetime records" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl border border-white/10 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Today's Scans" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-blue-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums text-foreground", children: stats?.todayScans ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: "Recorded today" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl border border-stone-400/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium uppercase tracking-wider text-stone-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Solid Walls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "h-4 w-4 text-stone-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums text-foreground", children: stats?.solidCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-stone-400", children: [
          solidPct,
          "% of total"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl border border-teal-400/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium uppercase tracking-wider text-teal-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hollow Walls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4 text-teal-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums text-foreground", children: stats?.hollowCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-teal-400", children: [
          hollowPct,
          "% of total"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl border border-amber-400/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-medium uppercase tracking-wider text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cracked Walls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-3xl font-bold tabular-nums text-foreground", children: stats?.crackedCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-amber-400", children: [
          crackedPct,
          "% of total"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass mt-8 rounded-2xl border border-white/10 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Wall Classification Distribution" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Overall structural composition from your inspection logs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex h-4 overflow-hidden rounded-full bg-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${solidPct}%` }, className: "bg-stone-400 transition-all duration-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${hollowPct}%` }, className: "bg-teal-400 transition-all duration-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${crackedPct}%` }, className: "bg-amber-400 transition-all duration-500" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-6 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-stone-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Solid (",
            solidPct,
            "%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-teal-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Hollow (",
            hollowPct,
            "%)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Cracked (",
            crackedPct,
            "%)"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass mt-8 rounded-2xl border border-white/10 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Recent Inspection Logs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Latest wall scans recorded" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/history", className: "flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View All History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: recentScans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center text-xs text-muted-foreground", children: [
        "No scan history found. Go to the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scan", className: "text-primary hover:underline", children: "Scan page" }),
        " to perform your first wall diagnostic."
      ] }) : recentScans.slice(0, 5).map((scan) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${scan.wallType === "solid" ? "bg-stone-500/20 text-stone-300" : scan.wallType === "cracked" ? "bg-amber-500/20 text-amber-300" : "bg-teal-500/20 text-teal-300"}`,
                  children: [
                    scan.wallType === "solid" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "h-5 w-5" }),
                    scan.wallType === "cracked" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }),
                    scan.wallType === "hollow" && /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-5 w-5" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground", children: scan.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                    new Date(scan.scanDate).toLocaleDateString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Peak: ",
                    scan.peakFrequency.toFixed(0),
                    " Hz"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Confidence: ",
                    scan.confidenceScore,
                    "%"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/report/$id",
                params: { id: scan._id },
                className: "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/10",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 text-primary" }),
                  "View Report"
                ]
              }
            )
          ]
        },
        scan._id
      )) })
    ] })
  ] });
}
const SplitComponent = DashboardView;
export {
  SplitComponent as component
};
