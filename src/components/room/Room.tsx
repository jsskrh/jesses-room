import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { inRoomMode, leaveRoomMode, setRoomState } from "./mode";
import Scene, { loadRoom } from "./Scene";

if (inRoomMode()) {
  // Tell the head script's watchdog the room's code has arrived.
  setRoomState("booting");

  const preloader = document.querySelector<HTMLElement>(".preloader");
  const label = preloader?.querySelector(".preloader-progress");
  loadRoom(
    (fraction) => {
      if (label) label.textContent = `${Math.round(fraction * 100)}%`;
    },
    Number(preloader?.dataset.modelBytes) || 0,
  ).catch(leaveRoomMode);
}

// If the model or WebGL fails, show the page without the room instead of
// leaving the loader up forever.
class RoomErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("The room failed to load; showing the page without it.", error);
    leaveRoomMode();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Room() {
  if (!inRoomMode()) return null;

  return (
    <RoomErrorBoundary>
      <div className="experience">
        <Canvas
          orthographic
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ near: -50, far: 50, position: [0, 4, 5], rotation: [-Math.PI / 6, 0, 0] }}
          gl={{ antialias: true, toneMapping: THREE.CineonToneMapping, toneMappingExposure: 1.75 }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </RoomErrorBoundary>
  );
}
