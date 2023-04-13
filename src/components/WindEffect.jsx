import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import { AdditiveBlending, DoubleSide, MathUtils } from "three";
import { Vector3 } from "three";

function WindShape() {
  const ref = useRef();
  const state = useThree();
  const { height: viewPortHeight } = state.viewport.getCurrentViewport();
  const v3 = new Vector3();
  const randomPosition = {
    x: MathUtils.randFloatSpread(8),
    y: MathUtils.randFloatSpread(5),
    z: MathUtils.randFloatSpread(8),
  };
  const randomSpeed = MathUtils.randFloat(0.05, 0.5);
  useFrame(({ camera }) => {
    if (ref.current) {
      const { current: el } = ref;
      const { height: elHeight } = el.instance.current.geometry.parameters;
      const { y: elPosition } = el.position;
      const worldPosition = el.getWorldPosition(v3);
      const limitPos = viewPortHeight - (worldPosition.y + elHeight / 2);
      if (limitPos < 0) {
        el.position.y = -(viewPortHeight + elHeight / 2);
      }
      el.position.y += randomSpeed;
      el.rotation.y = camera.rotation.y;
    }
  });
  return <Instance ref={ref} color='white' position={[randomPosition.x, randomPosition.y, randomPosition.z]} />;
}

export const WindEffect = () => {
  const INSTANCE = {
    number: 130,
  };
  return (
    <group>
      <Instances>
        <planeGeometry args={[0.0135, 1.2]} />
        <meshBasicMaterial side={DoubleSide} blending={AdditiveBlending} opacity={0.15} transparent />
        {Array(INSTANCE.number)
          .fill()
          .map((_, key) => (
            <WindShape key={key} />
          ))}
      </Instances>
    </group>
  );
};
