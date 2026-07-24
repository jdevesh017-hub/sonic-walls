import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { S as Sparkles, d as ArrowRight, W as Waves, Z as Zap } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function LandingHero() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "landing-bg",
        style: { backgroundImage: "url('/wall-bg.png')" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "landing-overlay" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-aurora", "aria-hidden": true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aurora-blob aurora-blob--cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aurora-blob aurora-blob--purple" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aurora-blob aurora-blob--pink" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "landing-content", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 },
          className: "landing-badge",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
            "Acoustic Intelligence"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.h1,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.1 },
          className: "landing-heading",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "Echo" }),
            "Scan"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.p,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.25 },
          className: "landing-subtitle",
          children: "Record or play acoustic sound near a wall — Echo Scan listens to the reverb and tells you if it's solid, cracked, or hollow. All analysis runs privately in your browser."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, scale: 0.92 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, delay: 0.4, type: "spring", stiffness: 160 },
          className: "landing-cta-wrapper",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/scan", id: "get-started-btn", className: "landing-cta", children: [
            "Get Started",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5 transition-transform group-hover:translate-x-1" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.55 },
          className: "landing-features",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "h-4 w-4" }), text: "Echo Analysis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureChip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }), text: "Instant Results" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 0.5 },
        transition: { delay: 1.2, duration: 1 },
        className: "landing-scroll-hint",
        "aria-hidden": true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scroll-indicator" })
      }
    )
  ] });
}
function FeatureChip({ icon, text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-chip", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "feature-chip-icon", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: text })
  ] });
}
function Index() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LandingHero, {});
}
export {
  Index as component
};
