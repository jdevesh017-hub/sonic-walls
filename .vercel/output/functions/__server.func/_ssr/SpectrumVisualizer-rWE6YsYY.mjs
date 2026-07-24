import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
function SpectrumVisualizer({
  spectrum,
  analyser,
  height = 160,
  mode = "line",
  pointCount = 96
}) {
  const canvasRef = reactExports.useRef(null);
  const rafRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const nextWidth = Math.max(1, Math.round(width * dpr));
      const nextHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let data = [];
      if (analyser) {
        if (mode === "waveform") {
          const buf = new Uint8Array(analyser.fftSize);
          analyser.getByteTimeDomainData(buf);
          data = Array.from(buf).map((v) => v / 255);
        } else {
          const buf = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(buf);
          const sampleRate = analyser.context.sampleRate || 48e3;
          const fftSize = analyser.fftSize;
          const bars = pointCount;
          const minHz = 40;
          const maxHz = 3800;
          for (let b = 0; b < bars; b++) {
            const fLow = minHz * Math.pow(maxHz / minHz, b / bars);
            const fHigh = minHz * Math.pow(maxHz / minHz, (b + 1) / bars);
            const binStart = Math.max(0, Math.floor(fLow * fftSize / sampleRate));
            const binEnd = Math.max(binStart + 1, Math.min(buf.length - 1, Math.ceil(fHigh * fftSize / sampleRate)));
            let maxVal = 0;
            for (let i = binStart; i < binEnd; i++) {
              if (buf[i] > maxVal) maxVal = buf[i];
            }
            data.push(maxVal / 255);
          }
        }
      } else if (spectrum && spectrum.length) {
        data = spectrum;
      } else {
        data = new Array(pointCount).fill(0.05);
      }
      const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
      lineGrad.addColorStop(0, "rgba(56, 189, 248, 1)");
      lineGrad.addColorStop(0.5, "rgba(20, 184, 166, 1)");
      lineGrad.addColorStop(1, "rgba(245, 158, 11, 1)");
      const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
      fillGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      fillGrad.addColorStop(0.7, "rgba(20, 184, 166, 0.12)");
      fillGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      if (mode === "waveform" && analyser) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = lineGrad;
        ctx.beginPath();
        const step = W / data.length;
        data.forEach((v, i) => {
          const y = H / 2 + (v - 0.5) * H * 0.9;
          if (i === 0) ctx.moveTo(i * step, y);
          else ctx.lineTo(i * step, y);
        });
        ctx.stroke();
      } else {
        const pointsCount = data.length;
        const step = W / (pointsCount - 1);
        const pts = data.map((v, i) => {
          const val = Math.max(0.02, v);
          return {
            x: i * step,
            y: H - val * H * 0.9 - 6
          };
        });
        ctx.beginPath();
        ctx.moveTo(pts[0].x, H);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pts[pts.length - 1].x, H);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = lineGrad;
        ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
        let peakIdx = 0;
        let maxVal = -1;
        data.forEach((v, i) => {
          if (v > maxVal) {
            maxVal = v;
            peakIdx = i;
          }
        });
        if (pts[peakIdx] && maxVal > 0.05) {
          const peakPt = pts[peakIdx];
          ctx.beginPath();
          ctx.arc(peakPt.x, peakPt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      if (analyser) rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [spectrum, analyser, height, mode, pointCount]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, style: { width: "100%", height }, className: "rounded-lg" });
}
export {
  SpectrumVisualizer as S
};
