import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { api, DashboardStatsDTO, ScanDTO } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Box,
  Radio,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Mic,
  Camera,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualScanDTO } from "@/types/vision";

export function DashboardView() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [recentScans, setRecentScans] = useState<ScanDTO[]>([]);
  const [recentVisualScans, setRecentVisualScans] = useState<VisualScanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, visualRes] = await Promise.all([
        api.getDashboardStats(),
        api.getVisualScans().catch(() => ({ success: false, scans: [] })),
      ]);

      if (res.success) {
        setStats(res.stats);
        setRecentScans(res.recentScans || []);
      }

      if (visualRes.success) {
        setRecentVisualScans(visualRes.scans || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

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
            Please log in or create an account to view your acoustic & visual wall analytics.
          </p>
          <div className="mt-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Sign In to Access Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestAcoustic = recentScans[0];
  const latestVisual = recentVisualScans[0];

  const acousticHasDefect = latestAcoustic && latestAcoustic.wallType !== "solid";
  const visualHasDefect = latestVisual && latestVisual.hasCrack;

  let combinedVerdictText = "No structural defects detected. Wall exhibits solid resonance and zero surface cracks.";
  let combinedVerdictColor = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  let combinedVerdictIcon = <CheckCircle className="h-5 w-5 text-emerald-400" />;

  if (acousticHasDefect && visualHasDefect) {
    combinedVerdictText = "High likelihood of wall damage. Professional structural inspection recommended.";
    combinedVerdictColor = "border-rose-500/40 bg-rose-500/15 text-rose-300";
    combinedVerdictIcon = <ShieldAlert className="h-5 w-5 text-rose-400" />;
  } else if (acousticHasDefect) {
    combinedVerdictText = "Internal cavity or resonance defect detected via acoustic echo. Monitor regularly.";
    combinedVerdictColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
    combinedVerdictIcon = <AlertTriangle className="h-5 w-5 text-amber-400" />;
  } else if (visualHasDefect) {
    combinedVerdictText = "Surface crack detected visually; structural core retains solid acoustic resonance.";
    combinedVerdictColor = "border-amber-500/30 bg-amber-500/10 text-amber-300";
    combinedVerdictIcon = <AlertTriangle className="h-5 w-5 text-amber-400" />;
  }

  const total = stats?.totalScans || 0;
  const solidPct = total > 0 ? Math.round(((stats?.solidCount || 0) / total) * 100) : 0;
  const hollowPct = total > 0 ? Math.round(((stats?.hollowCount || 0) / total) * 100) : 0;
  const crackedPct = total > 0 ? Math.round(((stats?.crackedCount || 0) / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inspection Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Combined Multi-Modal Acoustic Resonance & AI Visual Crack Analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => api.downloadUsersCsv()}
            className="gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export User Registry (.csv)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="gap-2 border-white/15 bg-white/5 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Combined Multi-Modal Structural Verdict Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-8 rounded-2xl border-2 p-6 shadow-xl ${combinedVerdictColor}`}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2">
          <Sparkles className="h-4 w-4" /> COMBINED MULTI-MODAL DIAGNOSTIC VERDICT
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {combinedVerdictIcon}
            <h2 className="text-lg font-extrabold md:text-xl">{combinedVerdictText}</h2>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/20"
            >
              <Mic className="h-3.5 w-3.5 text-primary" />
              <span>Acoustic Test</span>
            </Link>

            <Link
              to="/visual-scan"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white/20"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>Visual Test</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Dual Mode Results Comparison Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Mode 1: Audio Result Box */}
        <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Mic className="h-4 w-4" /> 1. Acoustic Resonance Result
            </div>
            {latestAcoustic && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {latestAcoustic.confidenceScore}% Confidence
              </span>
            )}
          </div>

          {latestAcoustic ? (
            <div>
              <div className="text-2xl font-bold text-foreground">{latestAcoustic.label}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Peak: {latestAcoustic.peakFrequency.toFixed(0)} Hz • RMS: {latestAcoustic.rms.toFixed(3)}
              </div>
              <p className="mt-2 text-xs text-foreground/80">{latestAcoustic.recommendation}</p>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No acoustic scan recorded yet. <Link to="/scan" className="text-primary hover:underline">Perform Acoustic Test</Link>
            </div>
          )}
        </div>

        {/* Mode 2: Visual Result Box */}
        <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Camera className="h-4 w-4" /> 2. AI Visual Inspection Result
            </div>
            {latestVisual && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                Health Score: {latestVisual.wallHealthScore}%
              </span>
            )}
          </div>

          {latestVisual ? (
            <div>
              <div className="text-2xl font-bold text-foreground">
                {latestVisual.hasCrack ? `⚠ ${latestVisual.crackCount} Crack(s) Detected` : "✓ No Visible Crack"}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Severity: {latestVisual.overallSeverity} • Largest Crack: {latestVisual.largestCrackPx} px
              </div>
              <p className="mt-2 text-xs text-foreground/80">{latestVisual.recommendation}</p>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No visual scan recorded yet. <Link to="/visual-scan" className="text-amber-400 hover:underline">Perform Visual AI Test</Link>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Total Scans</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-foreground">{stats?.totalScans ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">Lifetime records</div>
        </div>

        <div className="glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Today's Scans</span>
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-foreground">{stats?.todayScans ?? 0}</div>
          <div className="mt-1 text-xs text-muted-foreground">Recorded today</div>
        </div>

        <div className="glass rounded-xl border border-stone-400/20 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-stone-300">
            <span>Solid Walls</span>
            <Box className="h-4 w-4 text-stone-300" />
          </div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-foreground">{stats?.solidCount ?? 0}</div>
          <div className="mt-1 text-xs text-stone-400">{solidPct}% of total</div>
        </div>

        <div className="glass rounded-xl border border-teal-400/20 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-teal-300">
            <span>Hollow Walls</span>
            <Radio className="h-4 w-4 text-teal-300" />
          </div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-foreground">{stats?.hollowCount ?? 0}</div>
          <div className="mt-1 text-xs text-teal-400">{hollowPct}% of total</div>
        </div>

        <div className="glass rounded-xl border border-amber-400/20 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-amber-300">
            <span>Cracked Walls</span>
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-foreground">{stats?.crackedCount ?? 0}</div>
          <div className="mt-1 text-xs text-amber-400">{crackedPct}% of total</div>
        </div>
      </div>

      {/* Distribution Section */}
      <div className="glass mt-8 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold">Wall Classification Distribution</h2>
        <p className="mt-1 text-xs text-muted-foreground">Overall structural composition from your inspection logs</p>

        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/10">
          <div style={{ width: `${solidPct}%` }} className="bg-stone-400 transition-all duration-500" />
          <div style={{ width: `${hollowPct}%` }} className="bg-teal-400 transition-all duration-500" />
          <div style={{ width: `${crackedPct}%` }} className="bg-amber-400 transition-all duration-500" />
        </div>

        <div className="mt-4 flex flex-wrap gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-stone-400" />
            <span>Solid ({solidPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-teal-400" />
            <span>Hollow ({hollowPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span>Cracked ({crackedPct}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="glass mt-8 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Inspection Logs</h2>
            <p className="text-xs text-muted-foreground">Latest wall scans recorded</p>
          </div>
          <Link to="/history" className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline">
            <span>View All History</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {recentScans.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No scan history found. Go to the <Link to="/scan" className="text-primary hover:underline">Scan page</Link> to perform your first wall diagnostic.
            </div>
          ) : (
            recentScans.slice(0, 5).map((scan) => (
              <div
                key={scan._id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      scan.wallType === "solid"
                        ? "bg-stone-500/20 text-stone-300"
                        : scan.wallType === "cracked"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-teal-500/20 text-teal-300"
                    }`}
                  >
                    {scan.wallType === "solid" && <Box className="h-5 w-5" />}
                    {scan.wallType === "cracked" && <AlertTriangle className="h-5 w-5" />}
                    {scan.wallType === "hollow" && <Radio className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{scan.label}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.scanDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Peak: {scan.peakFrequency.toFixed(0)} Hz</span>
                      <span>•</span>
                      <span>Confidence: {scan.confidenceScore}%</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/report/$id"
                  params={{ id: scan._id }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/10"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  View Report
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
