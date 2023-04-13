import { useTexture } from "@react-three/drei";
import { Sphere } from "@react-three/drei";
import { BackSide } from "three";
export const World = () => {
  const skyTexture = useTexture("sky-texture.jpg");
  return (
    <Sphere args={[5, 60, 60]}>
      <meshBasicMaterial toneMapped={false} map={skyTexture} side={BackSide} />
    </Sphere>
  );
};
