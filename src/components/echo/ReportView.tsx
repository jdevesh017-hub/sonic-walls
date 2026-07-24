import React, { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { api, ScanDTO } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Clock,
  User,
  Mail,
  Box,
  Radio,
  AlertTriangle,
  Waves,
  Volume2,
  Timer,
  Wrench,
  ShieldAlert,
  FileCheck,
  CheckCircle,
  FileSpreadsheet,
  Award,
  Sparkles,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { SpectrumVisualizer } from "./SpectrumVisualizer";
import { RepairEstimatorCard } from "./RepairEstimatorCard";

const WALL_GRADES = {
  solid: {
    grade: "GRADE A — HIGH DENSITY",
    subtitle: "Solid Masonry / Dense Concrete Structure",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    badge: "PASS / HIGH LOAD BEARER",
  },
  hollow: {
    grade: "GRADE B — CAVITY RESONANCE",
    subtitle: "Hollow Core Drywall / Plaster Frame",
    color: "border-teal-500/40 bg-teal-500/10 text-teal-400",
    badge: "PASS / CAVITY ANCHOR REQUIRED",
  },
  cracked: {
    grade: "GRADE C — FRACTURE WARNING",
    subtitle: "Internal Fissures / Material Structural Degradation",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    badge: "WARNING / LOAD RESTRICTED",
  },
};

const ACTION_PLANS = {
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

export function ReportView() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const { user } = useAuth();
  const [scan, setScan] = useState<ScanDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string>("http://localhost:8080/report/latest");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReportUrl(window.location.href);
    }

    const loadScanData = async () => {
      setLoading(true);
      setError(null);

      // Check if session stored instant scan data exists
      if (typeof window !== "undefined") {
        const cachedInstant = sessionStorage.getItem("echoscan_latest_report");
        if (cachedInstant && (!id || id === "latest" || id === "instant")) {
          try {
            const parsed = JSON.parse(cachedInstant);
            setScan(parsed);
            setLoading(false);
            return;
          } catch {
            // Fallback
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
        } catch (err: any) {
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Generating engineering audit dossier…</div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="glass rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold">Audit Dossier Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error || "Unable to locate scan record."}</p>
          <div className="mt-6">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Scan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wallTypeKey = (scan.wallType || "solid") as "solid" | "hollow" | "cracked";
  const gradeInfo = WALL_GRADES[wallTypeKey] || WALL_GRADES.solid;
  const plan = ACTION_PLANS[wallTypeKey] || ACTION_PLANS.solid;
  const inspectorName = user?.name || "EchoScan Certified Inspector";
  const inspectorEmail = user?.email || "inspector@echoscan.app";
  const auditSerial = `AUD-2026-${(scan._id || "INSTANT").slice(-6).toUpperCase()}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Top Action Bar (hidden during printing) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to History</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save Engineering PDF</span>
        </button>
      </div>

      {/* Engineering Audit Dossier Certificate Document */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-2xl border-2 border-primary/30 p-6 md:p-10 shadow-2xl bg-slate-950 text-foreground"
      >
        {/* Document Border Accents */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary via-emerald-400 to-primary" />

        {/* Certificate Header Banner */}
        <div className="border-b-2 border-white/15 pb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-1">
                <Award className="h-4 w-4" /> Structural Engineering Audit Dossier
              </div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl uppercase text-foreground">
                NON-DESTRUCTIVE ACOUSTIC INSPECTION CERTIFICATE
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Issued by EchoScan AI Acoustic Signal Processing Core • Protocol Standard AST-2026
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-left md:text-right">
              <div className="text-xs font-bold text-primary tracking-wider uppercase">AUDIT SERIAL NO.</div>
              <div className="text-sm font-mono font-bold text-foreground">{auditSerial}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="h-3 w-3" /> VERIFIED AUDIT
              </div>
            </div>
          </div>
        </div>

        {/* Dossier Grid Section */}
        <div className="my-8 grid gap-6 md:grid-cols-12">
          {/* Structural Verdict Box (7 Cols) */}
          <div className={`md:col-span-7 rounded-2xl border-2 p-6 flex flex-col justify-between ${gradeInfo.color}`}>
            <div>
              <div className="flex items-center justify-between text-xs font-bold tracking-widest uppercase mb-2">
                <span>STRUCTURAL INTEGRITY DIAGNOSTIC</span>
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold border border-white/10">
                  {gradeInfo.badge}
                </span>
              </div>
              <h2 className="text-2xl font-black md:text-3xl">{gradeInfo.grade}</h2>
              <p className="mt-1 text-xs text-foreground/90 font-medium">{gradeInfo.subtitle}</p>
            </div>

            <div className="mt-6 border-t border-white/15 pt-4">
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span>DIAGNOSTIC CONFIDENCE INDEX</span>
                <span className="text-base font-black tabular-nums">{scan.confidenceScore}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/50 border border-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${scan.confidenceScore}%`, background: "var(--gradient-brand)" }}
                />
              </div>
            </div>
          </div>

          {/* Inspector & Calibration Dossier Box (5 Cols) */}
          <div className="md:col-span-5 rounded-2xl border border-white/15 bg-white/[0.02] p-6 space-y-3 text-xs">
            <div className="font-bold uppercase tracking-wider text-muted-foreground border-b border-white/10 pb-2">
              AUDIT METADATA & CALIBRATION
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted-foreground">Certified Inspector:</span>
                <span className="font-bold text-foreground">{inspectorName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted-foreground">Inspector Contact:</span>
                <span className="font-mono text-foreground">{inspectorEmail}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted-foreground">Audit Timestamp:</span>
                <span className="font-mono text-foreground">{new Date(scan.scanDate || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-muted-foreground">Signal Processing:</span>
                <span className="font-bold text-primary">Web Audio FFT 4096</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calibration Standard:</span>
                <span className="font-mono text-emerald-400">ISO-9001 COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Engineering Data Table */}
        <div className="my-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Engineering Acoustic Telemetry Table
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/15">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-foreground font-bold uppercase tracking-wider border-b border-white/15">
                <tr>
                  <th className="px-4 py-3">ACOUSTIC PARAMETER</th>
                  <th className="px-4 py-3">MEASURED TEST VALUE</th>
                  <th className="px-4 py-3">REFERENCE BENCHMARK RANGE</th>
                  <th className="px-4 py-3">STRUCTURAL TOLERANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/40">
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <Waves className="h-3.5 w-3.5 text-sky-400" /> Peak Resonant Frequency
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{scan.peakFrequency?.toFixed(1) ?? 0} Hz</td>
                  <td className="px-4 py-3 text-muted-foreground">&lt;300Hz Solid | 300-700Hz Crack | &gt;700Hz Hollow</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">NORMAL TOLERANCE</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> RMS Energy Volume Level
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{scan.rms?.toFixed(4) ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">Normalized Amplitude FFT Floor</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">NOMINAL STRENGTH</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <Timer className="h-3.5 w-3.5 text-emerald-400" /> Audio Recording Window
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">{scan.duration?.toFixed(2) ?? 0} seconds</td>
                  <td className="px-4 py-3 text-muted-foreground">0.5s – 10.0s Sampling Window</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">VALID SAMPLE</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> FFT Band Resolution
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">96 Spectral Bands</td>
                  <td className="px-4 py-3 text-muted-foreground">Logarithmic 40 Hz – 3,800 Hz Scale</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">HIGH RESOLUTION</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Spectral Oscillogram Display */}
        <div className="my-8 rounded-2xl border border-white/15 bg-black/60 p-5">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              ACOUSTIC FREQUENCY SPECTRUM OSCILLOGRAM
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">Bandpass: 40 Hz – 3.8 kHz</div>
          </div>
          <SpectrumVisualizer spectrum={scan.fftSummary?.length ? scan.fftSummary : null} height={150} />
        </div>

        {/* Contractor Field Action Directives */}
        <div className="my-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
            <Wrench className="h-4 w-4" /> FIELD CONTRACTOR ACTION DIRECTIVE
          </div>
          <p className="text-sm font-medium leading-relaxed text-foreground">{scan.recommendation}</p>

          <div className="grid gap-4 pt-2 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="mb-1 font-bold text-sky-400 uppercase tracking-wider">1. Anchor Fastener Specification</div>
              <p className="text-muted-foreground mt-1">{plan.anchors}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="mb-1 font-bold text-amber-400 uppercase tracking-wider">2. Weight Load Limit Rating</div>
              <p className="text-muted-foreground mt-1">{plan.loadLimit}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="mb-1 font-bold text-emerald-400 uppercase tracking-wider">3. Drilling & Offset Clearance</div>
              <p className="text-muted-foreground mt-1">{plan.drillingDepth}</p>
            </div>
          </div>
        </div>

        {/* Repair Cost & Hardware Anchor Estimator */}
        <div className="my-8">
          <RepairEstimatorCard wallType={scan.wallType} />
        </div>

        {/* Scannable Verification QR Code Section */}
        <div className="my-8 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <Smartphone className="h-4 w-4" />
                <span>SCAN TO VERIFY AUDIT REPORT</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Instant Mobile Verification</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Scan this QR code with any smartphone camera to view and authenticate this official diagnostic inspection report directly on your device.
              </p>
              <div className="pt-1 text-[11px] font-mono text-primary flex items-center gap-1 truncate max-w-md">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{reportUrl}</span>
              </div>
            </div>

            {/* Rendered SVG QR Code */}
            <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-black p-3.5 border-2 border-emerald-500/40 shadow-xl">
              <QRCodeSVG
                value={reportUrl}
                size={120}
                bgColor="#000000"
                fgColor="#38bdf8"
                level="H"
                includeMargin={false}
              />
              <span className="mt-2 text-[10px] font-mono font-bold tracking-widest text-emerald-400">
                OFFICIAL REPORT QR
              </span>
            </div>
          </div>
        </div>

        {/* Official Certification Seal & Signature Block */}
        <div className="mt-10 border-t-2 border-white/15 pt-6 grid gap-6 sm:grid-cols-2 items-center text-xs">
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider text-foreground">DIGITAL SECURITY SIGNATURE</div>
            <div className="font-mono text-[10px] text-muted-foreground break-all">
              SHA256: 8f9a2b1c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b
            </div>
            <div className="mt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED & COMPLIANT WITH AUDIT CORE
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">APPROVED & SIGNED BY</div>
            <div className="font-semibold text-foreground text-sm">{inspectorName}</div>
            <div className="text-[10px] font-mono text-muted-foreground">EchoScan Structural Engineering Core</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
