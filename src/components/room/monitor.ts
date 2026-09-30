import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import type { RoomNodes } from "./model";

// A YouTube clip playing on the monitor, muted and looping between two
// points. A cross-origin player can't be drawn into WebGL, so it sits in a
// layer behind the canvas, turned and sized to match the screen, and the
// screen is drawn as a hole to see it through. Anything in front of the
// monitor still hides it.

export interface MonitorClip {
  youtube: string;
  // Seconds into the video.
  from: number;
  to: number;
}

const PLAYER = "https://www.youtube-nocookie.com";
// The screen quad in the monitor's space: facing +x, 6.378 wide along z and
// 3.15 tall along y.
const SCREEN = { x: 0.095, width: 6.378, height: 3.15 };
// The player's size on the page before it's scaled down onto the screen.
const PIXELS = 640;

export function playOnMonitor(
  nodes: RoomNodes,
  clip: MonitorClip,
  { layer, canvas }: { layer: HTMLElement; canvas: HTMLCanvasElement },
) {
  const screen = nodes.monitor?.children[1];
  if (!(screen instanceof THREE.Mesh)) return { render() {}, stop() {} };

  const iframe = document.createElement("iframe");
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    disablekb: "1",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
    start: String(clip.from),
    end: String(clip.to),
    enablejsapi: "1",
    origin: location.origin,
  });
  iframe.src = `${PLAYER}/embed/${clip.youtube}?${params}`;
  iframe.title = "Video playing on the monitor";
  iframe.allow = "autoplay; encrypted-media";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  iframe.width = String(PIXELS);
  iframe.height = String(Math.round((PIXELS * SCREEN.height) / SCREEN.width));
  iframe.className = "monitor-player";

  const renderer = new CSS3DRenderer({ element: layer });
  const scene = new THREE.Scene();
  const player = new CSS3DObject(iframe);
  player.matrixAutoUpdate = false;
  scene.add(player);

  // From the screen's space to the player's: face +x, reading along -z with
  // y up, just in front of the screen, at the screen's size.
  const onScreen = new THREE.Matrix4()
    .makeTranslation(SCREEN.x + 0.001, 0, 0)
    .multiply(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, 0, -1),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0, 0),
      ),
    )
    .multiply(new THREE.Matrix4().makeScale(SCREEN.width / PIXELS, SCREEN.width / PIXELS, 1));

  const blank = screen.material;
  const hole = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, blending: THREE.NoBlending });
  screen.material = hole;

  // Loops from `to` back to `from`. The player reports its state once told
  // someone is listening; state 0 means it reached the end.
  const post = (message: object) => iframe.contentWindow?.postMessage(JSON.stringify(message), PLAYER);
  const onLoad = () => post({ event: "listening", id: 1, channel: "widget" });
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== PLAYER || event.source !== iframe.contentWindow) return;
    let data: { event?: string; info?: unknown } | undefined;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }
    const state =
      data?.event === "onStateChange"
        ? data.info
        : data?.event === "infoDelivery"
          ? (data.info as { playerState?: number } | undefined)?.playerState
          : undefined;
    if (state === 0) {
      post({ event: "command", func: "seekTo", args: [clip.from, true] });
      post({ event: "command", func: "playVideo", args: [] });
    }
  };
  iframe.addEventListener("load", onLoad);
  window.addEventListener("message", onMessage);

  const matrix = new THREE.Matrix4();
  return {
    // Called every frame, after the room has moved and before it's drawn.
    render(camera: THREE.Camera) {
      const { width, height } = renderer.getSize();
      if (width !== canvas.clientWidth || height !== canvas.clientHeight) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      }
      screen.updateWorldMatrix(true, false);
      player.matrix.copy(matrix.multiplyMatrices(screen.matrixWorld, onScreen));
      renderer.render(scene, camera);
    },
    stop() {
      window.removeEventListener("message", onMessage);
      iframe.removeEventListener("load", onLoad);
      player.removeFromParent();
      iframe.remove();
      layer.replaceChildren();
      screen.material = blank;
      hole.dispose();
    },
  };
}
