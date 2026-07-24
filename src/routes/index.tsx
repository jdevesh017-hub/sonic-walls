import { createFileRoute } from "@tanstack/react-router";
import { LandingHero } from "@/components/echo/LandingHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Echo Scan — See Through Walls With Sound" },
      {
        name: "description",
        content:
          "Echo Scan uses acoustic analysis to detect solid, cracked, or hollow walls — all privately in your browser.",
      },
      { property: "og:title", content: "Echo Scan — See Through Walls With Sound" },
      {
        property: "og:description",
        content: "In-browser acoustic wall detection powered by the Web Audio API.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <LandingHero />;
}
