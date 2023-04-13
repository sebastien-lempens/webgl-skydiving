import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { DoubleSide } from "three";
export const Model = () => {
  const [skyDiverTextureBaseColor, skyDiverTextureRoughness, skyDiverTextureMetallic, skyDiverTextureNormal, skyDiverTextureClothes] =
    useTexture(
      [
        "texture/skydiver_BaseColor.webp",
        "texture/skydiver_Roughness.webp",
        "texture/skydiver_Metallic.webp",
        "texture/skydiver_Normal.webp",
        "texture/skydiver_Clothes.webp",
      ],
      ([baseColor, roughness, metallic, normal, clothes]) => {
        baseColor.flipY = roughness.flipY = metallic.flipY = normal.flipY = clothes.flipY = false;
      }
    );
  const test = useGLTF("/skydiver.glb");
  const { nodes, animations, scene } = useGLTF("/skydiver.glb");
  const { ref, actions, names } = useAnimations(animations, scene);
  const { mixamorigHips, skydiver_2: skydiver } = nodes;
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
    actions["animation_0"].reset().play();
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
  return (
    <group dispose={null}>
      <group ref={ref}>
        <primitive object={mixamorigHips} />
        <skinnedMesh geometry={skydiver.geometry} skeleton={skydiver.skeleton}>
          <meshStandardMaterial
            side={DoubleSide}
            map={skyDiverTextureBaseColor}
            roughnessMap={skyDiverTextureRoughness}
            metalnessMap={skyDiverTextureMetallic}
            normalMap={skyDiverTextureNormal}
            normalScale={[-0.2, 0.2]}
            envMapIntensity={0.8}
            toneMapped={false}
            onBeforeCompile={onBeforeCompile}
            uniforms={{ uTime: { value: 0 } }}
          />
        </skinnedMesh>
      </group>
    </group>
  );
};
