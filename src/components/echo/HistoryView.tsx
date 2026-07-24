import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { api, ScanDTO } from "@/lib/api";
import { VisualScanDTO } from "@/types/vision";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Trash2,
  FileText,
  Clock,
  Box,
  Radio,
  AlertTriangle,
  Waves,
  Volume2,
  Timer,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Wrench,
  ShieldAlert,
  ExternalLink,
  Camera,
  Mic,
  Layers,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpectrumVisualizer } from "./SpectrumVisualizer";

const WALL_META = {
  solid: { icon: Box, color: "from-stone-300 to-stone-400", ring: "ring-stone-300/30" },
  cracked: { icon: AlertTriangle, color: "from-amber-300 to-orange-400", ring: "ring-amber-300/30" },
  hollow: { icon: Radio, color: "from-teal-300 to-cyan-400", ring: "ring-teal-300/30" },
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

export function HistoryView() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [visualScans, setVisualScans] = useState<VisualScanDTO[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "acoustic" | "visual">("all");
  const [wallTypeFilter, setWallTypeFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [acousticRes, visualRes] = await Promise.all([
        api.getScans({ wallType: wallTypeFilter, search }),
        api.getVisualScans().catch(() => ({ success: false, scans: [] })),
      ]);

      if (acousticRes.success) {
        setScans(acousticRes.scans || []);
      }
      if (visualRes.success) {
        setVisualScans(visualRes.scans || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch scan history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchScans();
    }
  }, [isAuthenticated, wallTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      fetchScans();
    }
  };

  const handleDeleteAcoustic = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan from history?")) return;
    setDeletingId(id);
    try {
      const res = await api.deleteScan(id);
      if (res.success) {
        setScans((prev) => prev.filter((s) => s._id !== id));
        if (selectedScan?._id === id) setSelectedScan(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete scan");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteVisual = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this visual scan from history?")) return;
    setDeletingId(id);
    try {
      const res = await api.deleteVisualScan(id);
      if (res.success) {
        setVisualScans((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete visual scan");
    } finally {
      setDeletingId(null);
    }
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
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in or create an account to view and manage your acoustic & visual scan history logs.
          </p>
          <div className="mt-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Sign In to View History
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full-Page Result Detail View when an acoustic scan is selected
  if (selectedScan) {
    const meta = WALL_META[selectedScan.wallType] || WALL_META.solid;
    const plan = ACTION_PLANS[selectedScan.wallType] || ACTION_PLANS.solid;
    const Icon = meta.icon;

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <button
          onClick={() => setSelectedScan(null)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to History List</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative overflow-hidden rounded-2xl p-6 md:p-10 border border-white/10 space-y-6"
        >
          {/* Header Metadata */}
          <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Inspection Timestamp: {new Date(selectedScan.scanDate).toLocaleString()}</span>
            </div>
            <span className="text-xs text-muted-foreground">Scan ID: {selectedScan._id}</span>
          </div>

          {/* Detection Result Badge */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-4 ${meta.ring} shadow-brand`}>
              <Icon className="h-10 w-10 text-background" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Detected</div>
              <h2 className="mt-1 text-3xl font-bold md:text-4xl">{selectedScan.label}</h2>
            </div>

            {/* Confidence Meter */}
            <div className="w-full max-w-xs">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence Score</span>
                <span className="tabular-nums text-foreground">{selectedScan.confidenceScore}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${selectedScan.confidenceScore}%`, background: "var(--gradient-brand)" }}
                />
              </div>
            </div>
          </div>

          {/* Acoustic Characteristics Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Waves className="h-4 w-4" /> Peak Frequency
              </div>
              <div className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                {selectedScan.peakFrequency.toFixed(0)} Hz
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Volume2 className="h-4 w-4" /> RMS Volume
              </div>
              <div className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                {selectedScan.rms.toFixed(3)}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Timer className="h-4 w-4" /> Duration
              </div>
              <div className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                {selectedScan.duration.toFixed(2)} s
              </div>
            </div>
          </div>

          {/* 96-Bar Frequency Spectrum */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Frequency spectrum (40 Hz – 3.8 kHz)</span>
              <span className="text-xs text-primary font-medium">Spectral Line Curve</span>
            </div>
            <SpectrumVisualizer spectrum={selectedScan.fftSummary?.length ? selectedScan.fftSummary : null} height={150} />
          </div>

          {/* Structural Recommendation Card */}
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-bold">
              <Sparkles className="h-4 w-4 text-primary" /> Structural Inspection Recommendation
            </div>
            <p className="text-sm leading-relaxed text-foreground font-medium">{selectedScan.recommendation}</p>

            <div className="mt-4 border-t border-white/10 pt-3 grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg bg-black/30 p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                  <Wrench className="h-3.5 w-3.5 text-sky-400" />
                  <span>Recommended Anchors</span>
                </div>
                <p className="text-foreground">{plan.anchors}</p>
              </div>

              <div className="rounded-lg bg-black/30 p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  <span>Load Capacity</span>
                </div>
                <p className="text-foreground">{plan.loadLimit}</p>
              </div>

              <div className="rounded-lg bg-black/30 p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                  <Timer className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Drilling Safety Limit</span>
                </div>
                <p className="text-foreground">{plan.drillingDepth}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/report/$id"
              params={{ id: selectedScan._id }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              <span>View Web Inspection Report</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </Link>

            <button
              onClick={() => handleDeleteAcoustic(selectedScan._id)}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Scan Log</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inspection Scan History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and review all your saved Acoustic FFT diagnostics and AI Visual Crack inspections
        </p>
      </div>

      {/* Mode Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-4">
        <Button
          size="sm"
          variant={modeFilter === "all" ? "default" : "outline"}
          onClick={() => setModeFilter("all")}
          className="gap-2 text-xs font-semibold"
        >
          <Layers className="h-3.5 w-3.5" /> All Scans ({scans.length + visualScans.length})
        </Button>
        <Button
          size="sm"
          variant={modeFilter === "acoustic" ? "default" : "outline"}
          onClick={() => setModeFilter("acoustic")}
          className="gap-2 text-xs font-semibold"
        >
          <Mic className="h-3.5 w-3.5 text-primary" /> Acoustic FFT Scans ({scans.length})
        </Button>
        <Button
          size="sm"
          variant={modeFilter === "visual" ? "default" : "outline"}
          onClick={() => setModeFilter("visual")}
          className="gap-2 text-xs font-semibold"
        >
          <Camera className="h-3.5 w-3.5 text-amber-400" /> Visual Crack Scans ({visualScans.length})
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass mb-8 flex flex-col gap-4 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scan logs by keyword or label…"
            className="w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-20 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1 h-7 text-xs px-3">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={wallTypeFilter}
            onChange={(e) => setWallTypeFilter(e.target.value)}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Wall Types</option>
            <option value="solid">Solid Walls</option>
            <option value="hollow">Hollow Walls</option>
            <option value="cracked">Cracked Walls</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Scans Lists */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading inspection history…</div>
      ) : scans.length === 0 && visualScans.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold">No Scans Found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No matching scan records found in history. Try performing a new acoustic or visual scan.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
              <Mic className="h-4 w-4" /> Acoustic Scan
            </Link>
            <Link to="/visual-scan" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-medium text-slate-950">
              <Camera className="h-4 w-4" /> Visual Scan
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {/* Render Acoustic Scans */}
            {(modeFilter === "all" || modeFilter === "acoustic") &&
              scans.map((scan) => (
                <motion.div
                  key={scan._id}
                  onClick={() => setSelectedScan(scan)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass cursor-pointer rounded-xl border border-white/10 p-5 transition hover:border-primary/50 hover:bg-white/[0.04] group"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${
                          scan.wallType === "solid"
                            ? "bg-stone-500/20 text-stone-300 ring-1 ring-stone-400/30"
                            : scan.wallType === "cracked"
                            ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
                            : "bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30"
                        }`}
                      >
                        {scan.wallType === "solid" && <Box className="h-6 w-6" />}
                        {scan.wallType === "cracked" && <AlertTriangle className="h-6 w-6" />}
                        {scan.wallType === "hollow" && <Radio className="h-6 w-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary flex items-center gap-1">
                            <Mic className="h-3 w-3" /> ACOUSTIC
                          </span>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">{scan.label}</h3>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {scan.confidenceScore}% Confidence
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(scan.scanDate).toLocaleString()}
                          </span>
                          <span>Peak: {scan.peakFrequency.toFixed(0)} Hz</span>
                          <span>RMS: {scan.rms.toFixed(3)}</span>
                        </div>

                        <p className="mt-2 text-xs text-foreground/80 line-clamp-2">{scan.recommendation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0">
                      <Link
                        to="/report/$id"
                        params={{ id: scan._id }}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Report</span>
                      </Link>

                      <button
                        onClick={(e) => handleDeleteAcoustic(scan._id, e)}
                        disabled={deletingId === scan._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

            {/* Render Visual Scans */}
            {(modeFilter === "all" || modeFilter === "visual") &&
              visualScans.map((vScan) => (
                <motion.div
                  key={vScan._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-xl border border-amber-500/20 p-5 transition hover:border-amber-500/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30">
                        <Camera className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                            <Camera className="h-3 w-3" /> VISUAL AI
                          </span>
                          <h3 className="text-lg font-bold text-foreground">
                            {vScan.hasCrack ? `⚠ ${vScan.crackCount} Visible Crack(s)` : "✓ No Visible Crack"}
                          </h3>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                            Health Score: {vScan.wallHealthScore}%
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(vScan.scanDate).toLocaleString()}
                          </span>
                          <span>Severity: {vScan.overallSeverity}</span>
                          <span>Largest: {vScan.largestCrackPx} px</span>
                        </div>

                        <p className="mt-2 text-xs text-foreground/80 line-clamp-2">{vScan.recommendation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-white/10 pt-3 md:border-t-0 md:pt-0">
                      <button
                        onClick={(e) => handleDeleteVisual(vScan._id, e)}
                        disabled={deletingId === vScan._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
