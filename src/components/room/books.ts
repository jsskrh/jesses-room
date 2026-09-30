import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import type { RoomNodes } from "./model";
import { canOpen, closeBook, openBook, reopen } from "./open-book";
import { setupReader } from "./reader";

gsap.registerPlugin(ScrollTrigger);

export interface Bookshelf {
  // The project whose book is out right now, if any: its heading's id.
  current(): string | undefined;
  // Opens a project's book at its case study. False if it has no book.
  read(id: string): boolean;
  cleanup(): void;
}

interface ShelfOptions {
  nodes: RoomNodes;
  room: THREE.Object3D;
  camera: THREE.OrthographicCamera;
  canvas: HTMLCanvasElement;
  // The page stops scrolling while a book is open.
  holdScroll(held: boolean): void;
}

// Out of the shelf: in front of the room, facing the camera.
const OUT = { x: 13.5, y: 11.5, z: 10 };
const OUT_TURN = { x: -0.525, y: -1.58 };
const OUT_SCALE = 5;

// A book pops off the shelf when its project heading reaches the middle of
// the screen, and goes back when another takes its place or you scroll out
// of the project list. Headings carry the book's node name in data-book.
// Clicking the book, or its project's "Read case study" link (data-read),
// opens it at the case study.
export function setupBooks({ nodes, room, camera, canvas, holdScroll }: ShelfOptions): Bookshelf {
  const entries = gsap.utils
    .toArray<HTMLElement>("[data-book]")
    .map((heading) => ({
      heading,
      id: heading.id,
      key: heading.dataset.book!.toLowerCase(),
    }))
    .filter(({ key }) => nodes[key]);

  const home = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler }>(
    entries.map(({ key }) => [
      key,
      { position: nodes[key].position.clone(), rotation: nodes[key].rotation.clone() },
    ]),
  );

  // One animation per book at a time. Starting a new one stops the old one
  // where it is, so a book sent back mid-flight can't be dragged out again
  // by the rest of its pop-out, which left books stranded on the old site.
  const running = new Map<string, gsap.core.Timeline>();
  const animate = (key: string) => {
    running.get(key)?.kill();
    const tl = gsap.timeline();
    running.set(key, tl);
    return tl;
  };

  const popOut = (key: string) => {
    const book = nodes[key];
    const { position } = home.get(key)!;
    animate(key)
      .to(book.position, { x: position.x - 1.5, z: position.z + 1.5 })
      .to(book.rotation, OUT_TURN, "same")
      .to(book.position, OUT, "same")
      .to(book.scale, { x: OUT_SCALE, y: OUT_SCALE, z: OUT_SCALE }, "same");
  };

  // Where a book rests once out, in the room.
  const outPose = (key: string) => ({
    position: new THREE.Vector3(OUT.x, OUT.y, OUT.z),
    quaternion: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(OUT_TURN.x, OUT_TURN.y, home.get(key)!.rotation.z),
    ),
    scale: OUT_SCALE,
  });

  const putBack = (key: string) => {
    const book = nodes[key];
    const { position, rotation } = home.get(key)!;
    animate(key)
      .to(book.rotation, { x: rotation.x, y: rotation.y, duration: 0.3 })
      .to(book.position, { x: position.x - 1.5, y: position.y, z: position.z + 1.5, duration: 0.3 }, "<")
      .to(book.scale, { x: 1, y: 1, z: 1, duration: 0.3 }, "<")
      .to(book.position, { x: position.x, z: position.z, duration: 0.2 });
  };

  // Changes are spaced 0.3s apart so animations don't pile up. A change
  // asked for in the meantime isn't dropped: the latest one wins.
  let shown: string | null = null;
  let wanted: string | null = null;
  let busy = false;

  // The open book, if any. The shelf holds still until it's closed.
  let reading: string | null = null;

  const sync = () => {
    if (busy || reading || wanted === shown) return;
    busy = true;
    if (shown) putBack(shown);
    if (wanted) popOut(wanted);
    shown = wanted;
    gsap.delayedCall(0.3, () => {
      busy = false;
      sync();
    });
  };

  // Settled after the triggers have all had their say: a jump past several
  // projects at once (a fast flick, or arriving from a case study) fires
  // theirs in one go, and only the last one should come out.
  let queued = false;
  const want = (key: string | null) => {
    wanted = key;
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      sync();
    });
  };

  const context = gsap.context(() => {
    entries.forEach(({ heading, key }, i) => {
      ScrollTrigger.create({
        trigger: heading,
        start: "center center",
        end: "center center",
        onEnter: () => want(key),
        onEnterBack: () => want(key),
      });

      // Past the last project: put its book back.
      if (i === entries.length - 1) {
        ScrollTrigger.create({
          trigger: heading,
          start: "top top",
          onEnter: () => wanted === key && want(null),
        });
      }

      // Back above the first project: put its book back.
      if (i === 0) {
        ScrollTrigger.create({
          trigger: heading,
          start: "bottom bottom",
          onLeaveBack: () => wanted === key && want(null),
        });
      }
    });
  });

  const root = document.documentElement;
  const reader = setupReader(() => close());
  const place = { room, camera, canvas };
  // With reduced motion, books open and close without moving.
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const read = (id: string) => {
    const entry = entries.find((entry) => entry.id === id);
    if (!entry || !reader.has(id) || !canOpen(nodes[entry.key])) return false;
    if (reading) return true;

    const { key } = entry;
    reading = key;
    holdScroll(true);
    root.classList.add("is-reading");
    // Opened from its link while another book was out.
    if (shown && shown !== key) putBack(shown);
    shown = wanted = key;
    const opening = animate(key).add(openBook(nodes[key], place, (rect) => reader.show(id, rect)));
    if (still) opening.progress(1);
    return true;
  };

  function close() {
    const key = reading;
    if (!key) return;
    reader.hide();
    const closing = animate(key)
      .add(closeBook(nodes[key], room, () => outPose(key)))
      .call(() => {
        // The same turn as the book came back with, written as putBack
        // expects: it turns x and y back and leaves z.
        nodes[key].rotation.set(OUT_TURN.x, OUT_TURN.y, home.get(key)!.rotation.z);
        reading = null;
        root.classList.remove("is-reading");
        holdScroll(false);
        sync();
      });
    if (still) closing.progress(1);
  }

  // "Read case study" opens the book instead of going to the case study's
  // own page, unless it's being opened in a new tab.
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.<HTMLElement>("[data-read]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (read(link.dataset.read!)) event.preventDefault();
  };
  // Captured, so the link's other listeners see it's been handled.
  document.addEventListener("click", onClick, true);

  // Keep an open page in place when the window changes size, once the
  // camera has caught up.
  let resizing: gsap.core.Tween | undefined;
  const onResize = () => {
    resizing?.kill();
    resizing = gsap.delayedCall(0.2, () => {
      if (!reading || !reader.isOpen()) return;
      const rect = reopen(nodes[reading], place);
      if (rect) reader.move(rect);
    });
  };
  window.addEventListener("resize", onResize);

  return {
    current: () => entries.find(({ key }) => key === shown)?.id,
    read,
    cleanup: () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
      resizing?.kill();
      reader.cleanup();
      root.classList.remove("is-reading");
      context.revert();
      running.forEach((tl) => tl.kill());
    },
  };
}
