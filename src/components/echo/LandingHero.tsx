import { motion } from "framer-motion";
import { ArrowRight, Waves, Sparkles, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LandingHero() {
  return (
    <div className="landing-root">
      {/* Background image layer */}
      <div
        className="landing-bg"
        style={{ backgroundImage: "url('/wall-bg.png')" }}
      />
      {/* Gradient overlay for readability */}
      <div className="landing-overlay" />
      {/* Animated aurora blobs */}
      <div className="landing-aurora" aria-hidden>
        <div className="aurora-blob aurora-blob--cyan" />
        <div className="aurora-blob aurora-blob--purple" />
        <div className="aurora-blob aurora-blob--pink" />
      </div>

      {/* Content */}
      <div className="landing-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="landing-badge"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Acoustic Intelligence
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="landing-heading"
        >
          <span className="text-gradient-brand">Echo</span>Scan
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="landing-subtitle"
        >
          Record or play acoustic sound near a wall — Echo Scan listens to the reverb and
          tells you if it's solid, cracked, or hollow. All analysis runs
          privately in your browser.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 160 }}
          className="landing-cta-wrapper"
        >
          <Link to="/scan" id="get-started-btn" className="landing-cta">
            Get Started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="landing-features"
        >
          <FeatureChip icon={<Waves className="h-4 w-4" />} text="Echo Analysis" />
          <FeatureChip icon={<Zap className="h-4 w-4" />} text="Instant Results" />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="landing-scroll-hint"
        aria-hidden
      >
        <div className="scroll-indicator" />
      </motion.div>
    </div>
  );
}

function FeatureChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="feature-chip">
      <span className="feature-chip-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
