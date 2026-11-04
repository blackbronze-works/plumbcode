"use client";

import { useTheme } from "next-themes";
import LightRays from "@/components/LightRays";
import { motion } from "framer-motion";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,var(--brand-glow),transparent_72%)] opacity-80" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.0 }}
          className="absolute inset-0 z-[-1]"
        >
          <LightRays
            className=""
            raysOrigin="top-center"
            raysColor={isLight ? "#0f766e" : "#34d399"}
            raysSpeed={1.5}
            lightSpread={0.5}
            rayLength={3}
            glow={isLight ? 0.35 : 0.6}
            haze={0.25}
            followMouse={false}
            mouseInfluence={0.1}
            rayDensity={1}
            tilt={0}
            raySharpness={0.35}
            atmosphere={1}
            intensity={isLight ? 0.7 : 1}
            fadeDistance={0.8}
            saturation={isLight ? 0.85 : 1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
            cursorShadow
            clickPulse
            intro
            lightMode={isLight}
          />
          <div className="absolute bottom-0 left-0 h-[30%] w-full bg-linear-to-t from-white to-transparent dark:from-black" />
        </motion.div>
      </div>
      {children}
    </>
  );
};

export default Layout;
