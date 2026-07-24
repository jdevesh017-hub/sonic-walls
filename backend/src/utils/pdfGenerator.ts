import PDFDocument from "pdfkit";
import { Response } from "express";

export interface PDFScanReportData {
  id: string;
  userName: string;
  userEmail: string;
  scanDate: Date;
  wallType: "solid" | "hollow" | "cracked";
  label: string;
  confidenceScore: number;
  peakFrequency: number;
  rms: number;
  duration: number;
  recommendation: string;
}

export const generateScanPDFReport = (data: PDFScanReportData, res: Response): void => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="EchoScan-Report-${data.id.substring(0, 8)}.pdf"`
  );

  doc.pipe(res);

  // Color Palette
  const primaryColor = "#0f172a"; // slate-900
  const brandColor = "#0284c7"; // sky-600
  const lightBg = "#f8fafc"; // slate-50
  const borderCol = "#cbd5e1"; // slate-300

  let wallBadgeBg = "#e2e8f0";
  let wallBadgeText = "#334155";
  if (data.wallType === "solid") {
    wallBadgeBg = "#e2e8f0";
    wallBadgeText = "#1e293b";
  } else if (data.wallType === "cracked") {
    wallBadgeBg = "#ffedd5";
    wallBadgeText = "#c2410c";
  } else if (data.wallType === "hollow") {
    wallBadgeBg = "#ccfbf1";
    wallBadgeText = "#0f766e";
  }

  // Header Banner
  doc.rect(40, 40, 515, 60).fill(primaryColor);
  doc
    .fillColor("#ffffff")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("ECHOSCAN DIAGNOSTIC REPORT", 55, 52);
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#94a3b8")
    .text("ACOUSTIC WALL ANALYSIS & STRUCTURAL INSPECTION", 55, 78);

  // Logo Placeholder Badge in Header Right
  doc.rect(440, 52, 100, 36).lineWidth(1).strokeColor("#334155").fill("#1e293b");
  doc.fillColor("#38bdf8").fontSize(10).font("Helvetica-Bold").text("ECHO", 450, 60, { continued: true });
  doc.fillColor("#ffffff").text("SCAN");
  doc.fillColor("#94a3b8").fontSize(7).font("Helvetica").text("VERIFIED INSPECTION", 450, 74);

  let y = 120;

  // Inspection Metadata Box
  doc.rect(40, y, 515, 70).fill(lightBg).strokeColor(borderCol).stroke();
  doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("INSPECTION METADATA", 55, y + 10);

  doc.fontSize(9).font("Helvetica").fillColor("#475569");
  doc.text(`Inspector Name: `, 55, y + 30, { continued: true }).font("Helvetica-Bold").fillColor(primaryColor).text(data.userName);
  doc.font("Helvetica").fillColor("#475569").text(`Inspector Email: `, 55, y + 46, { continued: true }).font("Helvetica-Bold").fillColor(primaryColor).text(data.userEmail);

  doc.font("Helvetica").fillColor("#475569").text(`Report ID: `, 320, y + 30, { continued: true }).font("Helvetica-Bold").fillColor(primaryColor).text(data.id);
  doc.font("Helvetica").fillColor("#475569").text(`Scan Date: `, 320, y + 46, { continued: true }).font("Helvetica-Bold").fillColor(primaryColor).text(new Date(data.scanDate).toLocaleString());

  y += 90;

  // Wall Classification Section
  doc.rect(40, y, 515, 90).fill("#ffffff").strokeColor(borderCol).stroke();
  doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("WALL CLASSIFICATION RESULT", 55, y + 12);

  // Classification Badge
  doc.rect(55, y + 32, 160, 42).fill(wallBadgeBg);
  doc.fillColor(wallBadgeText).fontSize(15).font("Helvetica-Bold").text(data.label.toUpperCase(), 65, y + 46, { width: 140, align: "center" });

  // Confidence Score Box
  doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold").text(`Confidence Score: ${data.confidenceScore}%`, 250, y + 35);

  // Meter Bar
  doc.rect(250, y + 52, 280, 14).fill("#e2e8f0");
  const meterWidth = Math.min(280, Math.max(10, (280 * data.confidenceScore) / 100));
  doc.rect(250, y + 52, meterWidth, 14).fill(brandColor);

  y += 110;

  // Acoustic Signal Characteristics Table
  doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("ACOUSTIC SIGNAL METRICS", 40, y);
  y += 16;

  doc.rect(40, y, 515, 24).fill(primaryColor);
  doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
  doc.text("METRIC", 55, y + 7);
  doc.text("MEASURED VALUE", 240, y + 7);
  doc.text("REFERENCE RANGE", 400, y + 7);

  y += 24;
  const metrics = [
    { name: "Peak Resonant Frequency", val: `${data.peakFrequency.toFixed(1)} Hz`, ref: "<300 Hz Solid, 300-700 Hz Cracked, >700 Hz Hollow" },
    { name: "RMS Volume Level", val: data.rms.toFixed(4), ref: "Normalized FFT Energy Level" },
    { name: "Sample Duration", val: `${data.duration.toFixed(2)} seconds`, ref: "0.5s - 10.0s recording window" },
  ];

  metrics.forEach((m, idx) => {
    const rowBg = idx % 2 === 0 ? lightBg : "#ffffff";
    doc.rect(40, y, 515, 24).fill(rowBg).strokeColor(borderCol).stroke();
    doc.fillColor(primaryColor).fontSize(9).font("Helvetica-Bold").text(m.name, 55, y + 7);
    doc.font("Helvetica").fillColor(brandColor).text(m.val, 240, y + 7);
    doc.fillColor("#64748b").text(m.ref, 400, y + 7);
    y += 24;
  });

  y += 20;

  // Technical Recommendation Box
  doc.rect(40, y, 515, 80).fill("#f0f9ff").strokeColor("#bae6fd").stroke();
  doc.fillColor("#0369a1").fontSize(11).font("Helvetica-Bold").text("TECHNICAL RECOMMENDATION & SAFETY NOTICE", 55, y + 12);
  doc.fillColor("#334155").fontSize(9).font("Helvetica").text(data.recommendation, 55, y + 30, {
    width: 485,
    align: "left",
    lineGap: 4,
  });

  y += 100;

  // Footer Disclaimer
  doc.rect(40, y, 515, 40).fill(lightBg).strokeColor(borderCol).stroke();
  doc
    .fillColor("#64748b")
    .fontSize(8)
    .font("Helvetica")
    .text(
      "Notice: This report was generated automatically using non-destructive Web Audio API spectrum analysis. Results are intended for guidance. Verify structural integrity with appropriate anchors before heavy drilling.",
      50,
      y + 10,
      { width: 495, align: "center" }
    );

  doc.end();
};
