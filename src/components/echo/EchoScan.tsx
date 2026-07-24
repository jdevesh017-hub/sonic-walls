import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Upload,
  Waves,
  Radio,
  Box,
  AlertTriangle,
  Activity,
  Volume2,
  Timer,
  Sparkles,
  FileText,
  CheckCircle2,
  LogIn,
  ShieldAlert,
  Wrench,
  ExternalLink,
  Camera,
  Layers,
  Ruler,
  Zap,
  ShieldCheck,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectrumVisualizer } from "./SpectrumVisualizer";
import { AnnotatedViewer } from "@/components/vision/AnnotatedViewer";
import { RealtimeCrackDetector } from "@/components/vision/RealtimeCrackDetector";
import { RepairEstimatorCard } from "./RepairEstimatorCard";
import {
  analyzeAudioBuffer,
  blobToAudioBuffer,
  decodeFile,
  type AnalysisResult,
  type WallType,
} from "@/lib/audio-analyzer";
import { analyzeWallImage } from "@/lib/vision-analyzer";
import { ScaleReferenceType, VisualAnalysisResult } from "@/types/vision";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type InspectionMode = "acoustic" | "visual" | "combined";
type Phase = "idle" | "webcam" | "recording" | "analyzing" | "done";

const WALL_META: Record<WallType, { icon: typeof Box; color: string; ring: string }> = {
  solid: { icon: Box, color: "from-stone-300 to-stone-400", ring: "ring-stone-300/30" },
  cracked: { icon: AlertTriangle, color: "from-amber-300 to-orange-400", ring: "ring-amber-300/30" },
  hollow: { icon: Radio, color: "from-teal-300 to-cyan-400", ring: "ring-teal-300/30" },
};

const ACTION_PLANS: Record<WallType, { anchors: string; loadLimit: string; drillingDepth: string }> = {
  solid: {
    anchors: "Concrete / Masonry Expansion Anchors (Sleeve or Wedge)",
    loadLimit: "High Capacity (Up to 150 lbs / 68 kg per point)",
    drillingDepth: "Standard masonry bit depth (2.5 – 3.5 inches)",
  },
  hollow: {
    anchors: "Toggle Bolts or Heavy-Duty Hollow Wall Anchors",
    loadLimit: "Light to Medium (Max 35 lbs / 16 kg unless anchored to stud)",
    drillingDepth: "Penetrate surface drywall only; avoid deep drilling into cavity",
  },
  cracked: {
    anchors: "Do NOT anchor into crack zone; relocate drilling site by > 6 inches",
    loadLimit: "Low Capacity (Inspect masonry structural integrity first)",
    drillingDepth: "Restricted; repair crack with epoxy mortar injection before heavy load",
  },
};

