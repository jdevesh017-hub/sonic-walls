import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/echo/AuthView";

export const Route = createFileRoute("/auth")({
  component: AuthView,
});
