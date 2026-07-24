import { createFileRoute } from "@tanstack/react-router";
import { VisualScan } from "@/components/vision/VisualScan";

export const Route = createFileRoute("/visual-scan")({
  component: VisualScan,
});
