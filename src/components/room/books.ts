import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type * as THREE from "three";
import type { RoomNodes } from "./model";

gsap.registerPlugin(ScrollTrigger);

export interface Bookshelf {
  // The book that is out right now, if any: its heading's id and the page
  // it opens (the project's case study).
  open(): { id: string; href: string } | undefined;
  cleanup(): void;
}

// A book pops off the shelf when its project heading reaches the middle of
// the screen, and goes back when another takes its place or you scroll out
// of the project list. Headings carry the book's node name in data-book and
// the page it opens in data-href.
export function setupBooks(nodes: RoomNodes): Bookshelf {
  const entries = gsap.utils
    .toArray<HTMLElement>("[data-book]")
    .map((heading) => ({
      heading,
      key: heading.dataset.book!.toLowerCase(),
      href: heading.dataset.href,
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
      .to(book.rotation, { x: -0.525, y: -1.58 }, "same")
      .to(book.position, { x: 13.5, y: 11.5, z: 10 }, "same")
      .to(book.scale, { x: 5, y: 5, z: 5 }, "same");
  };

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

  const sync = () => {
    if (busy || wanted === shown) return;
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

  return {
    open: () => {
      const entry = entries.find(({ key }) => key === shown);
      return entry?.href ? { id: entry.heading.id, href: entry.href } : undefined;
    },
    cleanup: () => {
      context.revert();
      running.forEach((tl) => tl.kill());
    },
  };
}
