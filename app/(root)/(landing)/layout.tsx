"use client";

import LightRays from "@/components/LightRays";
import { motion } from "framer-motion";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="absolute inset-0 z-[-1]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.0 }}
          className="absolute inset-0 z-[-1]"
        >
          <LightRays
            className=""
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1.5}
            lightSpread={0.5}
            rayLength={3}
            glow={0.6}
            haze={0.25}
            followMouse={false}
            mouseInfluence={0.1}
            rayDensity={1}
            tilt={0}
            raySharpness={0.35}
            atmosphere={1}
            intensity={1}
            fadeDistance={0.8}
            saturation={1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
            cursorShadow
            clickPulse
            intro
            lightMode={false}
          />
          <div className="absolute bottom-0 left-0 h-[30%] w-full bg-linear-to-t from-white to-transparent dark:from-black" />
        </motion.div>
      </div>
      {children}
    </>
  );
};

export default Layout;
