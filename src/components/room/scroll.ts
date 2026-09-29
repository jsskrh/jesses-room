import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type * as THREE from "three";
import type { RoomNodes } from "./model";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollTargets {
  room: THREE.Object3D;
  nodes: RoomNodes;
  camera: THREE.Camera;
  // Pink, green and blue discs on the ground, one per section colour.
  circles: THREE.Object3D[];
}

// Scrubs an animation across one of the spacer blocks between sections.
const across = (margin: string): ScrollTrigger.Vars => ({
  trigger: margin,
  start: "top top",
  end: "bottom bottom",
  scrub: 0.6,
  invalidateOnRefresh: true,
});

const full = { x: 3, y: 3, z: 3 };
const popIn = { x: 1, y: 1, z: 1, ease: "back.out(2)", duration: 0.3 };
const size = (s: number) => ({ x: s, y: s, z: s });

function desktop({ room, camera }: ScrollTargets) {
  ScrollTrigger.create({ trigger: ".hero", start: "top top", pin: true });

  gsap.timeline({ scrollTrigger: across(".first-margin") })
    .to(room.position, { x: () => innerWidth * 0.00145 });

  gsap.timeline({ scrollTrigger: across(".second-margin") })
    .to(room.position, { x: 1, z: () => innerHeight * 0.0055 }, "same")
    .to(room.scale, size(0.4), "same");

  gsap.timeline({ scrollTrigger: across(".third-margin") })
    .to(camera.position, { x: 4, y: 3.5 });

  gsap.timeline({ scrollTrigger: across(".fourth-margin") })
    .to(camera.position, { x: 2, y: 9.2 });

  gsap.timeline({ scrollTrigger: across(".fifth-margin") })
    .to(camera.position, { x: -3.5, y: -2.3 });

  gsap.timeline({ scrollTrigger: across(".sixth-margin") })
    .to(room.position, { x: () => innerWidth * -0.00175, z: 0 }, "same")
    .to(room.scale, size(0.11), "same")
    .to(camera.position, { x: 0, y: 4, z: 5 }, "same");
}

function mobile({ room, camera }: ScrollTargets) {
  gsap.timeline({ scrollTrigger: across(".first-margin") })
    .to(room.scale, size(0.1));

  gsap.timeline({ scrollTrigger: across(".second-margin") })
    .to(room.position, { x: 1.5, z: () => innerHeight * 0.0025 }, "same")
    .to(room.scale, size(0.25), "same");

  gsap.timeline({ scrollTrigger: across(".fourth-margin") })
    .to(camera.position, { x: 3.56, y: 6.5 });

  gsap.timeline({ scrollTrigger: across(".fifth-margin") })
    .to(camera.position, { x: -0.02, y: -0.55 });

  gsap.timeline({ scrollTrigger: across(".sixth-margin") })
    .to(room.position, { x: -0.05, y: 0, z: 0 }, "same")
    .to(room.scale, size(0.07), "same")
    .to(camera.position, { x: 0, y: 4, z: 5 }, "same");
}

function everyLayout({ room, nodes, camera, circles }: ScrollTargets) {
  // The little outdoor platform (mailbox, lamp, flowers) pops in once.
  gsap.timeline({ scrollTrigger: { trigger: ".fourth-margin", start: "center center" } })
    .to(nodes.floor.position, { x: 3.07688, z: 2.66616, ease: "back.out(2)", duration: 0.3 })
    .to(nodes.mailbox.scale, popIn)
    .to(nodes.lamp.scale, popIn)
    .to(nodes.floor_pad001.scale, popIn, "-=0.2")
    .to(nodes.floor_pad002.scale, popIn, "-=0.2")
    .to(nodes.floor_pad003.scale, popIn, "-=0.2")
    .to(nodes.flower_pad.scale, popIn, "-=0.2")
    .to(nodes.flower001.scale, popIn)
    .to(nodes.flower002.scale, popIn, "-=0.1");

  gsap.timeline({ scrollTrigger: across(".first-margin") })
    .to(circles[0].scale, full);

  gsap.timeline({ scrollTrigger: across(".second-margin") })
    .to(circles[1].scale, full, "same")
    .to(room.position, { y: 0.7 }, "same")
    .to(camera.position, { y: 4.7 }, "same");

  gsap.timeline({ scrollTrigger: across(".fourth-margin") })
    .to(circles[2].scale, full);

  gsap.timeline({ scrollTrigger: across(".fifth-margin") })
    .to(room.position, { y: 0 });

  // Each section rounds its inner corners as it passes, and its progress
  // bar sticks to the top of the screen and fills as you read.
  for (const section of gsap.utils.toArray<HTMLElement>(".section")) {
    const edge = section.classList.contains("right") ? "Left" : "Right";

    gsap.to(section, {
      [`borderTop${edge}Radius`]: 10,
      scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.6 },
    });
    gsap.to(section, {
      [`borderBottom${edge}Radius`]: 700,
      scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom top", scrub: 0.6 },
    });
    gsap.fromTo(
      section.querySelector(".progress-bar"),
      { scaleY: 0 },
      {
        scaleY: 1,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          pin: section.querySelector(".progress-wrapper"),
          pinSpacing: false,
        },
      },
    );
  }
}

// Smooth scrolling (replaces ASScroll) plus every scroll-driven animation.
// Returns a cleanup function.
export function setupScroll(targets: ScrollTargets) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reducedMotion ? null : new Lenis({ lerp: 0.3 });
  const raf = (time: number) => lenis?.raf(time * 1000);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }

  const layouts = gsap.matchMedia();
  layouts.add("(min-width: 969px)", () => desktop(targets));
  layouts.add("(max-width: 968px)", () => mobile(targets));
  const shared = gsap.context(() => everyLayout(targets));

  return () => {
    layouts.revert();
    shared.revert();
    if (lenis) {
      gsap.ticker.remove(raf);
      lenis.destroy();
    }
  };
}
