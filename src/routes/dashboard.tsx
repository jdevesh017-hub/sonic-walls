import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/echo/DashboardView";

export const Route = createFileRoute("/dashboard")({
  component: DashboardView,
});
