import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraShake, Loader, Environment, OrbitControls, useDetectGPU } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { WindEffect } from "./components/WindEffect";
import { Model } from "./components/Model";
import { World } from "./components/World";
import { Credit } from "./components/Credit";
const Scene = () => {
  const cameraRef = useRef();
  return (
    <>
      <Environment frames={1} path='env' resolution={256} />
      <World />
      <WindEffect />
      <Model />
      <CameraShake yawFrequency={4} pitchFrequency={4} rollFrequency={5} intensity={0.3} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[-0.15, -2, 0]} intensity={2} />
      <OrbitControls ref={cameraRef} makeDefault />
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.5} intensity={1.2} mipmapBlur />
        <Vignette offset={0.5} darkness={0.5} />
      </EffectComposer>
    </>
  );
};

const App = () => {
  const GPUTier = useDetectGPU();
  let dpr = GPUTier.isMobile ? 0.7 : 1;
  return (
    <>
      <Canvas dpr={dpr} camera={{ fov: 70, position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Credit />
      <Loader />
    </>
  );
};

export default App;