export function EchoScan() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [mode, setMode] = useState<InspectionMode>("combined");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("Initializing inspection engine…");

  // Input Data States
  const [audioBlob, setAudioBlob] = useState<Blob | File | null>(null);
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [scaleType] = useState<ScaleReferenceType>("none");

  // Result States
  const [acousticResult, setAcousticResult] = useState<AnalysisResult | null>(null);
  const [visualResult, setVisualResult] = useState<VisualAnalysisResult | null>(null);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Audio Recording Refs
  const [liveAnalyser, setLiveAnalyser] = useState<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Webcam Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const saveScanToBackend = async (aRes?: AnalysisResult | null, vRes?: VisualAnalysisResult | null) => {
    if (!isAuthenticated) return;
    setSaveStatus("saving");
    try {
      if (aRes) {
        const createRes = await api.createScan({
          wallType: aRes.wallType,
          label: aRes.label,
          confidenceScore: aRes.confidence,
          peakFrequency: aRes.peakFrequency,
          rms: aRes.rms,
          duration: aRes.duration,
          fftSummary: aRes.spectrum,
          recommendation: aRes.recommendation,
        });
        if (createRes.success && createRes.scan) {
          setSavedScanId(createRes.scan._id);
        }
      }

      if (vRes) {
        await api.createVisualScan({
          hasCrack: vRes.hasCrack,
          crackCount: vRes.crackCount,
          avgConfidence: vRes.avgConfidence,
          largestCrackPx: vRes.largestCrackPx,
          avgWidthPx: vRes.avgWidthPx,
          overallSeverity: vRes.overallSeverity,
          wallCondition: vRes.wallCondition,
          wallHealthScore: vRes.wallHealthScore,
          recommendation: vRes.recommendation,
          cracks: vRes.cracks,
          scaleReferenceType: vRes.scaleReference.type,
          originalImageBase64: vRes.originalImageDataUrl,
        });
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const executeCombinedAnalysis = useCallback(async () => {
    if (mode === "acoustic" && !audioBlob) {
      setError("Please record or select an audio sound file first.");
      return;
    }
    if (mode === "visual" && !imageFile) {
      setError("Please upload or capture a wall image first.");
      return;
    }
    if (mode === "combined" && (!audioBlob || !imageFile)) {
      setError("Please provide BOTH a wall image AND an acoustic sound sample for combined structural analysis.");
      return;
    }

    setPhase("analyzing");
    setProgress(0);
    setError(null);
    setSavedScanId(null);

    const steps = [
      "Preprocessing image contrast & edge filter…",
      "Running AI crack segmentation & contour extraction…",
      "Processing Audio FFT frequency spectrum & decibels…",
      "Correlating multi-modal acoustic & visual findings…",
      "Generating combined structural inspection verdict…",
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setStepText(steps[stepIdx]);
    }, 400);

    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    try {
      let aRes: AnalysisResult | null = null;
      let vRes: VisualAnalysisResult | null = null;

      if (audioBlob && (mode === "acoustic" || mode === "combined")) {
        const audioBuf = await blobToAudioBuffer(audioBlob);
        aRes = await analyzeAudioBuffer(audioBuf);
      }

      if (imageFile && (mode === "visual" || mode === "combined")) {
        vRes = await analyzeWallImage(imageFile, scaleType);
      }

      await new Promise((r) => setTimeout(r, duration));
      clearInterval(interval);

      setAcousticResult(aRes);
      setVisualResult(vRes);
      setPhase("done");

      // Store in session storage for Web Inspection Report
      if (typeof window !== "undefined") {
        const hasCracks = vRes?.hasCrack || false;
        const wallType = aRes?.wallType || (hasCracks ? "cracked" : "solid");
        sessionStorage.setItem(
          "echoscan_latest_report",
          JSON.stringify({
            _id: "instant",
            scanDate: new Date().toISOString(),
            wallType,
            label: aRes ? aRes.label : hasCracks ? "Visible Crack Detected" : "Solid Surface Wall",
            confidenceScore: aRes ? aRes.confidence : vRes ? vRes.avgConfidence : 90,
            peakFrequency: aRes ? aRes.peakFrequency : 250,
            rms: aRes ? aRes.rms : 0.1,
            duration: aRes ? aRes.duration : 1.0,
            fftSummary: aRes ? aRes.spectrum : new Array(96).fill(0.2),
            recommendation:
              aRes && vRes
                ? aRes.wallType !== "solid" && vRes.hasCrack
                  ? "High likelihood of wall damage. Both audio resonance (Cracked/Hollow) and surface computer vision (Visible Cracks) confirm structural degradation. Professional inspection recommended."
                  : aRes.recommendation
                : aRes
                ? aRes.recommendation
                : vRes
                ? vRes.recommendation
                : "Standard structural recommendation",
          })
        );
      }

      if (isAuthenticated) {
        saveScanToBackend(aRes, vRes);
      }
    } catch (e: any) {
      clearInterval(interval);
      setError(e?.message ?? "Analysis failed.");
      setPhase("idle");
    }
  }, [mode, audioBlob, imageFile, scaleType, isAuthenticated]);

  const handleAudioFile = async (file: File) => {
    setError(null);
    setAudioBlob(file);
    if (mode === "acoustic") {
      try {
        const buf = await decodeFile(file);
        setPhase("analyzing");
        const aRes = await analyzeAudioBuffer(buf);
        setAcousticResult(aRes);
        setPhase("done");
        if (isAuthenticated) saveScanToBackend(aRes, null);
      } catch {
        setError("Could not decode audio file.");
      }
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    if (mode === "visual") {
      runVisualDirect(file);
    }
  };

  const runVisualDirect = async (file: File | Blob) => {
    setPhase("analyzing");
    setProgress(0);
    try {
      const vRes = await analyzeWallImage(file, scaleType);
      setVisualResult(vRes);
      setPhase("done");
      if (isAuthenticated) saveScanToBackend(null, vRes);
    } catch (err: any) {
      setError(err?.message || "Uploaded image does not seem to be a wall.");
      setPhase("idle");
    }
  };

  // Audio Recording Handlers
  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      setLiveAnalyser(analyser);

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setAudioBlob(blob);
        cleanupStream();

        if (mode === "acoustic") {
          try {
            const buf = await blobToAudioBuffer(blob);
            setPhase("analyzing");
            const aRes = await analyzeAudioBuffer(buf);
            setAcousticResult(aRes);
            setPhase("done");
            if (isAuthenticated) saveScanToBackend(aRes, null);
          } catch {
            setError("Could not decode audio.");
            setPhase("idle");
          }
        } else {
          setPhase("idle");
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setPhase("recording");
    } catch {
      setError("Microphone access denied or unavailable.");
    }
  }, [mode, isAuthenticated]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLiveAnalyser(null);
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
      if (blob) {
        setImageFile(blob);
        setImagePreviewUrl(URL.createObjectURL(blob));
        if (mode === "visual") runVisualDirect(blob);
      }
    }, "image/jpeg");
  };

  useEffect(() => () => cleanupStream(), []);

  const reset = () => {
    stopWebcam();
    setAcousticResult(null);
    setVisualResult(null);
    setAudioBlob(null);
    setImageFile(null);
    setImagePreviewUrl(null);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setSavedScanId(null);
    setSaveStatus("idle");
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
              Please sign in or create an account to access wall scanning & structural diagnostics.
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
      {/* Header Title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Structural Inspection Platform
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient-brand">Echo</span>{" "}
          <span className="text-foreground">Scan</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Select your inspection test mode: Sound Only, Image Only, or Combined Image & Sound for multi-modal wall diagnostics.
        </p>
      </motion.div>

      {/* Mode Selector Tabs (3 Choices) */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            setMode("acoustic");
            reset();
          }}
          className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${
            mode === "acoustic"
              ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/40"
              : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>1. Sound Test Only</span>
        </button>

        <button
          onClick={() => {
            setMode("visual");
            reset();
          }}
          className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${
            mode === "visual"
              ? "border-amber-500 bg-amber-500 text-slate-950 ring-2 ring-amber-400/40"
              : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>2. Image Test Only</span>
        </button>

        <button
          onClick={() => {
            setMode("combined");
            reset();
          }}
          className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${
            mode === "combined"
              ? "border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 ring-2 ring-emerald-400/40"
              : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4 fill-current" />
          <span>3. Combined Image & Sound</span>
        </button>
      </div>

      {/* Main Inspection Panel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10"
      >
        {phase === "idle" && !acousticResult && !visualResult && (
          <div className="space-y-8">
            {/* Mode Banner Explanation */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs flex items-center justify-between">
              <span className="font-bold text-foreground">Active Inspection Mode:</span>
              <span className="font-bold text-primary uppercase">
                {mode === "acoustic" && "🎤 Sound Test Only (Web Audio FFT)"}
                {mode === "visual" && "🖼️ Image Test Only (AI Vision Cracks)"}
                {mode === "combined" && "⚡ Combined Image & Sound Diagnostic"}
              </span>
            </div>

            {/* Input Sections Grid */}
            <div className={mode === "combined" ? "grid gap-6 md:grid-cols-2" : "mx-auto max-w-xl w-full"}>
              {/* IMAGE INPUT SECTION (Active in 'visual' or 'combined' modes) */}
              {(mode === "visual" || mode === "combined") && (
                <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Camera className="h-4 w-4" /> Step 1: Wall Image Input
                    </span>
                    {imageFile && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>

                  {imagePreviewUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-white/15 max-h-48 flex items-center justify-center bg-black">
                      <img src={imagePreviewUrl} alt="Preview" className="h-44 w-auto object-contain" />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white hover:bg-rose-600"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 p-6 text-center hover:border-amber-400/60 hover:bg-white/[0.02]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageFile(f);
                          }}
                        />
                        <Upload className="h-6 w-6 text-amber-400" />
                        <span className="text-xs font-medium text-foreground">Drop image or browse</span>
                      </label>

                      <div className="text-center text-[11px] text-muted-foreground">— OR —</div>

                      <Button onClick={startWebcam} variant="outline" size="sm" className="w-full gap-2 border-amber-500/30 text-amber-300">
                        <Camera className="h-4 w-4" /> Snap Photo with Webcam
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* SOUND INPUT SECTION (Active in 'acoustic' or 'combined' modes) */}
              {(mode === "acoustic" || mode === "combined") && (
                <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary">
                    <span className="flex items-center gap-1.5">
                      <Mic className="h-4 w-4" /> {mode === "combined" ? "Step 2: Acoustic Sound Input" : "Acoustic Sound Input"}
                    </span>
                    {audioBlob && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </div>

                  {audioBlob ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs text-emerald-400 font-semibold space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Acoustic Sound Sample Recorded
                      </div>
                      <button onClick={() => setAudioBlob(null)} className="text-[11px] text-muted-foreground underline hover:text-foreground">
                        Re-record Audio
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center py-2">
                        <button
                          onClick={startRecording}
                          className="animate-pulse-ring flex h-16 w-16 items-center justify-center rounded-full text-background shadow-brand hover:scale-105 transition"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          <Mic className="h-7 w-7" />
                        </button>
                      </div>
                      <div className="text-center text-xs text-muted-foreground">
                        Tap mic button and produce sound near wall surface
                      </div>

                      <label className="flex cursor-pointer justify-center items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-muted-foreground hover:bg-white/10">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleAudioFile(f);
                          }}
                        />
                        <Upload className="h-3.5 w-3.5 text-primary" /> Upload WAV/MP3 Audio File
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COMBINED RUN BUTTON (Shown in 'combined' mode) */}
            {mode === "combined" && (
              <div className="text-center pt-2">
                <Button
                  onClick={executeCombinedAnalysis}
                  disabled={!imageFile || !audioBlob}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-base shadow-xl"
                >
                  <Zap className="h-5 w-5 fill-current" /> Run Combined Multi-Modal Structural Diagnostic
                </Button>
                {(!imageFile || !audioBlob) && (
                  <p className="mt-2 text-xs text-muted-foreground">Provide both image and sound above to run combined analysis.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live Real-Time Camera Crack Detector Overlay */}
        {phase === "webcam" && (
          <div className="py-2">
            <RealtimeCrackDetector
              onCapture={(blob) => {
                const file = new File([blob], "webcam_wall.jpg", { type: "image/jpeg" });
                setImageFile(file);
                setImagePreviewUrl(URL.createObjectURL(blob));
                setPhase("idle");
                if (mode === "visual") {
                  runVisualDirect(file);
                }
              }}
              onCancel={() => setPhase("idle")}
            />
          </div>
        )}

        {/* Recording Animation */}
        <AnimatePresence>
          {phase === "recording" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                Recording acoustic sound echo…
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <SpectrumVisualizer analyser={liveAnalyser} mode="waveform" height={140} />
              </div>
              <div className="flex justify-center">
                <Button size="lg" onClick={stopRecording} className="gap-2">
                  <Square className="h-4 w-4 fill-current" /> Stop Recording
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Processing Progress */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 py-8 text-center">
              <div className="flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-muted-foreground">
                <Activity className="h-4 w-4 animate-pulse text-primary" /> Running Structural Diagnostic Pipeline
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10 max-w-md mx-auto">
                <div
                  className="h-full rounded-full transition-[width] duration-100"
                  style={{ width: `${progress}%`, background: "var(--gradient-brand)" }}
                />
              </div>
              <div className="text-gradient-brand text-3xl font-semibold tabular-nums">{progress}%</div>
              <div className="text-xs text-muted-foreground font-mono">{stepText}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS SECTION (Renders according to active test mode) */}
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Account Save Banner */}
            {isAuthenticated ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
                {saveStatus === "saving" && <span>Saving inspection log to account history…</span>}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Inspection log saved to history</span>
                  </>
                )}
                {saveStatus === "error" && <span>Processed locally (Backend sync error)</span>}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <span>Sign in to save inspection logs permanently</span>
                <Link to="/auth" className="flex items-center gap-1 font-semibold text-primary hover:underline">
                  <LogIn className="h-3.5 w-3.5" /> Sign In
                </Link>
              </div>
            )}

            {/* COMBINED TEST RESULT CARD (Mode 3: Sound + Image) */}
            {mode === "combined" && (
              <CombinedResultCard
                acoustic={acousticResult}
                visual={visualResult}
                savedScanId={savedScanId}
                onReset={reset}
              />
            )}

            {/* ACOUSTIC TEST RESULT CARD (Mode 1: Sound Only) */}
            {mode === "acoustic" && acousticResult && (
              <AcousticResultCard
                result={acousticResult}
                savedScanId={savedScanId}
                onReset={reset}
              />
            )}

            {/* VISUAL TEST RESULT CARD (Mode 2: Image Only) */}
            {mode === "visual" && visualResult && (
              <VisualResultCard
                result={visualResult}
                savedScanId={savedScanId}
                onReset={reset}
              />
            )}
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
                      handleImageFile(f);
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

{/* COMBINED RESULT CARD (Mode 3: Image + Sound - Horizontal Stacked Sections) */}
function CombinedResultCard({
  acoustic,
  visual,
  savedScanId,
  onReset,
}: {
  acoustic: AnalysisResult | null;
  visual: VisualAnalysisResult | null;
  savedScanId: string | null;
  onReset: () => void;
}) {
  const acousticDefect = acoustic && acoustic.wallType !== "solid";
  const visualDefect = visual && visual.hasCrack;

  let combinedHealth = 95;
  if (acousticDefect && visualDefect) combinedHealth = 42;
  else if (acousticDefect) combinedHealth = 68;
  else if (visualDefect) combinedHealth = 72;

  let verdictTitle = "✓ HIGH STRUCTURAL INTEGRITY";
  let verdictSub = "Both sound resonance and image computer vision confirm solid wall density with zero surface defects.";
  let verdictStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  let gradeBadge = "GRADE A — OPTIMAL LOAD BEARER";

  if (acousticDefect && visualDefect) {
    verdictTitle = "⚠ HIGH LIKELIHOOD OF WALL DAMAGE";
    verdictSub =
      "Both acoustic resonance (Internal Cavity/Defect) and computer vision (Surface Cracks) confirm structural degradation. Professional structural inspection recommended.";
    verdictStyle = "border-rose-500/40 bg-rose-500/15 text-rose-300";
    gradeBadge = "GRADE C — STRUCTURAL WARNING";
  } else if (acousticDefect || visualDefect) {
    verdictTitle = "⚡ MODERATE STRUCTURAL ATTENTION REQUIRED";
    verdictSub = acousticDefect
      ? "Internal hollow cavity detected via acoustic echo, though surface wall image appears clean."
      : "Surface crack detected visually; structural core retains solid acoustic resonance.";
    verdictStyle = "border-amber-500/40 bg-amber-500/10 text-amber-300";
    gradeBadge = "GRADE B — CAVITY / SURFACE MONITORED";
  }

  return (
    <div className="space-y-8">
      {/* Combined Multi-Modal Verdict Banner */}
      <div className={`rounded-2xl border-2 p-6 shadow-2xl space-y-3 ${verdictStyle}`}>
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 fill-current" /> COMBINED MULTI-MODAL VERDICT (IMAGE + SOUND)
          </span>
          <span className="rounded bg-black/40 px-2.5 py-1 text-[10px] font-bold border border-white/10">
            {gradeBadge}
          </span>
        </div>

        <h2 className="text-2xl font-black md:text-3xl">{verdictTitle}</h2>
        <p className="text-sm font-medium leading-relaxed">{verdictSub}</p>

        <div className="pt-2 border-t border-white/15">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span>COMBINED WALL HEALTH INDEX</span>
            <span className="text-base font-bold tabular-nums">{combinedHealth}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/50 border border-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${combinedHealth}%`,
                background:
                  combinedHealth > 80
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : combinedHealth > 60
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #f43f5e, #fb7185)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Stacked Full-Width Telemetry Sections */}
      <div className="space-y-6">
        {/* Section 1: Acoustic Sound Resonance Result (Horizontal Full-Width) */}
        {acoustic && (
          <div className="rounded-2xl border border-primary/30 bg-black/40 p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Mic className="h-4 w-4" /> 1. Acoustic Sound Resonance Result
              </div>
              <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-bold text-primary">
                Confidence: {acoustic.confidence}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{acoustic.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Peak Frequency: {acoustic.peakFrequency.toFixed(0)} Hz • RMS Energy: {acoustic.rms.toFixed(3)} • Duration: {acoustic.duration.toFixed(2)}s
                </p>
              </div>

              <div className="rounded-lg bg-black/50 p-3 border border-white/10 text-xs max-w-md">
                <span className="font-bold text-primary block mb-1">Acoustic Recommendation:</span>
                <span className="text-foreground/90">{acoustic.recommendation}</span>
              </div>
            </div>

            {/* Full-Width Spectrum Visualizer */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Frequency Spectrum Line Curve</span>
                <span>40 Hz – 3.8 kHz</span>
              </div>
              <SpectrumVisualizer spectrum={acoustic.spectrum} height={140} />
            </div>
          </div>
        )}

        {/* Section 2: AI Visual Crack Inspection Result (Horizontal Full-Width) */}
        {visual && (
          <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Camera className="h-4 w-4" /> 2. AI Visual Crack Inspection Result
              </div>
              <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300">
                Wall Health: {visual.wallHealthScore}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {visual.hasCrack ? `⚠ ${visual.crackCount} Visible Crack(s) Detected` : "✓ No Visible Surface Cracks"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Severity: {visual.overallSeverity} • Largest Crack: {visual.largestCrackPx} px • Avg Width: {visual.avgWidthPx} px
                </p>
              </div>

              <div className="rounded-lg bg-black/50 p-3 border border-white/10 text-xs max-w-md">
                <span className="font-bold text-amber-400 block mb-1">Visual AI Recommendation:</span>
                <span className="text-foreground/90">{visual.recommendation}</span>
              </div>
            </div>

            {/* Full-Width Bounding Box & Zoom Viewer */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <AnnotatedViewer result={visual} />
            </div>
          </div>
        )}
      </div>

      {/* Repair Cost & Hardware Anchor Estimator */}
      <RepairEstimatorCard
        wallType={acoustic?.wallType || "solid"}
        hasCrack={visual?.hasCrack}
        crackCount={visual?.crackCount}
        severity={visual?.overallSeverity}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/report/$id"
          params={{ id: savedScanId || "latest" }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          <FileText className="h-4 w-4" />
          <span>View Combined Web Report</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </Link>

        <Button variant="secondary" onClick={onReset} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Perform Another Test
        </Button>
      </div>
    </div>
  );
}

{/* ACOUSTIC RESULT CARD (Sound Only Mode) */}
function AcousticResultCard({
  result,
  savedScanId,
  onReset,
}: {
  result: AnalysisResult;
  savedScanId: string | null;
  onReset: () => void;
}) {
  const meta = WALL_META[result.wallType];
  const plan = ACTION_PLANS[result.wallType];
  const Icon = meta.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-4 ${meta.ring} shadow-brand`}>
          <Icon className="h-10 w-10 text-background" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Acoustic Sound Resonance</div>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">{result.label}</h2>
        </div>
        <div className="text-xs text-primary font-bold">Confidence Score: {result.confidence}%</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Waves className="h-4 w-4" />} label="Peak frequency" value={`${result.peakFrequency.toFixed(0)} Hz`} />
        <Stat icon={<Volume2 className="h-4 w-4" />} label="RMS volume" value={result.rms.toFixed(3)} />
        <Stat icon={<Timer className="h-4 w-4" />} label="Duration" value={`${result.duration.toFixed(2)} s`} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Frequency spectrum (40 Hz – 3.8 kHz)</span>
          <span className="text-xs text-primary font-medium">Spectral Line Curve</span>
        </div>
        <SpectrumVisualizer spectrum={result.spectrum} height={140} />
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
          <Sparkles className="h-4 w-4 text-primary" /> Structural Inspection Recommendation
        </div>
        <p className="text-sm leading-relaxed text-foreground font-medium">{result.recommendation}</p>
      </div>

      <RepairEstimatorCard wallType={result.wallType} />

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/report/$id"
          params={{ id: savedScanId || "latest" }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          <FileText className="h-4 w-4" /> View Web Inspection Report <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </Link>
        <Button variant="secondary" onClick={onReset} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Scan Another Sound
        </Button>
      </div>
    </div>
  );
}

{/* VISUAL RESULT CARD (Image Only Mode) */}
function VisualResultCard({
  result,
  savedScanId,
  onReset,
}: {
  result: VisualAnalysisResult;
  savedScanId: string | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${result.hasCrack ? "bg-amber-500/20 text-amber-300 ring-4 ring-amber-400/30" : "bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-400/30"}`}>
          {result.hasCrack ? <AlertTriangle className="h-8 w-8" /> : <ShieldCheck className="h-8 w-8" />}
        </div>
        <h2 className="text-3xl font-bold md:text-4xl text-foreground">
          {result.hasCrack ? "⚠ Visible Crack Detected" : "✓ No Visible Crack"}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Layers className="h-4 w-4 text-sky-400" />} label="Visible Cracks" value={`${result.crackCount}`} />
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Avg Confidence" value={`${result.avgConfidence}%`} />
        <Stat icon={<Ruler className="h-4 w-4 text-amber-400" />} label="Largest Crack" value={result.largestCrackRealMm ? `${result.largestCrackRealMm} mm` : `${result.largestCrackPx} px`} />
        <Stat icon={<ShieldCheck className="h-4 w-4 text-indigo-400" />} label="Wall Condition" value={result.wallCondition} />
      </div>

      <AnnotatedViewer result={result} />

      <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
          <ShieldAlert className="h-4 w-4" /> AI Structural Inspector Recommendation
        </div>
        <p className="text-sm leading-relaxed text-foreground font-medium">{result.recommendation}</p>
      </div>

      <RepairEstimatorCard
        wallType={result.hasCrack ? "cracked" : "solid"}
        hasCrack={result.hasCrack}
        crackCount={result.crackCount}
        severity={result.overallSeverity}
      />

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/report/$id"
          params={{ id: savedScanId || "latest" }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          <FileText className="h-4 w-4" /> View Web Inspection Report <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </Link>
        <Button variant="secondary" onClick={onReset} className="gap-2">
          <RefreshCcw className="h-4 w-4" /> Scan Another Image
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
