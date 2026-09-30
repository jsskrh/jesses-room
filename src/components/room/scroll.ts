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

const SPACERS = [
  ".first-margin",
  ".second-margin",
  ".third-margin",
  ".fourth-margin",
  ".fifth-margin",
  ".sixth-margin",
];

const full = { x: 3, y: 3, z: 3 };
const popIn = { x: 1, y: 1, z: 1, ease: "back.out(2)", duration: 0.3 };
const size = (s: number) => ({ x: s, y: s, z: s });

// The room and camera's journey down the page, as one timeline: second n is
// what happens while scrolling through spacer n. One timeline plays its
// steps in order however far the page jumps (End key, find in page, a fast
// flick); separate timelines per spacer raced each other over the same
// values and could leave the camera in the wrong place.
function desktopStory({ room, camera, circles }: ScrollTargets) {
  return gsap
    .timeline({ paused: true, defaults: { duration: 1 } })
    .to(room.position, { x: () => innerWidth * 0.00145 }, 0)
    .to(circles[0].scale, full, 0)
    .to(room.position, { x: 1, y: 0.7, z: () => innerHeight * 0.0055 }, 1)
    .to(room.scale, size(0.4), 1)
    .to(circles[1].scale, full, 1)
    .to(camera.position, { y: 4.7 }, 1)
    .to(camera.position, { x: 4, y: 3.5 }, 2)
    .to(camera.position, { x: 2, y: 9.2 }, 3)
    .to(circles[2].scale, full, 3)
    .to(camera.position, { x: -3.5, y: -2.3 }, 4)
    .to(room.position, { y: 0 }, 4)
    .to(room.position, { x: () => innerWidth * -0.00175, z: 0 }, 5)
    .to(room.scale, size(0.11), 5)
    .to(camera.position, { x: 0, y: 4, z: 5 }, 5);
}

function mobileStory({ room, camera, circles }: ScrollTargets) {
  return gsap
    .timeline({ paused: true, defaults: { duration: 1 } })
    .to(room.scale, size(0.1), 0)
    .to(circles[0].scale, full, 0)
    .to(room.position, { x: 1.5, y: 0.7, z: () => innerHeight * 0.0025 }, 1)
    .to(room.scale, size(0.25), 1)
    .to(circles[1].scale, full, 1)
    .to(camera.position, { y: 4.7 }, 1)
    .to(camera.position, { x: 3.56, y: 6.5 }, 3)
    .to(circles[2].scale, full, 3)
    .to(camera.position, { x: -0.02, y: -0.55 }, 4)
    .to(room.position, { y: 0 }, 4)
    .to(room.position, { x: -0.05, y: 0, z: 0 }, 5)
    .to(room.scale, size(0.07), 5)
    .to(camera.position, { x: 0, y: 4, z: 5 }, 5);
}

// Moves the story's playhead to match the scroll: each spacer adds its own
// progress, so between spacers it rests on a whole second. Eases towards the
// target the way ScrollTrigger's `scrub: 0.6` did.
function driveStory(story: gsap.core.Timeline, live: () => boolean) {
  let chase: gsap.core.Tween | undefined;
  const triggers: ScrollTrigger[] = [];
  const scrolled = () => triggers.reduce((sum, trigger) => sum + trigger.progress, 0);

  // Defined before the triggers: created mid-page (e.g. on switching to the
  // mobile layout), a trigger calls onUpdate straight away.
  const follow = () => {
    if (!live()) return;
    chase = gsap.to(story, { time: scrolled(), duration: 0.6, ease: "expo", overwrite: true });
  };

  // No easing: straight to where the page is, e.g. after jumping to a spot.
  const snap = () => {
    if (!live()) return;
    chase?.kill();
    story.time(scrolled());
  };

  for (const spacer of SPACERS) {
    triggers.push(
      ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: "bottom bottom",
        onUpdate: follow,
      }),
    );
  }

  // After a resize, recompute the size-based values by replaying from the
  // start, so each step still picks up where the previous one ended.
  const refresh = () => {
    const time = story.time();
    story.progress(0).invalidate().time(time);
    follow();
  };
  ScrollTrigger.addEventListener("refresh", refresh);

  return {
    follow,
    snap,
    stop: () => {
      ScrollTrigger.removeEventListener("refresh", refresh);
      chase?.kill();
    },
  };
}

function desktop(targets: ScrollTargets, live: () => boolean) {
  ScrollTrigger.create({ trigger: ".hero", start: "top top", pin: true });
  return driveStory(desktopStory(targets), live);
}

function mobile(targets: ScrollTargets, live: () => boolean) {
  return driveStory(mobileStory(targets), live);
}

function everyLayout({ nodes }: ScrollTargets) {
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

type Story = ReturnType<typeof driveStory>;

// Smooth scrolling (replaces ASScroll) plus every scroll-driven animation.
// The room's story stays still until `startStory()`: before that the intro
// is still moving the room and the two would fight over the same values.
export function setupScroll(targets: ScrollTargets) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reducedMotion ? null : new Lenis({ lerp: 0.3 });
  const raf = (time: number) => lenis?.raf(time * 1000);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  }

  let live = false;
  let story: Story | undefined;
  const isLive = () => live;
  const use = (next: Story) => {
    story = next;
    story.follow();
    return story.stop;
  };

  const layouts = gsap.matchMedia();
  layouts.add("(min-width: 969px)", () => use(desktop(targets, isLive)));
  layouts.add("(max-width: 968px)", () => use(mobile(targets, isLive)));
  const shared = gsap.context(() => everyLayout(targets));

  return {
    // `immediate` puts the room where the scroll is without easing it there.
    startStory({ immediate = false } = {}) {
      live = true;
      if (immediate) story?.snap();
      else story?.follow();
    },
    // Scroll straight to an element, centred on screen: for a project, far
    // enough for its book to come out.
    jumpTo(element: HTMLElement) {
      ScrollTrigger.refresh();
      const box = element.getBoundingClientRect();
      const y = Math.max(0, window.scrollY + box.top + box.height / 2 - innerHeight / 2 + 1);
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
    },
    cleanup() {
      layouts.revert();
      shared.revert();
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
      }
    },
  };
}
