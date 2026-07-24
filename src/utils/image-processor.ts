export interface ProcessedImageResult {
  width: number;
  height: number;
  originalDataUrl: string;
  enhancedDataUrl: string;
  processedCanvas: HTMLCanvasElement;
  edgeCanvas: HTMLCanvasElement;
}

export async function preprocessWallImage(imageSource: HTMLImageElement | File | Blob): Promise<ProcessedImageResult> {
  let img: HTMLImageElement;

  if (imageSource instanceof HTMLImageElement) {
    img = imageSource;
  } else {
    img = await loadImageFromBlob(imageSource);
  }

  // 1. Resize Image (Max 1280px max dimension to ensure fast browser computer vision)
  const maxDim = 1280;
  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 600;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  // Original Canvas
  const origCanvas = document.createElement("canvas");
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext("2d")!;
  origCtx.drawImage(img, 0, 0, width, height);
  const originalDataUrl = origCanvas.toDataURL("image/jpeg", 0.9);

  // 2. Enhanced Canvas: Brightness & Contrast Adjustment + Saturation Normalization
  const enhancedCanvas = document.createElement("canvas");
  enhancedCanvas.width = width;
  enhancedCanvas.height = height;
  const enhCtx = enhancedCanvas.getContext("2d")!;

  enhCtx.filter = "brightness(1.12) contrast(1.3) saturate(0.75)";
  enhCtx.drawImage(img, 0, 0, width, height);
  enhCtx.filter = "none";

  const enhancedDataUrl = enhancedCanvas.toDataURL("image/jpeg", 0.9);

  // 3. Edge Enhancement Canvas (Sobel Edge Derivative for Crack Feature Detection)
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = width;
  edgeCanvas.height = height;
  const edgeCtx = edgeCanvas.getContext("2d")!;

  const imgData = enhCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Grayscale & Noise Reduction
  const gray = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // 3x3 Gaussian Blur Noise Reduction
  const blurred = new Float32Array(width * height);
  const blurKernel = [
    1 / 16, 2 / 16, 1 / 16,
    2 / 16, 4 / 16, 2 / 16,
    1 / 16, 2 / 16, 1 / 16,
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

  // Sobel Operator for Edge Magnitude Extraction
  const edgeData = edgeCtx.createImageData(width, height);
  const edgePixels = edgeData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -1 * blurred[(y - 1) * width + (x - 1)] +
        1 * blurred[(y - 1) * width + (x + 1)] +
        -2 * blurred[y * width + (x - 1)] +
        2 * blurred[y * width + (x + 1)] +
        -1 * blurred[(y + 1) * width + (x - 1)] +
        1 * blurred[(y + 1) * width + (x + 1)];

      const gy =
        -1 * blurred[(y - 1) * width + (x - 1)] +
        -2 * blurred[(y - 1) * width + x] +
        -1 * blurred[(y - 1) * width + (x + 1)] +
        1 * blurred[(y + 1) * width + (x - 1)] +
        2 * blurred[(y + 1) * width + x] +
        1 * blurred[(y + 1) * width + (x + 1)];

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
    edgeCanvas,
  };
}

function loadImageFromBlob(blob: Blob | File): Promise<HTMLImageElement> {
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
