import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraShake, Loader, Environment, OrbitControls, Sphere, useAnimations, useGLTF, useHelper, useTexture } from "@react-three/drei";
import { AdditiveBlending, BackSide, Color, DirectionalLightHelper, DoubleSide, NearestFilter } from "three";
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { WindEffect } from "./components/WindEffect";
const Scene = () => {
  const cameraRef = useRef();
  const { nodes, animations } = useGLTF("skydiver.glb");
  const { ref, actions, names } = useAnimations(animations);
  const { mixamorigHips, skydiver_2: skydiver } = nodes;

  const [
    skyTexture,
    skyDiverTextureBaseColor,
    skyDiverTextureRoughness,
    skyDiverTextureMetallic,
    skyDiverTextureNormal,
    skyDiverTextureClothes,
  ] = useTexture(
    [
      "sky-texture.jpg",
      "texture/skydiver_BaseColor.webp",
      "texture/skydiver_Roughness.webp",
      "texture/skydiver_Metallic.webp",
      "texture/skydiver_Normal.webp",
      "texture/skydiver_Clothes.webp",
    ],
    ([texture, baseColor, roughness, metallic, normal, clothes]) => {
      baseColor.flipY = roughness.flipY = metallic.flipY = normal.flipY = clothes.flipY = false;
    }
  );

  const onBeforeCompile = shader => {
    Object.assign(shader.uniforms, { ...skydiver.material.uniforms });
    shader.vertexShader = `
    uniform float uTime;
    uniform sampler2D uClothes;
    ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `
      vec3 clothesTexture = vec3(texture2D(uClothes, vUv));
      float circleTime = 2.0;
      float amplitude = 30.0;
      float circleTimeParam = mod(uTime, circleTime);
      vec3 transformed = vec3( position );
      transformed.y += min(clothesTexture.y * sin( circleTimeParam * amplitude * (PI  / circleTime)) * 0.025, 0.5);
    `
    );
  };
  useEffect(() => {
    actions[names[0]].setEffectiveTimeScale(0.85);
    actions[names[0]].play();
  }, [actions, names]);
  useEffect(() => {
    skydiver.material.uniforms = {
      uTime: { value: 0 },
      uClothes: { value: skyDiverTextureClothes },
    };
  }, []);
  useFrame(({ clock }) => {
    if (skydiver.material.uniforms?.uTime) {
      skydiver.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  const lightRef = useRef();
  //useHelper(lightRef, DirectionalLightHelper, 1, "red");
  return (
    <>
      <Environment path='env' />
      <Sphere args={[5, 60, 60]}>
        <meshBasicMaterial map={skyTexture} side={BackSide} />
      </Sphere>
      <group ref={ref}>
        <group>
          <primitive object={mixamorigHips} />
          <skinnedMesh geometry={skydiver.geometry} skeleton={skydiver.skeleton}>
            <meshStandardMaterial
              side={DoubleSide}
              map={skyDiverTextureBaseColor}
              roughnessMap={skyDiverTextureRoughness}
              metalnessMap={skyDiverTextureMetallic}
              normalMap={skyDiverTextureNormal}
              normalScale={[-0.2, 0.2]}
              envMapIntensity={0.535}
              onBeforeCompile={onBeforeCompile}
              uniforms={{ uTime: { value: 0 } }}
            />
          </skinnedMesh>
        </group>
      </group>
      <WindEffect />
      <CameraShake yawFrequency={4} pitchFrequency={4} rollFrequency={5} intensity={0.3} />
      <ambientLight intensity={0.4} />
      <directionalLight   ref={lightRef} position={[-0.15, -2, 0]} intensity={3} />
      <OrbitControls ref={cameraRef} makeDefault />
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} radius={0.9} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
        <Vignette eskil={false} offset={0.5} darkness={0.5} />
      </EffectComposer>
    </>
  );
};

const App = () => {
  return (
    <>
      <Canvas camera={{ fov: 70, position: [0, 0, 3] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
};

export default App;
