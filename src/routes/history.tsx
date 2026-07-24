import { createFileRoute } from "@tanstack/react-router";
import { HistoryView } from "@/components/echo/HistoryView";

export const Route = createFileRoute("/history")({
  component: HistoryView,
});
