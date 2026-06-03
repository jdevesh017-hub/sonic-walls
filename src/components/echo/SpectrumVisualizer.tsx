import { useEffect, useRef } from "react";

interface Props {
  /** Static spectrum (0-1) or null when using live analyser */
  spectrum?: number[] | null;
  /** Live analyser node for real-time rendering */
  analyser?: AnalyserNode | null;
  height?: number;
  mode?: "bars" | "waveform";
}

export function SpectrumVisualizer({ spectrum, analyser, height = 160, mode = "bars" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let data: number[] = [];
      if (analyser) {
        if (mode === "waveform") {
          const buf = new Uint8Array(analyser.fftSize);
          analyser.getByteTimeDomainData(buf);
          data = Array.from(buf).map((v) => v / 255);
        } else {
          const buf = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(buf);
          // downsample to ~64 bars over first half of bins
          const bars = 64;
          const slice = Math.floor(buf.length * 0.5);
          const per = Math.max(1, Math.floor(slice / bars));
          for (let b = 0; b < bars; b++) {
            let m = 0;
            for (let i = 0; i < per; i++) m = Math.max(m, buf[b * per + i] || 0);
            data.push(m / 255);
          }
        }
      } else if (spectrum && spectrum.length) {
        data = spectrum;
      }

      const grad = ctx.createLinearGradient(0, H, 0, 0);
      grad.addColorStop(0, "oklch(0.82 0.18 200)");
      grad.addColorStop(1, "oklch(0.68 0.24 305)");

      if (mode === "waveform" && analyser) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = grad;
        ctx.beginPath();
        const step = W / data.length;
        data.forEach((v, i) => {
          const y = H / 2 + (v - 0.5) * H * 0.9;
          if (i === 0) ctx.moveTo(i * step, y);
          else ctx.lineTo(i * step, y);
        });
        ctx.stroke();
      } else {
        const bars = data.length || 64;
        const gap = 2;
        const barW = Math.max(2, W / bars - gap);
        for (let i = 0; i < bars; i++) {
          const v = data[i] || 0;
          const h = Math.max(2, v * H * 0.95);
          const x = i * (barW + gap);
          ctx.fillStyle = grad;
          ctx.shadowColor = "oklch(0.82 0.18 200 / 0.6)";
          ctx.shadowBlur = 8;
          ctx.fillRect(x, H - h, barW, h);
        }
        ctx.shadowBlur = 0;
      }

      if (analyser) rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [spectrum, analyser, height, mode]);

  return <canvas ref={canvasRef} style={{ width: "100%", height }} className="rounded-lg" />;
}
