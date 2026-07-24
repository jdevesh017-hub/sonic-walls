import { createFileRoute } from "@tanstack/react-router";
import { ReportView } from "@/components/echo/ReportView";

export const Route = createFileRoute("/report/$id")({
  component: ReportView,
});
