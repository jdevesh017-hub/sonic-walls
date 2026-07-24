import React, { useCallback, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Ruler,
  ShieldCheck,
  FileText,
  LogIn,
  RefreshCcw,
  ExternalLink,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnotatedViewer } from "./AnnotatedViewer";
import { RealtimeCrackDetector } from "./RealtimeCrackDetector";
import { analyzeWallImage } from "@/lib/vision-analyzer";
import { ScaleReferenceType, VisualAnalysisResult } from "@/types/vision";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type Phase = "idle" | "webcam" | "analyzing" | "done";

export function VisualScan() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [analysisStepText, setAnalysisStepText] = useState("Preprocessing wall image…");
  const [scaleType, setScaleType] = useState<ScaleReferenceType>("none");
  const [result, setResult] = useState<VisualAnalysisResult | null>(null);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Webcam Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const saveVisualScanToBackend = async (res: VisualAnalysisResult) => {
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
        originalImageBase64: res.originalImageDataUrl,
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

  const runAnalysis = useCallback(
    async (imageSource: HTMLImageElement | File | Blob) => {
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
        "Calculating severity & wall health score…",
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
          new Promise((r) => setTimeout(r, duration)),
        ]);
        clearInterval(interval);
        setResult(res);
        setPhase("done");

        // Cache instant report in sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "echoscan_latest_report",
            JSON.stringify({
              _id: "instant",
              scanDate: new Date().toISOString(),
              wallType: res.hasCrack ? "cracked" : "solid",
              label: res.hasCrack ? `Visible Crack (${res.overallSeverity} Severity)` : "No Visible Crack",
              confidenceScore: res.avgConfidence,
              peakFrequency: res.hasCrack ? 450 : 210,
              rms: 0.12,
              duration: 1.0,
              recommendation: res.recommendation,
              fftSummary: new Array(96).fill(0.2),
            })
          );
        }

        if (isAuthenticated) {
          saveVisualScanToBackend(res);
        }
      } catch (e: any) {
        clearInterval(interval);
        setError(e?.message ?? "Visual wall analysis failed.");
        setPhase("idle");
      }
    },
    [isAuthenticated, scaleType]
  );

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid wall image file (JPG, PNG, WEBP).");
      return;
    }
    runAnalysis(file);
  };

  // Webcam Handlers
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

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopWebcam();
    canvas.toBlob((blob) => {
      if (blob) runAnalysis(blob);
    }, "image/jpeg");
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Loading authentication state…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Authentication Required</h2>
            <p className="text-sm text-muted-foreground">
              Please sign in or create an account to access AI visual wall crack analysis.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Register to Scan</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Visual Wall Inspection
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient-brand">Visual</span>{" "}
          <span className="text-foreground">Crack Analyzer</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Upload or capture a photo of any wall surface — our computer vision model will detect cracks, measure length & width, and rate wall health.
        </p>
      </motion.div>

      {/* Main Container */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10"
      >


        {/* Mode Selector: File Dropzone OR Live Webcam */}
        {phase === "idle" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Dropzone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/10 shadow-brand"
                  : "border-white/15 hover:border-primary/60 hover:bg-white/[0.03]"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full ring-1 ring-white/20 group-hover:scale-110 transition-transform"
                style={{ background: "var(--gradient-brand-soft)" }}
              >
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drop a wall image here</p>
                <p className="mt-1 text-xs text-muted-foreground">or click to browse · JPG, PNG, WEBP</p>
              </div>
            </label>

            {/* Camera View Launcher */}
            <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-10">
              <button
                onClick={startWebcam}
                className="relative flex h-20 w-20 items-center justify-center rounded-full text-background shadow-brand transition hover:scale-105"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Camera className="h-8 w-8" />
              </button>
              <div className="text-center">
                <p className="font-medium">Capture Photo with Webcam</p>
                <p className="mt-1 text-xs text-muted-foreground">Take a photo of the wall directly</p>
              </div>
            </div>
          </div>
        )}

        {/* Live Real-Time Camera Crack Detector HUD */}
        {phase === "webcam" && (
          <div className="py-2">
            <RealtimeCrackDetector
              onCapture={(blob) => runAnalysis(blob)}
              onCancel={() => setPhase("idle")}
            />
          </div>
        )}

        {/* AI Progress Bar */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-muted-foreground">
                <Activity className="h-4 w-4 animate-pulse text-primary" /> Running Computer Vision Model
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-100"
                  style={{ width: `${progress}%`, background: "var(--gradient-brand)" }}
                />
              </div>
              <div className="text-center space-y-1">
                <div className="text-gradient-brand text-3xl font-semibold tabular-nums">{progress}%</div>
                <div className="text-xs text-muted-foreground font-mono">{analysisStepText}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inspection Result View */}
        {phase === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Status Banner & Account Save Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
                {saveStatus === "saving" && <span>Saving visual scan to account history…</span>}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Visual scan log saved to history</span>
                  </>
                )}
                {saveStatus === "error" && <span>Processed locally (Backend sync error)</span>}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <span>Sign in to save visual wall inspection logs permanently</span>
                <Link to="/auth" className="flex items-center gap-1 font-semibold text-primary hover:underline">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </Link>
              </div>
            )}

            {/* Wall Status Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                  result.hasCrack
                    ? "bg-amber-500/20 text-amber-300 ring-4 ring-amber-400/30"
                    : "bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-400/30"
                }`}
              >
                {result.hasCrack ? <AlertTriangle className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                  WALL INSPECTION STATUS
                </div>
                <h2 className="mt-1 text-3xl font-extrabold md:text-4xl text-foreground">
                  {result.hasCrack ? "⚠ Visible Crack Detected" : "✓ No Visible Crack"}
                </h2>
              </div>
            </div>

            {/* Summary Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="Visible Cracks" value={`${result.crackCount}`} icon={<Layers className="h-4 w-4 text-sky-400" />} />
              <MetricCard label="Avg Confidence" value={`${result.avgConfidence}%`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
              <MetricCard
                label="Largest Crack"
                value={result.largestCrackRealMm ? `${result.largestCrackRealMm} mm` : `${result.largestCrackPx} px`}
                icon={<Ruler className="h-4 w-4 text-amber-400" />}
              />
              <MetricCard
                label="Average Width"
                value={result.avgWidthRealMm ? `${result.avgWidthRealMm} mm` : `${result.avgWidthPx} px`}
                icon={<Activity className="h-4 w-4 text-cyan-400" />}
              />
              <MetricCard label="Wall Condition" value={result.wallCondition} icon={<ShieldCheck className="h-4 w-4 text-indigo-400" />} />
            </div>

            {/* Wall Health Score Meter */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground">Overall Wall Health Score</span>
                <span className="font-bold text-foreground text-sm tabular-nums">{result.wallHealthScore}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.wallHealthScore}%`,
                    background:
                      result.wallHealthScore > 80
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : result.wallHealthScore > 60
                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        : "linear-gradient(90deg, #f43f5e, #fb7185)",
                  }}
                />
              </div>
            </div>



            {/* Interactive Image Annotation & Zoom Inspection Tool */}
            <AnnotatedViewer result={result} />

            {/* Technical Structural Recommendation Card */}
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
                <ShieldAlert className="h-4 w-4" /> AI Structural Inspector Recommendation
              </div>
              <p className="text-sm leading-relaxed text-foreground font-medium">{result.recommendation}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/report/$id"
                params={{ id: savedScanId || "latest" }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-lg"
              >
                <FileText className="h-4 w-4" />
                <span>View Web Inspection Report</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </Link>

              <Button variant="secondary" onClick={reset} className="gap-2">
                <RefreshCcw className="h-4 w-4" /> Scan Another Wall Image
              </Button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-xl space-y-4 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{error}</h3>
              <p className="text-xs text-muted-foreground">Please select an option below to retry your wall inspection.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setError(null);
                      handleFileSelect(f);
                    }
                  }}
                />
                <Upload className="h-4 w-4" /> Upload Again
              </label>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
