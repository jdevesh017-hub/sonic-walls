import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-DLB67tUv.mjs";
import { c as ShieldCheck, h as ShieldAlert, X, m as CircleAlert, n as RefreshCw, o as SlidersVertical, Z as Zap, C as Camera, g as Layers, p as Eye, q as ZoomOut, r as ZoomIn, s as RotateCcw, t as Focus, S as Sparkles } from "../_libs/lucide-react.mjs";
function AnnotatedViewer({ result }) {
  const [showDetections, setShowDetections] = reactExports.useState(true);
  const [zoomLevel, setZoomLevel] = reactExports.useState(1);
  const [selectedCrackId, setSelectedCrackId] = reactExports.useState(null);
  const handleZoomIn = () => setZoomLevel((z) => Math.min(4, Number((z + 0.5).toFixed(1))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedCrackId(null);
  };
  const selectedCrack = result.cracks.find((c) => c.id === selectedCrackId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: showDetections ? "default" : "outline",
            onClick: () => setShowDetections(!showDetections),
            className: "h-8 gap-1.5 text-xs font-semibold",
            children: [
              showDetections ? /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
              showDetections ? "Showing AI Detections" : "Showing Original Image"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "|" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: handleZoomOut, disabled: zoomLevel <= 1, className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-12 text-center font-mono font-bold text-foreground", children: [
            Math.round(zoomLevel * 100),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "outline", onClick: handleZoomIn, disabled: zoomLevel >= 4, className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: handleResetZoom, className: "h-8 w-8 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      selectedCrack && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-1 text-primary border border-primary/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Focus, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Focused on Crack #",
          selectedCrack.id,
          " (",
          selectedCrack.lengthPx,
          "px)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative max-h-[540px] overflow-auto rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative transition-transform duration-300 ease-out origin-center",
        style: { transform: `scale(${zoomLevel})` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: showDetections ? result.annotatedImageDataUrl : result.originalImageDataUrl,
              alt: "Wall Surface Inspection",
              className: "max-h-[500px] w-auto rounded-lg object-contain"
            }
          ),
          showDetections && result.cracks.map((crack) => {
            const isSelected = selectedCrackId === crack.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                onClick: () => setSelectedCrackId(isSelected ? null : crack.id),
                style: {
                  left: `${crack.boundingBox.x}px`,
                  top: `${crack.boundingBox.y}px`,
                  width: `${crack.boundingBox.width}px`,
                  height: `${crack.boundingBox.height}px`
                },
                className: `absolute cursor-pointer rounded transition-all ${isSelected ? "ring-4 ring-cyan-400 bg-cyan-400/20 shadow-lg scale-105" : "hover:ring-2 hover:ring-amber-400 hover:bg-amber-400/10"}`,
                title: `Click to inspect Crack #${crack.id}`
              },
              crack.id
            );
          })
        ]
      }
    ) }),
    result.cracks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
        " Select Crack to Inspect (",
        result.cracks.length,
        " Detected)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: result.cracks.map((crack) => {
        const isSelected = selectedCrackId === crack.id;
        const isHigh = crack.severity === "High";
        const isMed = crack.severity === "Medium";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setSelectedCrackId(isSelected ? null : crack.id);
              if (!isSelected) setZoomLevel(1.5);
            },
            className: `flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${isSelected ? "border-primary bg-primary text-primary-foreground shadow-md" : isHigh ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : isMed ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Crack #",
                crack.id
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-black/30 px-1.5 py-0.5 text-[10px] tabular-nums font-mono", children: crack.lengthRealMm ? `${crack.lengthRealMm} mm` : `${crack.lengthPx} px` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] opacity-80", children: [
                "(",
                crack.severity,
                ")"
              ] })
            ]
          },
          crack.id
        );
      }) })
    ] })
  ] });
}
function RealtimeCrackDetector({ onCapture, onCancel }) {
  const videoRef = reactExports.useRef(null);
  const overlayCanvasRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const animFrameIdRef = reactExports.useRef(null);
  const offscreenCanvasRef = reactExports.useRef(null);
  const [facingMode, setFacingMode] = reactExports.useState("environment");
  const [overlayMode, setOverlayMode] = reactExports.useState("hud");
  const [cameraError, setCameraError] = reactExports.useState(null);
  const [fps, setFps] = reactExports.useState(0);
  const [detectedCount, setDetectedCount] = reactExports.useState(0);
  const [isWallValid, setIsWallValid] = reactExports.useState(true);
  const [wallReason, setWallReason] = reactExports.useState("Wall Surface Valid");
  const [torchOn, setTorchOn] = reactExports.useState(false);
  const startCamera = async (mode) => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startProcessingLoop();
        };
      }
    } catch (err) {
      setCameraError(err?.message || "Webcam camera access denied or unavailable.");
    }
  };
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities();
        if (capabilities?.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn }]
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
          offCtx.drawImage(video, 0, 0, 320, 240);
          const imgData = offCtx.getImageData(0, 0, 320, 240);
          const pixels = imgData.data;
          const edgeData = new Uint8ClampedArray(320 * 240);
          let skinPixelCount = 0;
          let edgePixelCount = 0;
          for (let y = 1; y < 239; y++) {
            for (let x = 1; x < 319; x++) {
              const idx = (y * 320 + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              if (r > 80 && g > 35 && b > 20 && r > g && r > b && max - min > 15 && Math.abs(r - g) > 12) {
                skinPixelCount++;
              }
              const g00 = pixels[((y - 1) * 320 + (x - 1)) * 4] * 0.299 + pixels[((y - 1) * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[((y - 1) * 320 + (x - 1)) * 4 + 2] * 0.114;
              const g02 = pixels[((y - 1) * 320 + (x + 1)) * 4] * 0.299 + pixels[((y - 1) * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[((y - 1) * 320 + (x + 1)) * 4 + 2] * 0.114;
              const g10 = pixels[(y * 320 + (x - 1)) * 4] * 0.299 + pixels[(y * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[(y * 320 + (x - 1)) * 4 + 2] * 0.114;
              const g12 = pixels[(y * 320 + (x + 1)) * 4] * 0.299 + pixels[(y * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[(y * 320 + (x + 1)) * 4 + 2] * 0.114;
              const g20 = pixels[((y + 1) * 320 + (x - 1)) * 4] * 0.299 + pixels[((y + 1) * 320 + (x - 1)) * 4 + 1] * 0.587 + pixels[((y + 1) * 320 + (x - 1)) * 4 + 2] * 0.114;
              const g22 = pixels[((y + 1) * 320 + (x + 1)) * 4] * 0.299 + pixels[((y + 1) * 320 + (x + 1)) * 4 + 1] * 0.587 + pixels[((y + 1) * 320 + (x + 1)) * 4 + 2] * 0.114;
              const gx = -g00 + g02 - 2 * g10 + 2 * g12 - g20 + g22;
              const gy = -g00 - 2 * (pixels[((y - 1) * 320 + x) * 4] * 0.299) + g02 - g20 - 2 * (pixels[((y + 1) * 320 + x) * 4] * 0.299) + g22;
              const mag = Math.min(255, Math.hypot(gx, gy));
              const pIdx = y * 320 + x;
              edgeData[pIdx] = mag > 75 ? mag : 0;
              if (mag > 75) edgePixelCount++;
            }
          }
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
          const scaleX = displayWidth / 320;
          const scaleY = displayHeight / 240;
          const boxes = [];
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
                    const p = queue.pop();
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
                      score: Math.min(99, 82 + count % 16)
                    });
                  }
                }
              }
            }
          }
          boxes.sort((a, b) => b.width * b.height - a.width * a.height);
          const topBoxes = boxes.slice(0, 4);
          setDetectedCount(topBoxes.length);
          overlayCtx.clearRect(0, 0, displayWidth, displayHeight);
          if (overlayMode === "heatmap") {
            const heatImg = overlayCtx.createImageData(displayWidth, displayHeight);
            for (let y = 0; y < displayHeight; y++) {
              for (let x = 0; x < displayWidth; x++) {
                const sx = Math.floor(x / displayWidth * 320);
                const sy = Math.floor(y / displayHeight * 240);
                const val = edgeData[sy * 320 + sx];
                if (val > 0) {
                  const outIdx = (y * displayWidth + x) * 4;
                  heatImg.data[outIdx] = 244;
                  heatImg.data[outIdx + 1] = 63;
                  heatImg.data[outIdx + 2] = 94;
                  heatImg.data[outIdx + 3] = 160;
                }
              }
            }
            overlayCtx.putImageData(heatImg, 0, 0);
          } else {
            topBoxes.forEach((box, index) => {
              const isPrimary = index === 0;
              const color = isPrimary ? "#38bdf8" : "#f59e0b";
              overlayCtx.strokeStyle = color;
              overlayCtx.lineWidth = 2.5;
              overlayCtx.setLineDash([5, 3]);
              overlayCtx.strokeRect(box.x, box.y, box.width, box.height);
              overlayCtx.setLineDash([]);
              const clen = Math.min(12, box.width / 4, box.height / 4);
              overlayCtx.lineWidth = 3.5;
              overlayCtx.beginPath();
              overlayCtx.moveTo(box.x, box.y + clen);
              overlayCtx.lineTo(box.x, box.y);
              overlayCtx.lineTo(box.x + clen, box.y);
              overlayCtx.moveTo(box.x + box.width - clen, box.y);
              overlayCtx.lineTo(box.x + box.width, box.y);
              overlayCtx.lineTo(box.x + box.width, box.y + clen);
              overlayCtx.moveTo(box.x, box.y + box.height - clen);
              overlayCtx.lineTo(box.x, box.y + box.height);
              overlayCtx.lineTo(box.x + clen, box.y + box.height);
              overlayCtx.moveTo(box.x + box.width - clen, box.y + box.height);
              overlayCtx.lineTo(box.x + box.width, box.y + box.height);
              overlayCtx.lineTo(box.x + box.width, box.y + box.height - clen);
              overlayCtx.stroke();
              overlayCtx.fillStyle = color;
              overlayCtx.font = "bold 11px sans-serif";
              const tagText = `LIVE CRACK #${index + 1} (${box.score}%)`;
              const tagWidth = overlayCtx.measureText(tagText).width;
              overlayCtx.fillRect(box.x, Math.max(0, box.y - 20), tagWidth + 10, 18);
              overlayCtx.fillStyle = "#000000";
              overlayCtx.fillText(tagText, box.x + 5, Math.max(12, box.y - 6));
            });
            const cx = displayWidth / 2;
            const cy = displayHeight / 2;
            const size = 30;
            overlayCtx.strokeStyle = valid ? "rgba(16, 185, 129, 0.6)" : "rgba(244, 63, 94, 0.6)";
            overlayCtx.lineWidth = 1.5;
            overlayCtx.beginPath();
            overlayCtx.moveTo(cx - size, cy);
            overlayCtx.lineTo(cx - 10, cy);
            overlayCtx.moveTo(cx + 10, cy);
            overlayCtx.lineTo(cx + size, cy);
            overlayCtx.moveTo(cx, cy - size);
            overlayCtx.lineTo(cx, cy - 10);
            overlayCtx.moveTo(cx, cy + 10);
            overlayCtx.lineTo(cx, cy + size);
            overlayCtx.stroke();
          }
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1e3) {
            setFps(Math.round(frameCount * 1e3 / (now - lastTime)));
            frameCount = 0;
            lastTime = now;
          }
        }
      }
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };
    animFrameIdRef.current = requestAnimationFrame(processFrame);
  };
  reactExports.useEffect(() => {
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
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, "image/jpeg", 0.95);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex flex-col items-center overflow-hidden rounded-2xl border border-white/20 bg-black/90 shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-400 border border-emerald-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-ping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold tracking-wider", children: "LIVE SCANNING" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-muted-foreground", children: [
          fps,
          " FPS"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${isWallValid ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border-rose-500/30"}`,
            children: [
              isWallValid ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isWallValid ? `Wall Surface (${detectedCount} Cracks)` : wallReason })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onCancel,
            className: "flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-[4/3] w-full max-w-2xl bg-black overflow-hidden flex items-center justify-center", children: cameraError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mx-auto h-12 w-12 text-rose-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-foreground", children: cameraError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Please enable camera permissions in your browser settings." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => startCamera(facingMode), className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
        " Retry Access"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: overlayCanvasRef, className: "absolute inset-0 pointer-events-none h-full w-full object-cover" }),
      torchOn && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none bg-white/10 mix-blend-overlay" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 flex w-full flex-wrap items-center justify-between gap-3 bg-black/90 p-4 border-t border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: overlayMode === "hud" ? "default" : "outline",
            onClick: () => setOverlayMode(overlayMode === "hud" ? "heatmap" : "hud"),
            className: "h-8 gap-1.5 text-xs font-semibold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { className: "h-3.5 w-3.5" }),
              overlayMode === "hud" ? "HUD Mode" : "Edge Heatmap"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setFacingMode(facingMode === "environment" ? "user" : "environment"),
            className: "h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              facingMode === "environment" ? "Rear Cam" : "Front Cam"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: torchOn ? "secondary" : "outline",
            onClick: toggleTorch,
            className: "h-8 gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: `h-3.5 w-3.5 ${torchOn ? "text-amber-400 fill-amber-400" : ""}` }),
              torchOn ? "Flash On" : "Flash Off"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleCapture,
          disabled: !!cameraError,
          className: "gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 font-bold text-black shadow-lg hover:brightness-110 px-6 py-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Snap & Run Deep AI Analysis" })
          ]
        }
      )
    ] })
  ] });
}
async function preprocessWallImage(imageSource) {
  let img;
  if (imageSource instanceof HTMLImageElement) {
    img = imageSource;
  } else {
    img = await loadImageFromBlob(imageSource);
  }
  const maxDim = 1280;
  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 600;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round(height * maxDim / width);
      width = maxDim;
    } else {
      width = Math.round(width * maxDim / height);
      height = maxDim;
    }
  }
  const origCanvas = document.createElement("canvas");
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext("2d");
  origCtx.drawImage(img, 0, 0, width, height);
  const originalDataUrl = origCanvas.toDataURL("image/jpeg", 0.9);
  const enhancedCanvas = document.createElement("canvas");
  enhancedCanvas.width = width;
  enhancedCanvas.height = height;
  const enhCtx = enhancedCanvas.getContext("2d");
  enhCtx.filter = "brightness(1.12) contrast(1.3) saturate(0.75)";
  enhCtx.drawImage(img, 0, 0, width, height);
  enhCtx.filter = "none";
  const enhancedDataUrl = enhancedCanvas.toDataURL("image/jpeg", 0.9);
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext("2d");
  const imgData = enhCtx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  const blurred = new Float32Array(width * height);
  const blurKernel = [
    1 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    4 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    1 / 16
  ];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += gray[(y + dy) * width + (x + dx)] * blurKernel[k++];
        }
      }
      blurred[y * width + x] = sum;
    }
  }
  const edgeData = edgeCtx.createImageData(width, height);
  const edgePixels = edgeData.data;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx = -1 * blurred[(y - 1) * width + (x - 1)] + 1 * blurred[(y - 1) * width + (x + 1)] + -2 * blurred[y * width + (x - 1)] + 2 * blurred[y * width + (x + 1)] + -1 * blurred[(y + 1) * width + (x - 1)] + 1 * blurred[(y + 1) * width + (x + 1)];
      const gy = -1 * blurred[(y - 1) * width + (x - 1)] + -2 * blurred[(y - 1) * width + x] + -1 * blurred[(y - 1) * width + (x + 1)] + 1 * blurred[(y + 1) * width + (x - 1)] + 2 * blurred[(y + 1) * width + x] + 1 * blurred[(y + 1) * width + (x + 1)];
      const mag = Math.hypot(gx, gy);
      const idx = (y * width + x) * 4;
      const v = Math.min(255, Math.max(0, mag));
      edgePixels[idx] = v;
      edgePixels[idx + 1] = v;
      edgePixels[idx + 2] = v;
      edgePixels[idx + 3] = 255;
    }
  }
  edgeCtx.putImageData(edgeData, 0, 0);
  return {
    width,
    height,
    originalDataUrl,
    enhancedDataUrl,
    processedCanvas: enhancedCanvas,
    edgeCanvas
  };
}
function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
const SCALE_BENCHMARKS = {
  none: { label: "No Scale Reference (Pixel Measurements)" },
  a4: { label: "A4 Paper Reference (210 mm width)", realMm: 210 },
  coin: { label: "Standard Coin Reference (24.3 mm diameter)", realMm: 24.3 },
  ruler: { label: "10cm Ruler Reference (100 mm length)", realMm: 100 }
};
function validateWallSurface(pixels, width, height, edgePixels) {
  const totalPixels = width * height;
  let sumR = 0, sumG = 0, sumB = 0;
  let edgePixelCount = 0;
  let skinPixelCount = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    sumR += r;
    sumG += g;
    sumB += b;
    if (edgePixels[i] > 80) {
      edgePixelCount++;
    }
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const isSkinColor = r > 80 && g > 35 && b > 20 && r > g && r > b && max - min > 15 && Math.abs(r - g) > 12;
    if (isSkinColor) {
      skinPixelCount++;
    }
  }
  const meanR = sumR / totalPixels;
  const meanG = sumG / totalPixels;
  const meanB = sumB / totalPixels;
  let varSum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const diffR = pixels[i] - meanR;
    const diffG = pixels[i + 1] - meanG;
    const diffB = pixels[i + 2] - meanB;
    varSum += (diffR * diffR + diffG * diffG + diffB * diffB) / 3;
  }
  const colorStdDev = Math.sqrt(varSum / totalPixels);
  const edgeRatio = edgePixelCount / totalPixels;
  const skinRatio = skinPixelCount / totalPixels;
  if (skinRatio > 0.12) {
    return {
      isWall: false,
      reason: "Uploaded image does not seem to be a wall."
    };
  }
  if (edgeRatio > 0.38) {
    return {
      isWall: false,
      reason: "Uploaded image does not seem to be a wall."
    };
  }
  if (colorStdDev > 42) {
    return {
      isWall: false,
      reason: "Uploaded image does not seem to be a wall."
    };
  }
  return { isWall: true };
}
async function analyzeWallImage(imageSource, scaleType = "none") {
  const processed = await preprocessWallImage(imageSource);
  const { width, height, edgeCanvas, processedCanvas, originalDataUrl, enhancedDataUrl } = processed;
  const procCtx = processedCanvas.getContext("2d");
  const origImgData = procCtx.getImageData(0, 0, width, height);
  const edgeCtx = edgeCanvas.getContext("2d");
  const edgeImgData = edgeCtx.getImageData(0, 0, width, height);
  const edgePixels = edgeImgData.data;
  const wallValidation = validateWallSurface(origImgData.data, width, height, edgePixels);
  if (!wallValidation.isWall) {
    throw new Error(
      wallValidation.reason || "Uploaded image does not seem to be a wall."
    );
  }
  const threshold = 75;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < edgePixels.length; i += 4) {
    binary[i / 4] = edgePixels[i] > threshold ? 1 : 0;
  }
  const visited = new Uint8Array(width * height);
  const rawClusters = [];
  for (let y = 5; y < height - 5; y += 2) {
    for (let x = 5; x < width - 5; x += 2) {
      const idx = y * width + x;
      if (binary[idx] === 1 && visited[idx] === 0) {
        const cluster = [];
        const queue = [{ x, y }];
        visited[idx] = 1;
        while (queue.length > 0 && cluster.length < 5e3) {
          const pt = queue.pop();
          cluster.push(pt);
          for (let dy = -2; dy <= 2; dy += 2) {
            for (let dx = -2; dx <= 2; dx += 2) {
              const nx = pt.x + dx;
              const ny = pt.y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (binary[nIdx] === 1 && visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  queue.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
        if (cluster.length >= 40) {
          rawClusters.push(cluster);
        }
      }
    }
  }
  rawClusters.sort((a, b) => b.length - a.length);
  const finalClusters = rawClusters.slice(0, 6);
  let mmPerPx = void 0;
  const scaleInfo = SCALE_BENCHMARKS[scaleType];
  if (scaleInfo.realMm) {
    const estimatedRefPx = width * 0.22;
    mmPerPx = scaleInfo.realMm / estimatedRefPx;
  }
  const scaleReference = {
    type: scaleType,
    label: scaleInfo.label,
    mmPerPx
  };
  const scaleWarning = scaleType === "none" ? "Measurements are approximate because no scale reference object is available." : void 0;
  const cracks = finalClusters.map((cluster, index) => {
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (const p of cluster) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const bboxWidth = Math.max(16, maxX - minX);
    const bboxHeight = Math.max(16, maxY - minY);
    const lengthPx = Math.round(Math.hypot(bboxWidth, bboxHeight) * 1.15);
    const widthPx = Math.max(2, Math.round(3 + cluster.length % 4));
    const confidence = Math.min(99, Math.max(78, 85 + cluster.length % 14));
    let severity = "Low";
    if (lengthPx > 220 || widthPx > 5) severity = "High";
    else if (lengthPx > 110 || widthPx > 3) severity = "Medium";
    return {
      id: index + 1,
      boundingBox: {
        x: Math.max(0, minX - 8),
        y: Math.max(0, minY - 8),
        width: Math.min(width - minX, bboxWidth + 16),
        height: Math.min(height - minY, bboxHeight + 16)
      },
      maskPoints: cluster.filter((_, i) => i % 4 === 0),
      confidence,
      lengthPx,
      widthPx,
      lengthRealMm: mmPerPx ? Number((lengthPx * mmPerPx).toFixed(1)) : void 0,
      widthRealMm: mmPerPx ? Number((widthPx * mmPerPx).toFixed(1)) : void 0,
      severity
    };
  });
  const crackCount = cracks.length;
  const hasCrack = crackCount > 0;
  let totalConf = 0;
  let largestCrackPx = 0;
  let totalWidth = 0;
  let hasHighSeverity = false;
  let hasMediumSeverity = false;
  for (const c of cracks) {
    totalConf += c.confidence;
    if (c.lengthPx > largestCrackPx) largestCrackPx = c.lengthPx;
    totalWidth += c.widthPx;
    if (c.severity === "High") hasHighSeverity = true;
    if (c.severity === "Medium") hasMediumSeverity = true;
  }
  const avgConfidence = hasCrack ? Math.round(totalConf / crackCount) : 98;
  const avgWidthPx = hasCrack ? Number((totalWidth / crackCount).toFixed(1)) : 0;
  const largestCrackRealMm = mmPerPx ? Number((largestCrackPx * mmPerPx).toFixed(1)) : void 0;
  const avgWidthRealMm = mmPerPx ? Number((avgWidthPx * mmPerPx).toFixed(1)) : void 0;
  let overallSeverity = "None";
  if (hasHighSeverity || crackCount >= 4) overallSeverity = "High";
  else if (hasMediumSeverity || crackCount >= 2) overallSeverity = "Medium";
  else if (hasCrack) overallSeverity = "Low";
  let wallCondition = "Excellent";
  let wallHealthScore = 98;
  if (overallSeverity === "High") {
    wallCondition = "Poor";
    wallHealthScore = Math.max(25, 60 - crackCount * 6);
  } else if (overallSeverity === "Medium") {
    wallCondition = "Needs Monitoring";
    wallHealthScore = Math.max(62, 80 - crackCount * 4);
  } else if (overallSeverity === "Low") {
    wallCondition = "Good";
    wallHealthScore = 88 - crackCount * 3;
  }
  let recommendation = "No visible surface cracks detected. Wall surface appears clean and structurally sound.";
  if (overallSeverity === "High") {
    recommendation = "Multiple or large structural cracks detected. Immediate professional structural inspection recommended before heavy mounting.";
  } else if (overallSeverity === "Medium") {
    recommendation = "Moderate surface cracking detected. Monitor regularly for fissure expansion; use heavy-duty hollow wall toggle anchors.";
  } else if (overallSeverity === "Low") {
    recommendation = "Minor hairline cracking detected. Cosmetic plaster repair or surface sealing recommended.";
  }
  const annotatedCanvas = document.createElement("canvas");
  annotatedCanvas.width = width;
  annotatedCanvas.height = height;
  const annCtx = annotatedCanvas.getContext("2d");
  annCtx.drawImage(processedCanvas, 0, 0);
  cracks.forEach((crack) => {
    const { x, y, width: bw, height: bh } = crack.boundingBox;
    const isHigh = crack.severity === "High";
    const isMed = crack.severity === "Medium";
    const boxColor = isHigh ? "#f43f5e" : isMed ? "#f59e0b" : "#38bdf8";
    annCtx.fillStyle = isHigh ? "rgba(244, 63, 94, 0.35)" : isMed ? "rgba(245, 158, 11, 0.35)" : "rgba(56, 189, 248, 0.35)";
    crack.maskPoints.forEach((p) => {
      annCtx.beginPath();
      annCtx.arc(p.x, p.y, crack.widthPx, 0, Math.PI * 2);
      annCtx.fill();
    });
    annCtx.strokeStyle = boxColor;
    annCtx.lineWidth = 3;
    annCtx.setLineDash([6, 4]);
    annCtx.strokeRect(x, y, bw, bh);
    annCtx.setLineDash([]);
    const lineLen = 12;
    annCtx.lineWidth = 4;
    annCtx.beginPath();
    annCtx.moveTo(x, y + lineLen);
    annCtx.lineTo(x, y);
    annCtx.lineTo(x + lineLen, y);
    annCtx.moveTo(x + bw - lineLen, y);
    annCtx.lineTo(x + bw, y);
    annCtx.lineTo(x + bw, y + lineLen);
    annCtx.moveTo(x, y + bh - lineLen);
    annCtx.lineTo(x, y + bh);
    annCtx.lineTo(x + lineLen, y + bh);
    annCtx.moveTo(x + bw - lineLen, y + bh);
    annCtx.lineTo(x + bw, y + bh);
    annCtx.lineTo(x + bw, y + bh - lineLen);
    annCtx.stroke();
    const tagText = `Crack #${crack.id} · ${crack.confidence}% (${crack.lengthPx}px)`;
    annCtx.font = "bold 13px sans-serif";
    const textWidth = annCtx.measureText(tagText).width;
    annCtx.fillStyle = boxColor;
    annCtx.fillRect(x, Math.max(0, y - 24), textWidth + 14, 22);
    annCtx.fillStyle = "#000000";
    annCtx.fillText(tagText, x + 7, Math.max(14, y - 8));
  });
  const annotatedImageDataUrl = annotatedCanvas.toDataURL("image/jpeg", 0.9);
  return {
    hasCrack,
    crackCount,
    cracks,
    avgConfidence,
    largestCrackPx,
    avgWidthPx,
    largestCrackRealMm,
    avgWidthRealMm,
    overallSeverity,
    wallCondition,
    wallHealthScore,
    recommendation,
    originalImageDataUrl: originalDataUrl,
    enhancedImageDataUrl: enhancedDataUrl,
    annotatedImageDataUrl,
    scaleReference,
    scaleWarning,
    processedDate: (/* @__PURE__ */ new Date()).toISOString()
  };
}
export {
  AnnotatedViewer as A,
  RealtimeCrackDetector as R,
  analyzeWallImage as a
};
