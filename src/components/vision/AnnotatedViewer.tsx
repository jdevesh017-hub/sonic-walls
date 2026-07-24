import React, { useState } from "react";
import { DetectedCrack, VisualAnalysisResult } from "@/types/vision";
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers, Focus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnotatedViewerProps {
  result: VisualAnalysisResult;
}

export function AnnotatedViewer({ result }: AnnotatedViewerProps) {
  const [showDetections, setShowDetections] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCrackId, setSelectedCrackId] = useState<number | null>(null);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(4, Number((z + 0.5).toFixed(1))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedCrackId(null);
  };

  const selectedCrack = result.cracks.find((c) => c.id === selectedCrackId);

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showDetections ? "default" : "outline"}
            onClick={() => setShowDetections(!showDetections)}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            {showDetections ? <Layers className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showDetections ? "Showing AI Detections" : "Showing Original Image"}
          </Button>

          <span className="text-muted-foreground">|</span>

          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" onClick={handleZoomOut} disabled={zoomLevel <= 1} className="h-8 w-8">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="w-12 text-center font-mono font-bold text-foreground">{Math.round(zoomLevel * 100)}%</span>
            <Button size="icon" variant="outline" onClick={handleZoomIn} disabled={zoomLevel >= 4} className="h-8 w-8">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleResetZoom} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Selected Crack Focus Badge */}
        {selectedCrack && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-1 text-primary border border-primary/30">
            <Focus className="h-3.5 w-3.5" />
            <span>Focused on Crack #{selectedCrack.id} ({selectedCrack.lengthPx}px)</span>
          </div>
        )}
      </div>

      {/* Main Image Display Box */}
      <div className="relative max-h-[540px] overflow-auto rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl flex items-center justify-center">
        <div
          className="relative transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={showDetections ? result.annotatedImageDataUrl : result.originalImageDataUrl}
            alt="Wall Surface Inspection"
            className="max-h-[500px] w-auto rounded-lg object-contain"
          />

          {/* Render Clickable Bounding Box Hotspots */}
          {showDetections &&
            result.cracks.map((crack) => {
              const isSelected = selectedCrackId === crack.id;
              return (
                <div
                  key={crack.id}
                  onClick={() => setSelectedCrackId(isSelected ? null : crack.id)}
                  style={{
                    left: `${crack.boundingBox.x}px`,
                    top: `${crack.boundingBox.y}px`,
                    width: `${crack.boundingBox.width}px`,
                    height: `${crack.boundingBox.height}px`,
                  }}
                  className={`absolute cursor-pointer rounded transition-all ${
                    isSelected
                      ? "ring-4 ring-cyan-400 bg-cyan-400/20 shadow-lg scale-105"
                      : "hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/10"
                  }`}
                  title={`Click to inspect Crack #${crack.id}`}
                />
              );
            })}
        </div>
      </div>

      {/* Crack Selection Chips List */}
      {result.cracks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Select Crack to Inspect ({result.cracks.length} Detected)
          </div>

          <div className="flex flex-wrap gap-2">
            {result.cracks.map((crack) => {
              const isSelected = selectedCrackId === crack.id;
              const isHigh = crack.severity === "High";
              const isMed = crack.severity === "Medium";

              return (
                <button
                  key={crack.id}
                  onClick={() => {
                    setSelectedCrackId(isSelected ? null : crack.id);
                    if (!isSelected) setZoomLevel(1.5);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isHigh
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      : isMed
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                      : "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                  }`}
                >
                  <span>Crack #{crack.id}</span>
                  <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px] tabular-nums font-mono">
                    {crack.lengthRealMm ? `${crack.lengthRealMm} mm` : `${crack.lengthPx} px`}
                  </span>
                  <span className="text-[10px] opacity-80">({crack.severity})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
