export type WallType = "solid" | "cracked" | "hollow";

export interface AnalysisResult {
  wallType: WallType;
  label: string;
  recommendation: string;
  peakFrequency: number;
  rms: number;
  duration: number;
  confidence: number; // 0-100
  spectrum: number[]; // normalized 0-1
}

export function classifyWall(peakHz: number): { wallType: WallType; label: string; recommendation: string } {
  if (peakHz < 300) {
    return {
      wallType: "solid",
      label: "Solid Wall",
      recommendation:
        "Low-frequency dominance suggests a dense, solid structure. Safe to mount heavy fixtures; use masonry anchors.",
    };
  }
  if (peakHz <= 700) {
    return {
      wallType: "cracked",
      label: "Cracked Wall",
      recommendation:
        "Mid-frequency response indicates possible internal cracks or weakened material. Inspect closely before drilling.",
    };
  }
  return {
    wallType: "hollow",
    label: "Hollow Wall",
    recommendation:
      "High-frequency resonance suggests a hollow cavity (drywall or plaster). Use anchors or locate studs before mounting.",
  };
}

export async function analyzeAudioBuffer(buffer: AudioBuffer): Promise<AnalysisResult> {
  const sampleRate = buffer.sampleRate;
  const channel = buffer.getChannelData(0);
  const duration = buffer.duration;

  // RMS
  let sumSq = 0;
  for (let i = 0; i < channel.length; i++) sumSq += channel[i] * channel[i];
  const rms = Math.sqrt(sumSq / channel.length);

  // FFT via OfflineAudioContext + AnalyserNode
  const fftSize = 4096;
  const offline = new OfflineAudioContext(1, Math.max(fftSize, channel.length), sampleRate);
  const src = offline.createBufferSource();
  src.buffer = buffer;
  const analyser = offline.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0;
  src.connect(analyser);
  analyser.connect(offline.destination);
  src.start();
  await offline.startRendering();

  const freqData = new Float32Array(analyser.frequencyBinCount);
  analyser.getFloatFrequencyData(freqData);

  // Convert dB to linear magnitudes
  const mags = new Float32Array(freqData.length);
  for (let i = 0; i < freqData.length; i++) {
    mags[i] = Math.pow(10, freqData[i] / 20);
  }

  // Find peak bin (skip DC)
  let peakIdx = 1;
  let peakVal = 0;
  for (let i = 1; i < mags.length; i++) {
    if (mags[i] > peakVal) {
      peakVal = mags[i];
      peakIdx = i;
    }
  }
  const peakFrequency = (peakIdx * sampleRate) / fftSize;

  // Confidence: how dominant is the peak vs average
  let total = 0;
  for (let i = 1; i < mags.length; i++) total += mags[i];
  const avg = total / (mags.length - 1);
  const ratio = peakVal / (avg || 1e-9);
  const confidence = Math.min(100, Math.max(35, Math.round(40 + Math.log10(ratio) * 25)));

  // Downsampled spectrum for visualization (64 bars), focus on 0-4kHz
  const bars = 64;
  const maxHz = 4000;
  const maxBin = Math.min(mags.length - 1, Math.floor((maxHz * fftSize) / sampleRate));
  const spectrum: number[] = [];
  const binsPerBar = Math.max(1, Math.floor(maxBin / bars));
  let globalMax = 0;
  for (let b = 0; b < bars; b++) {
    let m = 0;
    for (let i = 0; i < binsPerBar; i++) {
      const idx = b * binsPerBar + i;
      if (idx < maxBin) m = Math.max(m, mags[idx]);
    }
    spectrum.push(m);
    if (m > globalMax) globalMax = m;
  }
  for (let i = 0; i < spectrum.length; i++) spectrum[i] = globalMax ? spectrum[i] / globalMax : 0;

  const { wallType, label, recommendation } = classifyWall(peakFrequency);
  return { wallType, label, recommendation, peakFrequency, rms, duration, confidence, spectrum };
}

export async function decodeFile(file: File): Promise<AudioBuffer> {
  const arrayBuf = await file.arrayBuffer();
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buf = await ctx.decodeAudioData(arrayBuf.slice(0));
  await ctx.close();
  return buf;
}

export async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buf = await ctx.decodeAudioData(arrayBuf.slice(0));
  await ctx.close();
  return buf;
}
