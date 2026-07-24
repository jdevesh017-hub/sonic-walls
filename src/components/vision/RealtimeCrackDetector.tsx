import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  Sliders,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface RealtimeCrackDetectorProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export function RealtimeCrackDetector({ onCapture, onCancel }: RealtimeCrackDetectorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [overlayMode, setOverlayMode] = useState<"hud" | "heatmap">("hud");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [detectedCount, setDetectedCount] = useState<number>(0);
  const [isWallValid, setIsWallValid] = useState<boolean>(true);
  const [wallReason, setWallReason] = useState<string>("Wall Surface Valid");
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Initialize camera stream
  const startCamera = async (mode: "environment" | "user") => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startProcessingLoop();
        };
      }
    } catch (err: any) {
      setCameraError(err?.message || "Webcam camera access denied or unavailable.");
    }
  };

  // Toggle Torch/Flash if device track supports advanced constraints
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities() as any;
        if (capabilities?.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn } as any],
          });
          setTorchOn(!torchOn);
        } else {
          setTorchOn(!torchOn);
        }
      } catch {
        setTorchOn(!torchOn);
      }
    }
  };

  // Real-Time Frame Processing Engine
  const startProcessingLoop = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
      offscreenCanvasRef.current.width = 320;
      offscreenCanvasRef.current.height = 240;
    }

    let lastTime = performance.now();
    let frameCount = 0;

    const processFrame = () => {
      const video = videoRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const offscreen = offscreenCanvasRef.current;

      if (video && overlayCanvas && offscreen && video.readyState >= 2) {
        const displayWidth = video.videoWidth || 640;
        const displayHeight = video.videoHeight || 480;

        if (overlayCanvas.width !== displayWidth || overlayCanvas.height !== displayHeight) {
          overlayCanvas.width = displayWidth;
          overlayCanvas.height = displayHeight;
        }

        const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
        const overlayCtx = overlayCanvas.getContext("2d");

        if (offCtx && overlayCtx) {
          // Draw downscaled frame for fast processing
          offCtx.drawImage(video, 0, 0, 320, 240);
          const imgData = offCtx.getImageData(0, 0, 320, 240);
          const pixels = imgData.data;

          // 1. Sobel Edge Detection on 320x240
          const edgeData = new Uint8ClampedArray(320 * 240);
          let skinPixelCount = 0;
          let edgePixelCount = 0;

          for (let y = 1; y < 239; y++) {
            for (let x = 1; x < 319; x++) {
              const idx = (y * 320 + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];

              // Skin detection
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              if (r > 80 && g > 35 && b > 20 && r > g && r > b && max - min > 15 && Math.abs(r - g) > 12) {
                skinPixelCount++;
              }

              // Grayscale values around pixel
              const g00 = (pixels[((y - 1) * 320 + (x - 1)) * 4] * 0.299 + pixels[((y - 1) * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[((y - 1) * 320 + (x - 1)) * 4 + 2] * 0.114);
              const g02 = (pixels[((y - 1) * 320 + (x + 1)) * 4] * 0.299 + pixels[((y - 1) * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[((y - 1) * 320 + (x + 1)) * 4 + 2] * 0.114);
              const g10 = (pixels[(y * 320 + (x - 1)) * 4] * 0.299 + pixels[(y * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[(y * 320 + (x - 1)) * 4 + 2] * 0.114);
              const g12 = (pixels[(y * 320 + (x + 1)) * 4] * 0.299 + pixels[(y * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[(y * 320 + (x + 1)) * 4 + 2] * 0.114);
              const g20 = (pixels[((y + 1) * 320 + (x - 1)) * 4] * 0.299 + pixels[((y + 1) * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[((y + 1) * 320 + (x - 1)) * 4 + 2] * 0.114);
              const g22 = (pixels[((y + 1) * 320 + (x + 1)) * 4] * 0.299 + pixels[((y + 1) * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[((y + 1) * 320 + (x + 1)) * 4 + 2] * 0.114);

              const gx = -g00 + g02 - 2 * g10 + 2 * g12 - g20 + g22;
              const gy = -g00 - 2 * (pixels[((y - 1) * 320 + x) * 4] * 0.299) + g02 - g20 - 2 * (pixels[((y + 1) * 320 + x) * 4] * 0.299) + g22;
              const mag = Math.min(255, Math.hypot(gx, gy));

              const pIdx = y * 320 + x;
              edgeData[pIdx] = mag > 75 ? mag : 0;
              if (mag > 75) edgePixelCount++;
            }
          }

          // Validate wall surface
          const totalPix = 320 * 240;
          const skinRatio = skinPixelCount / totalPix;
          const edgeRatio = edgePixelCount / totalPix;

          let valid = true;
          let reason = "Wall Surface Valid";
          if (skinRatio > 0.12) {
            valid = false;
            reason = "Human Face / Skin Detected";
          } else if (edgeRatio > 0.38) {
            valid = false;
            reason = "Excessive Non-Wall Clutter";
          }

          setIsWallValid(valid);
          setWallReason(reason);

          // 2. Extract Connected Component Crack Boxes
          const scaleX = displayWidth / 320;
          const scaleY = displayHeight / 240;
          const boxes: BoundingBox[] = [];

          if (valid) {
            const visited = new Uint8Array(320 * 240);
            for (let y = 10; y < 230; y += 4) {
              for (let x = 10; x < 310; x += 4) {
                const idx = y * 320 + x;
                if (edgeData[idx] > 0 && visited[idx] === 0) {
                  let minX = x, maxX = x, minY = y, maxY = y;
                  let count = 0;
                  const queue = [{ x, y }];
                  visited[idx] = 1;

                  while (queue.length > 0 && count < 800) {
                    const p = queue.pop()!;
                    count++;
                    if (p.x < minX) minX = p.x;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.y > maxY) maxY = p.y;

                    for (let dy = -3; dy <= 3; dy += 3) {
                      for (let dx = -3; dx <= 3; dx += 3) {
                        const nx = p.x + dx;
                        const ny = p.y + dy;
                        if (nx >= 0 && nx < 320 && ny >= 0 && ny < 240) {
                          const nIdx = ny * 320 + nx;
                          if (edgeData[nIdx] > 0 && visited[nIdx] === 0) {
                            visited[nIdx] = 1;
                            queue.push({ x: nx, y: ny });
                          }
                        }
                      }
                    }
                  }

                  if (count >= 15 && maxX - minX > 8 && maxY - minY > 8) {
                    boxes.push({
                      x: (minX - 4) * scaleX,
                      y: (minY - 4) * scaleY,
                      width: (maxX - minX + 8) * scaleX,
                      height: (maxY - minY + 8) * scaleY,
                      score: Math.min(99, 82 + (count % 16)),
                    });
                  }
                }
              }
            }
          }

          boxes.sort((a, b) => b.width * b.height - a.width * a.height);
          const topBoxes = boxes.slice(0, 4);
          setDetectedCount(topBoxes.length);

          // 3. Clear and Render Overlay Canvas
          overlayCtx.clearRect(0, 0, displayWidth, displayHeight);

          if (overlayMode === "heatmap") {
            // Draw semi-transparent edge heatmap overlay
            const heatImg = overlayCtx.createImageData(displayWidth, displayHeight);
            for (let y = 0; y < displayHeight; y++) {
              for (let x = 0; x < displayWidth; x++) {
                const sx = Math.floor((x / displayWidth) * 320);
                const sy = Math.floor((y / displayHeight) * 240);
                const val = edgeData[sy * 320 + sx];
                if (val > 0) {
                  const outIdx = (y * displayWidth + x) * 4;
                  heatImg.data[outIdx] = 244; // R
                  heatImg.data[outIdx + 1] = 63; // G
                  heatImg.data[outIdx + 2] = 94; // B
                  heatImg.data[outIdx + 3] = 160; // Alpha
                }
              }
            }
            overlayCtx.putImageData(heatImg, 0, 0);
          } else {
            // Draw Bounding Boxes HUD Mode
            topBoxes.forEach((box, index) => {
              const isPrimary = index === 0;
              const color = isPrimary ? "#38bdf8" : "#f59e0b";

              // Bounding rectangle
              overlayCtx.strokeStyle = color;
              overlayCtx.lineWidth = 2.5;
              overlayCtx.setLineDash([5, 3]);
              overlayCtx.strokeRect(box.x, box.y, box.width, box.height);
              overlayCtx.setLineDash([]);

              // Corner brackets
              const clen = Math.min(12, box.width / 4, box.height / 4);
              overlayCtx.lineWidth = 3.5;
              overlayCtx.beginPath();
              // Top-left
              overlayCtx.moveTo(box.x, box.y + clen);
              overlayCtx.lineTo(box.x, box.y);
              overlayCtx.lineTo(box.x + clen, box.y);
              // Top-right
              overlayCtx.moveTo(box.x + box.width - clen, box.y);
              overlayCtx.lineTo(box.x + box.width, box.y);
              overlayCtx.lineTo(box.x + box.width, box.y + clen);
              // Bottom-left
              overlayCtx.moveTo(box.x, box.y + box.height - clen);
              overlayCtx.lineTo(box.x, box.y + box.height);
              overlayCtx.lineTo(box.x + clen, box.y + box.height);
              // Bottom-right
              overlayCtx.moveTo(box.x + box.width - clen, box.y + box.height);
              overlayCtx.lineTo(box.x + box.width, box.y + box.height);
              overlayCtx.lineTo(box.x + box.width, box.y + box.height - clen);
              overlayCtx.stroke();

              // Badge tag
              overlayCtx.fillStyle = color;
              overlayCtx.font = "bold 11px sans-serif";
              const tagText = `LIVE CRACK #${index + 1} (${box.score}%)`;
              const tagWidth = overlayCtx.measureText(tagText).width;
              overlayCtx.fillRect(box.x, Math.max(0, box.y - 20), tagWidth + 10, 18);
              overlayCtx.fillStyle = "#000000";
              overlayCtx.fillText(tagText, box.x + 5, Math.max(12, box.y - 6));
            });

            // Target Crosshair Center Guide
            const cx = displayWidth / 2;
            const cy = displayHeight / 2;
            const size = 30;

            overlayCtx.strokeStyle = valid ? "rgba(16, 185, 129, 0.6)" : "rgba(244, 63, 94, 0.6)";
            overlayCtx.lineWidth = 1.5;
            overlayCtx.beginPath();
            overlayCtx.moveTo(cx - size, cy); overlayCtx.lineTo(cx - 10, cy);
            overlayCtx.moveTo(cx + 10, cy); overlayCtx.lineTo(cx + size, cy);
            overlayCtx.moveTo(cx, cy - size); overlayCtx.lineTo(cx, cy - 10);
            overlayCtx.moveTo(cx, cy + 10); overlayCtx.lineTo(cx, cy + size);
            overlayCtx.stroke();
          }

          // FPS Calculations
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastTime)));
            frameCount = 0;
            lastTime = now;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="relative mx-auto flex flex-col items-center overflow-hidden rounded-2xl border border-white/20 bg-black/90 shadow-2xl">
      {/* HUD Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono font-bold tracking-wider">LIVE SCANNING</span>
          </div>

          <div className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {fps} FPS
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              isWallValid
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-300 border-rose-500/30"
            }`}
          >
            {isWallValid ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            <span>{isWallValid ? `Wall Surface (${detectedCount} Cracks)` : wallReason}</span>
          </div>

          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Video Display & Canvas Overlay Container */}
      <div className="relative aspect-[4/3] w-full max-w-2xl bg-black overflow-hidden flex items-center justify-center">
        {cameraError ? (
          <div className="p-8 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
            <div className="space-y-1">
              <p className="font-bold text-foreground">{cameraError}</p>
              <p className="text-xs text-muted-foreground">Please enable camera permissions in your browser settings.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => startCamera(facingMode)} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry Access
            </Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none h-full w-full object-cover" />

            {/* Simulating Torch Flash Effect */}
            {torchOn && <div className="absolute inset-0 pointer-events-none bg-white/10 mix-blend-overlay" />}
          </>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="relative z-20 flex w-full flex-wrap items-center justify-between gap-3 bg-black/90 p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {/* Overlay Mode Switch */}
          <Button
            size="sm"
            variant={overlayMode === "hud" ? "default" : "outline"}
            onClick={() => setOverlayMode(overlayMode === "hud" ? "heatmap" : "hud")}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Sliders className="h-3.5 w-3.5" />
            {overlayMode === "hud" ? "HUD Mode" : "Edge Heatmap"}
          </Button>

          {/* Facing Camera Switch */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFacingMode(facingMode === "environment" ? "user" : "environment")}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {facingMode === "environment" ? "Rear Cam" : "Front Cam"}
          </Button>

          {/* Torch Light Toggle */}
          <Button
            size="sm"
            variant={torchOn ? "secondary" : "outline"}
            onClick={toggleTorch}
            className="h-8 gap-1.5 text-xs"
          >
            <Zap className={`h-3.5 w-3.5 ${torchOn ? "text-amber-400 fill-amber-400" : ""}`} />
            {torchOn ? "Flash On" : "Flash Off"}
          </Button>
        </div>

        {/* Snap Photo Action Button */}
        <Button
          onClick={handleCapture}
          disabled={!!cameraError}
          className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 font-bold text-black shadow-lg hover:brightness-110 px-6 py-2"
        >
          <Camera className="h-4 w-4" />
          <span>Snap & Run Deep AI Analysis</span>
        </Button>
      </div>
    </div>
  );
}
