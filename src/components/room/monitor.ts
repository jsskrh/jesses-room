import * as THREE from "three";
import type { RoomNodes } from "./model";

// The monitor's screen is about twice as wide as it is tall.
const SCREEN_ASPECT = 6.378 / 3.15;

// Plays a muted, looping video on the monitor. The screen stays as it is until
// the first frame is ready. With reduced motion, it shows that frame and
// doesn't play. Returns a cleanup function.
export function playOnMonitor(nodes: RoomNodes, src: string) {
  const screen = nodes.monitor?.children[1];
  if (!(screen instanceof THREE.Mesh)) return () => {};

  const video = document.createElement("video");
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src;

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const blank = screen.material;

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const show = () => {
    // Fill the screen, cropping the video's sides or top and bottom.
    const aspect = video.videoWidth / video.videoHeight;
    if (aspect > SCREEN_ASPECT) {
      texture.repeat.set(SCREEN_ASPECT / aspect, 1);
    } else {
      texture.repeat.set(1, aspect / SCREEN_ASPECT);
    }
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
    texture.needsUpdate = true;
    screen.material = material;
  };

  // Paused while the tab is hidden.
  const onVisibility = () => {
    if (still) return;
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  };

  video.addEventListener("loadeddata", show, { once: true });
  document.addEventListener("visibilitychange", onVisibility);
  if (!still) video.play().catch(() => {});

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    video.removeEventListener("loadeddata", show);
    video.pause();
    video.removeAttribute("src");
    video.load();
    screen.material = blank;
    texture.dispose();
    material.dispose();
  };
}
