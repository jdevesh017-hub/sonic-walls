import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Upload, Waves, Radio, Box, AlertTriangle, Activity, Volume2, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectrumVisualizer } from "./SpectrumVisualizer";
import {
  analyzeAudioBuffer,
  blobToAudioBuffer,
  decodeFile,
  type AnalysisResult,
  type WallType,
} from "@/lib/audio-analyzer";

type Phase = "idle" | "recording" | "analyzing" | "done";

const WALL_META: Record<WallType, { icon: typeof Box; color: string; ring: string }> = {
  solid: { icon: Box, color: "from-cyan-300 to-sky-500", ring: "ring-cyan-400/40" },
  cracked: { icon: AlertTriangle, color: "from-amber-300 to-fuchsia-500", ring: "ring-amber-400/40" },
  hollow: { icon: Radio, color: "from-fuchsia-400 to-purple-500", ring: "ring-fuchsia-400/40" },
};

export function EchoScan() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [liveAnalyser, setLiveAnalyser] = useState<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(async (buffer: AudioBuffer) => {
    setPhase("analyzing");
    setProgress(0);
    setResult(null);
    // animate progress
    const start = Date.now();
    const duration = 1400;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setProgress(Math.round(t * 100));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    try {
      const [res] = await Promise.all([
        analyzeAudioBuffer(buffer),
        new Promise((r) => setTimeout(r, duration)),
      ]);
      setResult(res);
      setPhase("done");
    } catch (e: any) {
      setError(e?.message ?? "Analysis failed");
      setPhase("idle");
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const buf = await decodeFile(file);
        await runAnalysis(buf);
      } catch (e: any) {
        setError("Could not decode audio file. Try WAV, MP3, or OGG.");
      }
    },
    [runAnalysis],
  );

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
        cleanupStream();
        try {
          const buf = await blobToAudioBuffer(blob);
          await runAnalysis(buf);
        } catch {
          setError("Could not decode recorded audio.");
          setPhase("idle");
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setPhase("recording");
    } catch (e: any) {
      setError("Microphone access denied or unavailable.");
    }
  }, [runAnalysis]);

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

  useEffect(() => () => cleanupStream(), []);

  const reset = () => {
    setResult(null);
    setPhase("idle");
    setProgress(0);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Acoustic wall analysis
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient-neon">Echo</span>{" "}
          <span className="text-foreground">Scan</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Tap, knock, or upload a sound — we'll listen to the echo and tell you what's behind the wall.
        </p>
      </motion.div>

      {/* Main panel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass relative overflow-hidden rounded-2xl p-6 md:p-10"
      >
        {/* Glow ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-neon)" }}
        />

        {phase !== "recording" && phase !== "analyzing" && !result && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Dropzone */}
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
                if (f) handleFile(f);
              }}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/10 shadow-neon"
                  : "border-white/15 hover:border-primary/60 hover:bg-white/[0.03]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30 ring-1 ring-white/20 group-hover:animate-float-slow">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drop an audio file</p>
                <p className="mt-1 text-xs text-muted-foreground">or click to browse · WAV, MP3, OGG</p>
              </div>
            </label>

            {/* Record */}
            <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-10">
              <button
                onClick={startRecording}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-background shadow-neon transition hover:scale-105 animate-pulse-ring"
                aria-label="Start recording"
              >
                <Mic className="h-8 w-8" />
              </button>
              <div className="text-center">
                <p className="font-medium">Record live audio</p>
                <p className="mt-1 text-xs text-muted-foreground">Knock on the wall near your mic</p>
              </div>
            </div>
          </div>
        )}

        {/* Recording */}
        <AnimatePresence>
          {phase === "recording" && (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
                </span>
                Recording…
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <SpectrumVisualizer analyser={liveAnalyser} mode="waveform" height={140} />
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <SpectrumVisualizer analyser={liveAnalyser} mode="bars" height={120} />
              </div>
              <div className="flex justify-center">
                <Button size="lg" onClick={stopRecording} className="gap-2">
                  <Square className="h-4 w-4 fill-current" /> Stop & Analyze
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzing */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              key="ana"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-6"
            >
              <div className="flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-muted-foreground">
                <Activity className="h-4 w-4 animate-pulse text-primary" /> Analyzing echo signature
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
                <div className="scan-shimmer pointer-events-none absolute inset-0 rounded-full" />
              </div>
              <div className="text-center text-3xl font-semibold tabular-nums text-gradient-neon">
                {progress}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {phase === "done" && result && <ResultCard result={result} onReset={reset} />}
        </AnimatePresence>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
      </motion.section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        All analysis runs locally in your browser using the Web Audio API.
      </p>
    </div>
  );
}

function ResultCard({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const meta = WALL_META[result.wallType];
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ rotate: -20, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
          className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-4 ${meta.ring} shadow-neon`}
        >
          <Icon className="h-10 w-10 text-background" />
        </motion.div>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Detected</div>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">{result.label}</h2>
        </div>
        <ConfidenceMeter value={result.confidence} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Waves className="h-4 w-4" />} label="Peak frequency" value={`${result.peakFrequency.toFixed(0)} Hz`} />
        <Stat icon={<Volume2 className="h-4 w-4" />} label="RMS volume" value={result.rms.toFixed(3)} />
        <Stat icon={<Timer className="h-4 w-4" />} label="Duration" value={`${result.duration.toFixed(2)} s`} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Frequency spectrum</span>
          <span className="text-xs text-muted-foreground">0 – 4 kHz</span>
        </div>
        <SpectrumVisualizer spectrum={result.spectrum} height={140} />
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Recommendation
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{result.recommendation}</p>
      </div>

      <div className="flex justify-center">
        <Button variant="secondary" onClick={onReset} className="gap-2">
          <Mic className="h-4 w-4" /> Scan another
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="w-full max-w-xs">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Confidence</span>
        <span className="tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
        />
      </div>
    </div>
  );
}
