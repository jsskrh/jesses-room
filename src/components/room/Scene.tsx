import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { playIntro } from "./intro";
import { prepareRoom } from "./model";

const MODEL_URL = "/models/FinalRoomV7.glb";

// Height of the view in world units, whatever the window size.
const FRUSTUM = 5;

// Uses the decoder files that ship with three.js, bundled by Vite.
const draco = new DRACOLoader();
const withDraco = (loader: GLTFLoader) => {
  loader.setDRACOLoader(draco);
};

// Start downloading the model before the canvas mounts. The canvas waits for
// the tab to be visible, so without this a tab opened in the background only
// starts loading once someone switches to it.
export const preloadRoom = () => useLoader.preload(GLTFLoader, MODEL_URL, withDraco);

// The original site set these colours without colour management, so their
// hex values acted as linear values. Keeping that keeps its look.
const linear = (hex: number) => new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);
const FLOOR_COLOR = linear(0xfbf4e4);
const CIRCLES = [
  { color: linear(0xdb929d), y: -0.39 },
  { color: linear(0x7bd0ad), y: -0.38 },
  { color: linear(0x95abe5), y: -0.37 },
];

const DAY = { color: { r: 1, g: 1, b: 1 }, sun: 3, ambient: 1 };
const NIGHT = {
  color: { r: 0.17254901960784313, g: 0.23137254901960785, b: 0.6862745098039216 },
  sun: 0.78,
  ambient: 0.78,
};

// R3F's orthographic camera works in pixels; zoom it so the view is always
// FRUSTUM units tall, as the original camera was.
function FrustumZoom() {
  const camera = useThree((state) => state.camera);
  const height = useThree((state) => state.size.height);

  useLayoutEffect(() => {
    camera.zoom = height / FRUSTUM;
    camera.updateProjectionMatrix();
  }, [camera, height]);

  return null;
}

export default function Scene() {
  const { scene: room } = useLoader(GLTFLoader, MODEL_URL, withDraco);
  const nodes = useMemo(() => prepareRoom(room), [room]);

  const floor = useRef<THREE.Mesh>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const spin = useRef({ y: 0 });
  const tilt = useRef({ current: 0, target: 0 });

  // Lighting follows the theme class on <html>: set on load, eased on toggle.
  useEffect(() => {
    const root = document.documentElement;
    let dark: boolean | undefined;

    const apply = () => {
      const next = root.classList.contains("dark-theme");
      if (next === dark) return;
      const immediate = dark === undefined;
      dark = next;

      const mood = next ? NIGHT : DAY;
      const run = (target: object, vars: gsap.TweenVars) =>
        immediate ? gsap.set(target, vars) : gsap.to(target, vars);
      run(sun.current.color, mood.color);
      run(ambient.current.color, mood.color);
      run(sun.current, { intensity: mood.sun });
      run(ambient.current, { intensity: mood.ambient });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // The room leans slightly towards the mouse.
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      tilt.current.target = (((event.clientX - innerWidth / 2) * 2) / innerWidth) * 0.1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    const t = tilt.current;
    t.current = THREE.MathUtils.damp(t.current, t.target, 6.3, delta);
    room.rotation.y = spin.current.y + t.current;
  });

  useEffect(
    () => playIntro({ room, nodes, floor: floor.current, spin: spin.current }),
    [room, nodes],
  );

  return (
    <>
      <FrustumZoom />

      <directionalLight
        ref={sun}
        intensity={DAY.sun}
        position={[-1.5, 7, 3]}
        castShadow
        shadow-camera-far={20}
        shadow-mapSize={[2048, 2048]}
        shadow-normalBias={0.05}
      />
      <ambientLight ref={ambient} intensity={DAY.ambient} />

      <primitive object={room} />

      <mesh ref={floor} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={FLOOR_COLOR} side={THREE.BackSide} />
      </mesh>

      {CIRCLES.map(({ color, y }) => (
        <mesh key={y} position-y={y} rotation-x={-Math.PI / 2} scale={0} receiveShadow>
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}
