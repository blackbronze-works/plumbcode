import LightRays from "../LightRays";

const Hero = () => {
  return (
    <div className="flex-center min-h-screen relative">
      <div className="z-[-1] absolute inset-0">
        <LightRays
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
          fadeDistance={1}
          saturation={1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          cursorShadow
          clickPulse
          intro
          lightMode={false}
        />
      </div>
      <div className="text-6xl font-barabara">Hero</div>
    </div>
  );
};

export default Hero;
