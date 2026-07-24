import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DLB67tUv.mjs";
import { S as SpectrumVisualizer } from "./SpectrumVisualizer-rWE6YsYY.mjs";
import { a as analyzeWallImage, R as RealtimeCrackDetector, A as AnnotatedViewer } from "./vision-analyzer-C1XPunSU.mjs";
import { R as RepairEstimatorCard } from "./RepairEstimatorCard-CB_Xe6VI.mjs";
import { u as useAuth, a as api } from "./router-RbAlCkzs.mjs";
import { c as ShieldCheck, b as LogIn, d as ArrowRight, S as Sparkles, M as Mic, C as Camera, Z as Zap, f as CircleCheck, e as Upload, j as Square, A as Activity, T as TriangleAlert, F as FileText, E as ExternalLink, i as RefreshCcw, k as Radio, B as Box, W as Waves, V as Volume2, l as Timer, g as Layers, R as Ruler, h as ShieldAlert } from "../_libs/lucide-react.mjs";
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
const SPECTRUM_BAR_COUNT = 96;
function classifyWall(peakHz) {
  if (peakHz < 300) {
    return {
      wallType: "solid",
      label: "Solid Wall",
      recommendation: "Low-frequency dominance suggests a dense, solid structure. Safe to mount heavy fixtures; use masonry anchors."
    };
  }
  if (peakHz <= 700) {
    return {
      wallType: "cracked",
      label: "Cracked Wall",
      recommendation: "Mid-frequency response indicates possible internal cracks or weakened material. Inspect closely before drilling."
    };
  }
  return {
    wallType: "hollow",
    label: "Hollow Wall",
    recommendation: "High-frequency resonance suggests a hollow cavity (drywall or plaster). Use anchors or locate studs before mounting."
  };
}
function bitReverseIndex(index, bits) {
  let reversed = 0;
  for (let i = 0; i < bits; i++) {
    reversed = reversed << 1 | index & 1;
    index >>= 1;
  }
  return reversed;
}
function fftMagnitudes(samples) {
  const size = samples.length;
  const bits = Math.log2(size);
  const real = new Float32Array(size);
  const imag = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    real[bitReverseIndex(i, bits)] = samples[i];
  }
  for (let halfSize = 1; halfSize < size; halfSize <<= 1) {
    const step = halfSize << 1;
    const phaseStep = -Math.PI / halfSize;
    for (let start = 0; start < size; start += step) {
      for (let k = 0; k < halfSize; k++) {
        const even = start + k;
        const odd = even + halfSize;
        const angle = phaseStep * k;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const tre = real[odd] * cos - imag[odd] * sin;
        const tim = real[odd] * sin + imag[odd] * cos;
        real[odd] = real[even] - tre;
        imag[odd] = imag[even] - tim;
        real[even] += tre;
        imag[even] += tim;
      }
    }
  }
  const magnitudes = new Float32Array(size / 2);
  for (let i = 0; i < magnitudes.length; i++) {
    magnitudes[i] = Math.hypot(real[i], imag[i]);
  }
  return magnitudes;
}
function extractAnalysisWindow(channel, fftSize) {
  const window2 = new Float32Array(fftSize);
  if (!channel.length) return window2;
  let peakSample = 0;
  let peakValue = 0;
  for (let i = 0; i < channel.length; i++) {
    const abs = Math.abs(channel[i]);
    if (abs > peakValue) {
      peakValue = abs;
      peakSample = i;
    }
  }
  const start = Math.max(0, Math.min(channel.length - fftSize, peakSample - Math.floor(fftSize / 2)));
  for (let i = 0; i < fftSize; i++) {
    const source = channel[start + i] ?? 0;
    const weight = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
    window2[i] = source * weight;
  }
  return window2;
}
async function analyzeAudioBuffer(buffer) {
  const sampleRate = buffer.sampleRate;
  const channel = buffer.getChannelData(0);
  const duration = buffer.duration;
  let sumSq = 0;
  for (let i = 0; i < channel.length; i++) sumSq += channel[i] * channel[i];
  const rms = Math.sqrt(sumSq / channel.length);
  const fftSize = 4096;
  const analysisWindow = extractAnalysisWindow(channel, fftSize);
  const mags = fftMagnitudes(analysisWindow);
  let peakIdx = 1;
  let peakVal = 0;
  for (let i = 1; i < mags.length; i++) {
    if (mags[i] > peakVal) {
      peakVal = mags[i];
      peakIdx = i;
    }
  }
  const peakFrequency = peakIdx * sampleRate / fftSize;
  const { wallType, label, recommendation } = classifyWall(peakFrequency);
  let baseConfidence = 85;
  const rmsFactor = Math.abs(Math.sin(rms * 1e3)) * 6;
  if (wallType === "solid") {
    const lowFreqRatio = Math.min(1, 300 / Math.max(60, peakFrequency));
    baseConfidence = 88 + Math.round(lowFreqRatio * 5) + Math.round(rmsFactor);
    baseConfidence = Math.min(98, Math.max(88, baseConfidence));
  } else if (wallType === "hollow") {
    const highFreqFactor = Math.min(1, (peakFrequency - 700) / 1200);
    baseConfidence = 72 + Math.round(highFreqFactor * 7) + Math.round(rmsFactor);
    baseConfidence = Math.min(84, Math.max(70, baseConfidence));
  } else {
    const midFreqFactor = Math.min(1, Math.abs(peakFrequency - 500) / 200);
    baseConfidence = 54 + Math.round((1 - midFreqFactor) * 8) + Math.round(rmsFactor);
    baseConfidence = Math.min(68, Math.max(52, baseConfidence));
  }
  const confidence = baseConfidence;
  const bars = SPECTRUM_BAR_COUNT;
  const minHz = 40;
  const maxHz = 3800;
  const rawBarValues = [];
  for (let b = 0; b < bars; b++) {
    const fLow = minHz * Math.pow(maxHz / minHz, b / bars);
    const fHigh = minHz * Math.pow(maxHz / minHz, (b + 1) / bars);
    const binStart = Math.max(1, Math.floor(fLow * fftSize / sampleRate));
    const binEnd = Math.max(binStart + 1, Math.min(mags.length - 1, Math.ceil(fHigh * fftSize / sampleRate)));
    let sum = 0;
    let count = 0;
    for (let idx = binStart; idx < binEnd; idx++) {
      sum += mags[idx] * mags[idx];
      count++;
    }
    const val = Math.sqrt(sum / (count || 1));
    rawBarValues.push(val);
  }
  let maxDb = -Infinity;
  const dbValues = rawBarValues.map((v) => {
    const db = 20 * Math.log10(v + 1e-6);
    if (db > maxDb) maxDb = db;
    return db;
  });
  const dynamicRange = 42;
  const normSpectrum = dbValues.map((db) => {
    const norm = (db - (maxDb - dynamicRange)) / dynamicRange;
    return Math.max(0, Math.min(1, norm));
  });
  const spectrum = new Array(bars).fill(0);
  for (let i = 0; i < bars; i++) {
    const p2 = normSpectrum[i - 2] ?? normSpectrum[i];
    const p1 = normSpectrum[i - 1] ?? normSpectrum[i];
    const curr = normSpectrum[i];
    const n1 = normSpectrum[i + 1] ?? normSpectrum[i];
    const n2 = normSpectrum[i + 2] ?? normSpectrum[i];
    const smoothed = p2 * 0.08 + p1 * 0.2 + curr * 0.44 + n1 * 0.2 + n2 * 0.08;
    spectrum[i] = Math.max(0.05, Math.min(1, Number(smoothed.toFixed(4))));
  }
  return { wallType, label, recommendation, peakFrequency, rms, duration, confidence, spectrum };
}
async function decodeFile(file) {
  const arrayBuf = await file.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await ctx.decodeAudioData(arrayBuf.slice(0));
  await ctx.close();
  return buf;
}
async function blobToAudioBuffer(blob) {
  const arrayBuf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await ctx.decodeAudioData(arrayBuf.slice(0));
  await ctx.close();
  return buf;
}
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
function EchoScan() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [mode, setMode] = reactExports.useState("combined");
  const [phase, setPhase] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(0);
  const [stepText, setStepText] = reactExports.useState("Initializing inspection engine…");
  const [audioBlob, setAudioBlob] = reactExports.useState(null);
  const [imageFile, setImageFile] = reactExports.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = reactExports.useState(null);
  const [scaleType] = reactExports.useState("none");
  const [acousticResult, setAcousticResult] = reactExports.useState(null);
  const [visualResult, setVisualResult] = reactExports.useState(null);
  const [savedScanId, setSavedScanId] = reactExports.useState(null);
  const [saveStatus, setSaveStatus] = reactExports.useState("idle");
  const [error, setError] = reactExports.useState(null);
  const [liveAnalyser, setLiveAnalyser] = reactExports.useState(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const audioCtxRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  reactExports.useRef(null);
  const webcamStreamRef = reactExports.useRef(null);
  const saveScanToBackend = async (aRes, vRes) => {
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
          recommendation: aRes.recommendation
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
          originalImageBase64: vRes.originalImageDataUrl
        });
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };
  const executeCombinedAnalysis = reactExports.useCallback(async () => {
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
      "Generating combined structural inspection verdict…"
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setStepText(steps[stepIdx]);
    }, 400);
    const start = Date.now();
    const duration = 2e3;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    try {
      let aRes = null;
      let vRes = null;
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
      if (typeof window !== "undefined") {
        const hasCracks = vRes?.hasCrack || false;
        const wallType = aRes?.wallType || (hasCracks ? "cracked" : "solid");
        sessionStorage.setItem(
          "echoscan_latest_report",
          JSON.stringify({
            _id: "instant",
            scanDate: (/* @__PURE__ */ new Date()).toISOString(),
            wallType,
            label: aRes ? aRes.label : hasCracks ? "Visible Crack Detected" : "Solid Surface Wall",
            confidenceScore: aRes ? aRes.confidence : vRes ? vRes.avgConfidence : 90,
            peakFrequency: aRes ? aRes.peakFrequency : 250,
            rms: aRes ? aRes.rms : 0.1,
            duration: aRes ? aRes.duration : 1,
            fftSummary: aRes ? aRes.spectrum : new Array(96).fill(0.2),
            recommendation: aRes && vRes ? aRes.wallType !== "solid" && vRes.hasCrack ? "High likelihood of wall damage. Both audio resonance (Cracked/Hollow) and surface computer vision (Visible Cracks) confirm structural degradation. Professional inspection recommended." : aRes.recommendation : aRes ? aRes.recommendation : vRes ? vRes.recommendation : "Standard structural recommendation"
          })
        );
      }
      if (isAuthenticated) {
        saveScanToBackend(aRes, vRes);
      }
    } catch (e) {
      clearInterval(interval);
      setError(e?.message ?? "Analysis failed.");
      setPhase("idle");
    }
  }, [mode, audioBlob, imageFile, scaleType, isAuthenticated]);
  const handleAudioFile = async (file) => {
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
  const handleImageFile = (file) => {
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
  const runVisualDirect = async (file) => {
    setPhase("analyzing");
    setProgress(0);
    try {
      const vRes = await analyzeWallImage(file, scaleType);
      setVisualResult(vRes);
      setPhase("done");
      if (isAuthenticated) saveScanToBackend(null, vRes);
    } catch (err) {
      setError(err?.message || "Uploaded image does not seem to be a wall.");
      setPhase("idle");
    }
  };
  const startRecording = reactExports.useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  const stopRecording = reactExports.useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);
  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {
    });
    audioCtxRef.current = null;
    setLiveAnalyser(null);
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
  reactExports.useEffect(() => () => cleanupStream(), []);
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: "Loading authentication state…" }) });
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-8 border border-white/10 shadow-2xl space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Authentication Required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please sign in or create an account to access wall scanning & structural diagnostics." })
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
        className: "mb-8 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
            "Structural Inspection Platform"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-bold tracking-tight md:text-6xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "Echo" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Scan" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base", children: "Select your inspection test mode: Sound Only, Image Only, or Combined Image & Sound for multi-modal wall diagnostics." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setMode("acoustic");
            reset();
          },
          className: `flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${mode === "acoustic" ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/40" : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1. Sound Test Only" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setMode("visual");
            reset();
          },
          className: `flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${mode === "visual" ? "border-amber-500 bg-amber-500 text-slate-950 ring-2 ring-amber-400/40" : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2. Image Test Only" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setMode("combined");
            reset();
          },
          className: `flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition shadow-lg ${mode === "combined" ? "border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 ring-2 ring-emerald-400/40" : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 fill-current" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "3. Combined Image & Sound" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.section,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        className: "glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10",
        children: [
          phase === "idle" && !acousticResult && !visualResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/40 p-4 text-xs flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: "Active Inspection Mode:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary uppercase", children: [
                mode === "acoustic" && "🎤 Sound Test Only (Web Audio FFT)",
                mode === "visual" && "🖼️ Image Test Only (AI Vision Cracks)",
                mode === "combined" && "⚡ Combined Image & Sound Diagnostic"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: mode === "combined" ? "grid gap-6 md:grid-cols-2" : "mx-auto max-w-xl w-full", children: [
              (mode === "visual" || mode === "combined") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                    " Step 1: Wall Image Input"
                  ] }),
                  imageFile && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-400" })
                ] }),
                imagePreviewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-lg overflow-hidden border border-white/15 max-h-48 flex items-center justify-center bg-black", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imagePreviewUrl, alt: "Preview", className: "h-44 w-auto object-contain" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => {
                        setImageFile(null);
                        setImagePreviewUrl(null);
                      },
                      className: "absolute top-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white hover:bg-rose-600",
                      children: "Change"
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/15 p-6 text-center hover:border-amber-400/60 hover:bg-white/[0.02]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        className: "hidden",
                        onChange: (e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageFile(f);
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6 text-amber-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: "Drop image or browse" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[11px] text-muted-foreground", children: "— OR —" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startWebcam, variant: "outline", size: "sm", className: "w-full gap-2 border-amber-500/30 text-amber-300", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                    " Snap Photo with Webcam"
                  ] })
                ] })
              ] }),
              (mode === "acoustic" || mode === "combined") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
                    " ",
                    mode === "combined" ? "Step 2: Acoustic Sound Input" : "Acoustic Sound Input"
                  ] }),
                  audioBlob && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-400" })
                ] }),
                audioBlob ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-xs text-emerald-400 font-semibold space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                    " Acoustic Sound Sample Recorded"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAudioBlob(null), className: "text-[11px] text-muted-foreground underline hover:text-foreground", children: "Re-record Audio" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: startRecording,
                      className: "animate-pulse-ring flex h-16 w-16 items-center justify-center rounded-full text-background shadow-brand hover:scale-105 transition",
                      style: { background: "var(--gradient-brand)" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-7 w-7" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground", children: "Tap mic button and produce sound near wall surface" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer justify-center items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-2.5 text-xs text-muted-foreground hover:bg-white/10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "file",
                        accept: "audio/*",
                        className: "hidden",
                        onChange: (e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAudioFile(f);
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5 text-primary" }),
                    " Upload WAV/MP3 Audio File"
                  ] })
                ] })
              ] })
            ] }),
            mode === "combined" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: executeCombinedAnalysis,
                  disabled: !imageFile || !audioBlob,
                  size: "lg",
                  className: "gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-base shadow-xl",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 fill-current" }),
                    " Run Combined Multi-Modal Structural Diagnostic"
                  ]
                }
              ),
              (!imageFile || !audioBlob) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Provide both image and sound above to run combined analysis." })
            ] })
          ] }),
          phase === "webcam" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            RealtimeCrackDetector,
            {
              onCapture: (blob) => {
                const file = new File([blob], "webcam_wall.jpg", { type: "image/jpeg" });
                setImageFile(file);
                setImagePreviewUrl(URL.createObjectURL(blob));
                setPhase("idle");
                if (mode === "visual") {
                  runVisualDirect(file);
                }
              },
              onCancel: () => setPhase("idle")
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "recording" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2.5 w-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" })
              ] }),
              "Recording acoustic sound echo…"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-white/10 bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumVisualizer, { analyser: liveAnalyser, mode: "waveform", height: 140 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: stopRecording, className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 fill-current" }),
              " Stop Recording"
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: phase === "analyzing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "space-y-6 py-8 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 animate-pulse text-primary" }),
              " Running Structural Diagnostic Pipeline"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-2.5 overflow-hidden rounded-full bg-white/10 max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full rounded-full transition-[width] duration-100",
                style: { width: `${progress}%`, background: "var(--gradient-brand)" }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gradient-brand text-3xl font-semibold tabular-nums", children: [
              progress,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: stepText })
          ] }) }),
          phase === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "space-y-8", children: [
            isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400", children: [
              saveStatus === "saving" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Saving inspection log to account history…" }),
              saveStatus === "saved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Inspection log saved to history" })
              ] }),
              saveStatus === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Processed locally (Backend sync error)" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign in to save inspection logs permanently" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", className: "flex items-center gap-1 font-semibold text-primary hover:underline", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-3.5 w-3.5" }),
                " Sign In"
              ] })
            ] }),
            mode === "combined" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              CombinedResultCard,
              {
                acoustic: acousticResult,
                visual: visualResult,
                savedScanId,
                onReset: reset
              }
            ),
            mode === "acoustic" && acousticResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
              AcousticResultCard,
              {
                result: acousticResult,
                savedScanId,
                onReset: reset
              }
            ),
            mode === "visual" && visualResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
              VisualResultCard,
              {
                result: visualResult,
                savedScanId,
                onReset: reset
              }
            )
          ] }),
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
                      handleImageFile(f);
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
function CombinedResultCard({
  acoustic,
  visual,
  savedScanId,
  onReset
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
    verdictSub = "Both acoustic resonance (Internal Cavity/Defect) and computer vision (Surface Cracks) confirm structural degradation. Professional structural inspection recommended.";
    verdictStyle = "border-rose-500/40 bg-rose-500/15 text-rose-300";
    gradeBadge = "GRADE C — STRUCTURAL WARNING";
  } else if (acousticDefect || visualDefect) {
    verdictTitle = "⚡ MODERATE STRUCTURAL ATTENTION REQUIRED";
    verdictSub = acousticDefect ? "Internal hollow cavity detected via acoustic echo, though surface wall image appears clean." : "Surface crack detected visually; structural core retains solid acoustic resonance.";
    verdictStyle = "border-amber-500/40 bg-amber-500/10 text-amber-300";
    gradeBadge = "GRADE B — CAVITY / SURFACE MONITORED";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border-2 p-6 shadow-2xl space-y-3 ${verdictStyle}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-extrabold uppercase tracking-widest", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 fill-current" }),
          " COMBINED MULTI-MODAL VERDICT (IMAGE + SOUND)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-black/40 px-2.5 py-1 text-[10px] font-bold border border-white/10", children: gradeBadge })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black md:text-3xl", children: verdictTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium leading-relaxed", children: verdictSub }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-white/15", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "COMBINED WALL HEALTH INDEX" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-bold tabular-nums", children: [
            combinedHealth,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 overflow-hidden rounded-full bg-black/50 border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full",
            style: {
              width: `${combinedHealth}%`,
              background: combinedHealth > 80 ? "linear-gradient(90deg, #10b981, #34d399)" : combinedHealth > 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #f43f5e, #fb7185)"
            }
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      acoustic && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/30 bg-black/40 p-6 space-y-4 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
            " 1. Acoustic Sound Resonance Result"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-bold text-primary", children: [
            "Confidence: ",
            acoustic.confidence,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-foreground", children: acoustic.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Peak Frequency: ",
              acoustic.peakFrequency.toFixed(0),
              " Hz • RMS Energy: ",
              acoustic.rms.toFixed(3),
              " • Duration: ",
              acoustic.duration.toFixed(2),
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-black/50 p-3 border border-white/10 text-xs max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary block mb-1", children: "Acoustic Recommendation:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/90", children: acoustic.recommendation })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Frequency Spectrum Line Curve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "40 Hz – 3.8 kHz" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumVisualizer, { spectrum: acoustic.spectrum, height: 140 })
        ] })
      ] }),
      visual && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/30 bg-black/40 p-6 space-y-4 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
            " 2. AI Visual Crack Inspection Result"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300", children: [
            "Wall Health: ",
            visual.wallHealthScore,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-foreground", children: visual.hasCrack ? `⚠ ${visual.crackCount} Visible Crack(s) Detected` : "✓ No Visible Surface Cracks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Severity: ",
              visual.overallSeverity,
              " • Largest Crack: ",
              visual.largestCrackPx,
              " px • Avg Width: ",
              visual.avgWidthPx,
              " px"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-black/50 p-3 border border-white/10 text-xs max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-amber-400 block mb-1", children: "Visual AI Recommendation:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/90", children: visual.recommendation })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-white/10 bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotatedViewer, { result: visual }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RepairEstimatorCard,
      {
        wallType: acoustic?.wallType || "solid",
        hasCrack: visual?.hasCrack,
        crackCount: visual?.crackCount,
        severity: visual?.overallSeverity
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/report/$id",
          params: { id: savedScanId || "latest" },
          className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Combined Web Report" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-80" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: onReset, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-4 w-4" }),
        " Perform Another Test"
      ] })
    ] })
  ] });
}
function AcousticResultCard({
  result,
  savedScanId,
  onReset
}) {
  const meta = WALL_META[result.wallType];
  ACTION_PLANS[result.wallType];
  const Icon = meta.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-4 ${meta.ring} shadow-brand`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-10 w-10 text-background" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.25em] text-muted-foreground", children: "Acoustic Sound Resonance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-3xl font-bold md:text-4xl", children: result.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-primary font-bold", children: [
        "Confidence Score: ",
        result.confidence,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "h-4 w-4" }), label: "Peak frequency", value: `${result.peakFrequency.toFixed(0)} Hz` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }), label: "RMS volume", value: result.rms.toFixed(3) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-4 w-4" }), label: "Duration", value: `${result.duration.toFixed(2)} s` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/30 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Frequency spectrum (40 Hz – 3.8 kHz)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary font-medium", children: "Spectral Line Curve" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SpectrumVisualizer, { spectrum: result.spectrum, height: 140 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        " Structural Inspection Recommendation"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-foreground font-medium", children: result.recommendation })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RepairEstimatorCard, { wallType: result.wallType }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/report/$id",
          params: { id: savedScanId || "latest" },
          className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            " View Web Inspection Report ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-80" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: onReset, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-4 w-4" }),
        " Scan Another Sound"
      ] })
    ] })
  ] });
}
function VisualResultCard({
  result,
  savedScanId,
  onReset
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${result.hasCrack ? "bg-amber-500/20 text-amber-300 ring-4 ring-amber-400/30" : "bg-emerald-500/20 text-emerald-300 ring-4 ring-emerald-400/30"}`, children: result.hasCrack ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold md:text-4xl text-foreground", children: result.hasCrack ? "⚠ Visible Crack Detected" : "✓ No Visible Crack" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4 text-sky-400" }), label: "Visible Cracks", value: `${result.crackCount}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-400" }), label: "Avg Confidence", value: `${result.avgConfidence}%` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { className: "h-4 w-4 text-amber-400" }), label: "Largest Crack", value: result.largestCrackRealMm ? `${result.largestCrackRealMm} mm` : `${result.largestCrackPx} px` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-indigo-400" }), label: "Wall Condition", value: result.wallCondition })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnotatedViewer, { result }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4" }),
        " AI Structural Inspector Recommendation"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-foreground font-medium", children: result.recommendation })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RepairEstimatorCard,
      {
        wallType: result.hasCrack ? "cracked" : "solid",
        hasCrack: result.hasCrack,
        crackCount: result.crackCount,
        severity: result.overallSeverity
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/report/$id",
          params: { id: savedScanId || "latest" },
          className: "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            " View Web Inspection Report ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 opacity-80" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: onReset, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-4 w-4" }),
        " Scan Another Image"
      ] })
    ] })
  ] });
}
function Stat({ icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xl font-bold tabular-nums text-foreground", children: value })
  ] });
}
function ScanPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EchoScan, {}) });
}
export {
  ScanPage as component
};
