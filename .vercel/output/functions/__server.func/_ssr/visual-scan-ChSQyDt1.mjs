import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DLB67tUv.mjs";
import { a as analyzeWallImage, R as RealtimeCrackDetector, A as AnnotatedViewer } from "./vision-analyzer-C1XPunSU.mjs";
import { u as useAuth, a as api } from "./router-B218Yx_X.mjs";
import { c as ShieldCheck, b as LogIn, d as ArrowRight, S as Sparkles, e as Upload, C as Camera, A as Activity, f as CircleCheck, T as TriangleAlert, g as Layers, R as Ruler, h as ShieldAlert, F as FileText, E as ExternalLink, i as RefreshCcw } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function VisualScan() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [phase, setPhase] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(0);
  const [analysisStepText, setAnalysisStepText] = reactExports.useState("Preprocessing wall image…");
  const [scaleType, setScaleType] = reactExports.useState("none");
  const [result, setResult] = reactExports.useState(null);
  const [savedScanId, setSavedScanId] = reactExports.useState(null);
  const [saveStatus, setSaveStatus] = reactExports.useState("idle");
  const [error, setError] = reactExports.useState(null);
  const [dragOver, setDragOver] = reactExports.useState(false);
  reactExports.useRef(null);
  const webcamStreamRef = reactExports.useRef(null);
  const saveVisualScanToBackend = async (res) => {
    if (!isAuthenticated) return;
    setSaveStatus("saving");
    try {
      const createRes = await api.createVisualScan({
        hasCrack: res.hasCrack,
        crackCount: res.crackCount,
        avgConfidence: res.avgConfidence,
        largestCrackPx: res.largestCrackPx,
        avgWidthPx: res.avgWidthPx,
        overallSeverity: res.overallSeverity,
        wallCondition: res.wallCondition,
        wallHealthScore: res.wallHealthScore,
        recommendation: res.recommendation,
        cracks: res.cracks,
        scaleReferenceType: res.scaleReference.type,
        originalImageBase64: res.originalImageDataUrl
      });
      if (createRes.success && createRes.scan) {
        setSavedScanId(createRes.scan._id);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };
  const runAnalysis = reactExports.useCallback(
    async (imageSource) => {
      setPhase("analyzing");
      setProgress(0);
      setResult(null);
      setSavedScanId(null);
      setSaveStatus("idle");
      setError(null);
      const steps = [
        "Resizing & normalizing image dimensions…",
        "Adjusting contrast & brightness levels…",
        "Applying noise reduction & Sobel edge filter…",
        "Running crack segmentation & contour extraction…",
        "Calculating severity & wall health score…"
      ];
      let currentStepIndex = 0;
      const interval = setInterval(() => {
        currentStepIndex = (currentStepIndex + 1) % steps.length;
        setAnalysisStepText(steps[currentStepIndex]);
      }, 350);
      const start = Date.now();
      const duration = 1800;
      const tick = () => {
        const t = Math.min(1, (Date.now() - start) / duration);
        setProgress(Math.round(t * 100));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      try {
        const [res] = await Promise.all([
          analyzeWallImage(imageSource, scaleType),
          new Promise((r) => setTimeout(r, duration))
        ]);
        clearInterval(interval);
        setResult(res);
        setPhase("done");
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "echoscan_latest_report",
            JSON.stringify({
              _id: "instant",
              scanDate: (/* @__PURE__ */ new Date()).toISOString(),
              wallType: res.hasCrack ? "cracked" : "solid",
              label: res.hasCrack ? `Visible Crack (${res.overallSeverity} Severity)` : "No Visible Crack",
              confidenceScore: res.avgConfidence,
              peakFrequency: res.hasCrack ? 450 : 210,
              rms: 0.12,
              duration: 1,
              recommendation: res.recommendation,
              fftSummary: new Array(96).fill(0.2)
            })
          );
        }
        if (isAuthenticated) {
          saveVisualScanToBackend(res);
        }
      } catch (e) {
        clearInterval(interval);
        setError(e?.message ?? "Visual wall analysis failed.");
        setPhase("idle");
      }
    },
    [isAuthenticated, scaleType]
  );
  const handleFileSelect = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid wall image file (JPG, PNG, WEBP).");
      return;
    }
    runAnalysis(file);
  };
  const startWebcam = () => {
    setError(null);
    setPhase("webcam");
  };
  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    setPhase("idle");
  };
  const reset = () => {
    stopWebcam();
    setResult(null);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setSavedScanId(null);
  };
  if (authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Loading authentication state…" }) });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 border border-white/10 shadow-2xl space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Authentication Required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please sign in or create an account to access AI visual wall crack analysis." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/auth",
          className: "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign In / Register to Scan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ]
        }
      ) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-5xl px-4 py-10 md:py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -16 },
        animate: { opacity: 1, y: 0 },
        className: "mb-10 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
            "AI Visual Wall Inspection"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-bold tracking-tight md:text-6xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "Visual" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Crack Analyzer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base", children: "Upload or capture a photo of any wall surface — our computer vision model will detect cracks, measure length & width, and rate wall health." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.section,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10",
        children: [
          phase === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                onDragOver: (e) => {
                  e.preventDefault();
                  setDragOver(true);
                },
                onDragLeave: () => setDragOver(false),
                onDrop: (e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelect(f);
                },
                className: `group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all ${dragOver ? "border-primary bg-primary/10 shadow-brand" : "border-white/15 hover:border-primary/60 hover:bg-white/[0.03]"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: (e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-14 w-14 items-center justify-center rounded-full ring-1 ring-white/20 group-hover:scale-110 transition-transform",
                      style: { background: "var(--gradient-brand-soft)" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6 text-primary" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "Drop a wall image here" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or click to browse · JPG, PNG, WEBP" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: startWebcam,
                  className: "relative flex h-20 w-20 items-center justify-center rounded-full text-background shadow-brand transition hover:scale-105",
                  style: { background: "var(--gradient-brand)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-8 w-8" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Capture Photo with Webcam" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Take a photo of the wall directly" })
              ] })
            ] })
          ] }),
          phase === "webcam" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            RealtimeCrackDetector,
            {
              onCapture: (blob) => runAnalysis(blob),
              onCancel: () => setPhase("idle")
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "analyzing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              className: "space-y-6 py-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 animate-pulse text-primary" }),
                  " Running Computer Vision Model"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-2.5 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-full rounded-full transition-[width] duration-100",
                    style: { width: `${progress}%`, background: "var(--gradient-brand)" }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gradient-brand text-3xl font-semibold tabular-nums", children: [
                    progress,
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: analysisStepText })
                ] })
              ]
            }
          ) }),
          phase === "done" && result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              className: "space-y-8",
              children: [
                isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400", children: [
                  saveStatus === "saving" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Saving visual scan to account history…" }),
                  saveStatus === "saved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Visual scan log saved to history" })
                  ] }),
                  saveStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Processed locally (Backend sync error)" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign in to save visual wall inspection logs permanently" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", className: "flex items-center gap-1 font-semibold text-primary hover:underline", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-3.5 w-3.5" }),
                    " Sign In"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${result.hasCrack ? "bg-amber-500/20 text-amber-300 ring-4 ring-amber-400/30" : "bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-400/30"}`,
                      children: result.hasCrack ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground", children: "WALL INSPECTION STATUS" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl font-extrabold md:text-4xl text-foreground", children: result.hasCrack ? "⚠ Visible Crack Detected" : "✓ No Visible Crack" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Visible Cracks", value: `${result.crackCount}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4 text-sky-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Avg Confidence", value: `${result.avgConfidence}%`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MetricCard,
                    {
                      label: "Largest Crack",
                      value: result.largestCrackRealMm ? `${result.largestCrackRealMm} mm` : `${result.largestCrackPx} px`,
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { className: "h-4 w-4 text-amber-400" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MetricCard,
                    {
                      label: "Average Width",
                      value: result.avgWidthRealMm ? `${result.avgWidthRealMm} mm` : `${result.avgWidthPx} px`,
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-cyan-400" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Wall Condition", value: result.wallCondition, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-indigo-400" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/30 p-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold uppercase tracking-wider text-muted-foreground", children: "Overall Wall Health Score" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground text-sm tabular-nums", children: [
                      result.wallHealthScore,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-full rounded-full transition-all duration-700",
                      style: {
                        width: `${result.wallHealthScore}%`,
                        background: result.wallHealthScore > 80 ? "linear-gradient(90deg, #10b981, #34d399)" : result.wallHealthScore > 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #f43f5e, #fb7185)"
                      }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotatedViewer, { result }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
                    " AI Structural Inspector Recommendation"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-foreground font-medium", children: result.recommendation })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Link,
                    {
                      to: "/report/$id",
                      params: { id: savedScanId || "latest" },
                      className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-lg",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Web Inspection Report" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-80" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: reset, className: "gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-4 w-4" }),
                    " Scan Another Wall Image"
                  ] })
                ] })
              ]
            }
          ),
          error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-xl space-y-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-foreground", children: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Please select an option below to retry your wall inspection." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setError(null);
                      handleFileSelect(f);
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
              " Upload Again"
            ] }) })
          ] })
        ]
      }
    )
  ] });
}
function MetricCard({ label, value, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-bold tabular-nums text-foreground", children: value })
  ] });
}
const SplitComponent = VisualScan;
export {
  SplitComponent as component
};
