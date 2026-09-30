import { use, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { setupBooks, type Bookshelf } from "./books";
import { addCovers } from "./covers";
import { playIntro } from "./intro";
import { prepareRoom } from "./model";
import { playOnMonitor, type MonitorClip } from "./monitor";
import { setupScroll } from "./scroll";
import { arrivalSpot, clearSpot, rememberSpotOnLeaving } from "./spot";

const MODEL_URL = "/models/room.glb";

// Height of the view in world units, whatever the window size.
const FRUSTUM = 5;

// Uses the decoder files that ship with three.js, bundled by Vite.
const draco = new DRACOLoader();

// The model downloads once, as soon as the room's code loads: the canvas
// waits for the tab to be visible, so a tab opened in the background would
// otherwise only start loading when someone switches to it.
// `onProgress` gets 0..1. The download may be compressed, so progress is
// measured against the model's real size (`bytes`), not the response's.
let request: Promise<GLTF> | undefined;
export function loadRoom(onProgress?: (fraction: number) => void, bytes = 0) {
  request ??= new GLTFLoader().setDRACOLoader(draco).loadAsync(MODEL_URL, (event) => {
    const total = bytes || event.total;
    if (total) onProgress?.(Math.min(event.loaded / total, 1));
  });
  return request;
}

// The original site set these colours without colour management, so their
// hex values acted as linear values. Keeping that keeps its look.
const linear = (hex: number) => new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);
const FLOOR_COLOR = linear(0xfbf4e4);
const CIRCLES = [
  { color: linear(0xdb929d), y: -0.39 },
  { color: linear(0x7bd0ad), y: -0.38 },
  { color: linear(0x95abe5), y: -0.37 },
];

// The shelf and the books on it. While a book is out, clicking any of them
// opens that book at its case study.
const SHELF = /^(book_shelf|_?project\d*)$/;

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

interface SceneProps {
  // What plays on the monitor.
  monitor?: MonitorClip;
}

export default function Scene({ monitor }: SceneProps) {
  const { scene: room } = use(loadRoom());
  const nodes = useMemo(() => prepareRoom(room), [room]);
  const camera = useThree((state) => state.camera) as THREE.OrthographicCamera;
  const canvas = useThree((state) => state.gl.domElement);

  const plane = useRef<THREE.Mesh>(null!);
  const circles = useRef<THREE.Mesh[]>([]);
  const shelf = useRef<Bookshelf | null>(null);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const spin = useRef({ y: 0 });
  const tilt = useRef({ current: 0, target: 0 });
  const [settled, setSettled] = useState(false);
  const onMonitor = useRef<ReturnType<typeof playOnMonitor> | null>(null);

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
    onMonitor.current?.render(camera);
  });

  useEffect(() => addCovers(nodes), [nodes]);
  useEffect(() => rememberSpotOnLeaving(), []);

  // Intro first; once the page can scroll, the scroll story and the books,
  // then the monitor. Coming back from another page, straight to the spot
  // that was left.
  useEffect(() => {
    const spot = arrivalSpot();
    let scroll: ReturnType<typeof setupScroll> | undefined;
    const stopIntro = playIntro(
      { room, nodes, plane: plane.current, spin: spin.current },
      {
        skip: Boolean(spot),
        onUnlock: () => {
          const story = setupScroll({ room, nodes, camera, circles: circles.current });
          scroll = story;
          shelf.current = setupBooks({ nodes, room, camera, canvas, holdScroll: story.hold });
          if (spot) {
            scroll.jumpTo(spot);
            clearSpot();
          }
        },
        onSettled: () => {
          scroll?.startStory({ immediate: Boolean(spot) });
          setSettled(true);
        },
      },
    );
    return () => {
      stopIntro();
      scroll?.cleanup();
      shelf.current?.cleanup();
      shelf.current = null;
    };
  }, [room, nodes, camera, canvas]);

  // The monitor's video loads once the room has settled after the intro.
  // With reduced motion, the screen stays dark rather than play on its own.
  useEffect(() => {
    const layer = canvas.closest(".experience")?.querySelector<HTMLElement>(".monitor-layer");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!settled || !monitor || !layer || reducedMotion) return;
    const playing = playOnMonitor(nodes, monitor, { layer, canvas });
    onMonitor.current = playing;
    return () => {
      playing.stop();
      onMonitor.current = null;
    };
  }, [settled, monitor, nodes, canvas]);

  // Dev server only: a handle for inspecting (and rendering) the scene from
  // the console.
  const getState = useThree((state) => state.get);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const { gl, scene } = getState();
    Object.assign(window, { __room: { room, nodes, camera, gsap, gl, scene, playOnMonitor } });
  }, [room, nodes, camera, getState]);

  const onShelf = (object: THREE.Object3D) => {
    let node = object;
    while (node.parent && node.parent !== room) node = node.parent;
    return SHELF.test(node.name.toLowerCase());
  };

  // R3F calls these once per object along the pointer ray, nearest first.
  // Only the nearest counts: stop before the walls behind it get a say.
  const openBook = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const project = shelf.current?.current();
    if (project && onShelf(event.object)) shelf.current?.read(project);
  };

  const pointAt = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const clickable = Boolean(shelf.current?.current()) && onShelf(event.object);
    document.body.style.cursor = clickable ? "pointer" : "";
  };

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

      <primitive
        object={room}
        onClick={openBook}
        onPointerMove={pointAt}
        onPointerOut={() => (document.body.style.cursor = "")}
      />

      <mesh ref={plane} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={FLOOR_COLOR} side={THREE.BackSide} />
      </mesh>

      {CIRCLES.map(({ color, y }, i) => (
        <mesh
          key={y}
          ref={(mesh) => {
            if (mesh) circles.current[i] = mesh;
          }}
          position-y={y}
          rotation-x={-Math.PI / 2}
          scale={0}
          receiveShadow
        >
          <circleGeometry args={[5, 64]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}
