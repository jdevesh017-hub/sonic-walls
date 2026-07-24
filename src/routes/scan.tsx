import { createFileRoute } from "@tanstack/react-router";
import { EchoScan } from "@/components/echo/EchoScan";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Echo Scan — Acoustic Wall Detection" },
      {
        name: "description",
        content:
          "Upload or record a sound and Echo Scan analyzes its echo signature to detect solid, cracked, or hollow walls.",
      },
      { property: "og:title", content: "Echo Scan — Acoustic Wall Detection" },
      {
        property: "og:description",
        content: "In-browser audio analysis that classifies walls from their echo.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  return (
    <main className="min-h-screen">
      <EchoScan />
    </main>
  );
}
