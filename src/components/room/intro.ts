import gsap from "gsap";
import type * as THREE from "three";
import type { RoomNodes } from "./model";
import { isMobileLayout, setRoomState, unlockScroll } from "./mode";

export interface IntroTargets {
  room: THREE.Object3D;
  nodes: RoomNodes;
  // The large ground plane under the room (not the model's Floor platform).
  plane: THREE.Object3D;
  // The intro's full turn of the room; kept apart from the mouse tilt so
  // the two add up instead of fighting over rotation.y.
  spin: { y: number };
}

const HERO_LINES = [
  ".intro-text",
  ".hero-main-title",
  ".hero-main-description",
  ".subheading-one",
  ".subheading-two",
];

const reveal = { yPercent: 0, stagger: 0.05, ease: "back.out(1.7)" };
const pop = { x: 1, y: 1, z: 1, ease: "back.out(2.2)", duration: 0.5 };
const shrink = { x: 0, y: 0, z: 0, duration: 0.75 };

// Book nodes in shelf order: Project, Project001 ... Project014.
const BOOKS = ["project", ...Array.from({ length: 14 }, (_, i) => `project${String(i + 1).padStart(3, "0")}`)];

// Shelf and table items that pop in one after another at the end.
const SHELF_ITEMS = [
  "shelf_lamp",
  "table_book",
  "table_book001",
  "shelf_book",
  "shelf_box",
  "shelf_book001",
  "shelf_book003",
  "shelf_book004",
  "shelf_book005",
  "shelf_book002",
  "batman",
];

// One span per letter so each can slide up into view. Screen readers read
// the visually hidden copy instead of the letters.
function splitChars(el: HTMLElement) {
  const text = el.textContent?.trim() ?? "";
  const label = document.createElement("span");
  label.className = "sr-only";
  label.textContent = text;

  const letters = [...text].map((char) => {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");
    if (char === " ") {
      span.textContent = "\u00a0"; // non-breaking space
    } else {
      span.className = "animate-this";
      span.textContent = char;
    }
    return span;
  });

  el.replaceChildren(label, ...letters);
}

function onFirstScroll(callback: () => void) {
  const check = () => {
    if (window.scrollY > 0) {
      window.removeEventListener("scroll", check);
      callback();
    }
  };
  window.addEventListener("scroll", check, { passive: true });
  check();
  return () => window.removeEventListener("scroll", check);
}

// The closed box: the room shrinks in, the welcome line appears, and the
// page waits for the visitor to scroll.
function firstIntro({ room }: IntroTargets, mobile: boolean) {
  return gsap
    .timeline()
    .set(".animate-this", { y: 0, yPercent: 100 })
    .to(".preloader", {
      opacity: 0,
      delay: 1,
      onComplete: () => document.querySelector(".preloader")?.classList.add("hidden"),
    })
    .to(room.scale, { x: 0.017, y: 0.017, z: 0.017, ease: "back.out(2.5)", duration: 0.7 })
    .to(room.position, mobile ? { z: -2.7, ease: "power1.out" } : { x: -1.35, ease: "power1.out" })
    .to(".intro-text .animate-this", reveal)
    .to(".arrow-svg-wrapper", { opacity: 1 }, "same")
    .to(".toggle-bar", { opacity: 1 }, "same");
}

// The box opens and the room builds itself, then the hero text slides in.
function secondIntro({ room, nodes, plane, spin }: IntroTargets, onSettled: () => void) {
  const mobile = isMobileLayout();
  const size = mobile ? 0.06 : 0.11;
  const scale = (name: string) => nodes[name].scale;

  // Starts immediately rather than in sequence, as in the original.
  gsap.to(".arrow-svg-wrapper", { opacity: 0 });

  const tl = gsap.timeline({ onComplete: () => setRoomState("built") });

  tl.to(".intro-text .animate-this", { yPercent: 100, stagger: 0.05, ease: "back.in(1.7)" })
    .to(room.position, { x: mobile ? -0.1 : 0, y: 0, z: mobile ? -1 : 0, ease: "power1.out", duration: 0.7 }, "start")
    .to(spin, { y: 2 * Math.PI, duration: 0.7 }, "start")
    .to(room.scale, { x: size, y: size, z: size, duration: 0.7 }, "start")
    .to(plane.position, { y: -0.4, duration: 0.7 }, "start")
    .to(scale("cube"), shrink, ">+=0.1")
    .to(scale("false_wall"), shrink, "<")
    .to(scale("table"), pop)
    .to(scale("mini_table"), pop, "-=0.1")
    .to(scale("book_shelf"), pop, "-=0.1")
    .to(scale("chair_legs"), pop, "chairKeyboard");

  BOOKS.forEach((book, i) => tl.to(scale(book), pop, i === 0 ? "firstbook" : "<+=0.1"));

  tl.to(scale("mat"), pop, "firstbook")
    .to(scale("drawers"), pop, ">-=0.15")
    .to(scale("trash_can"), pop, ">-=0.15")
    .to(scale("chair"), pop, "chairKeyboard")
    .to(nodes.chair.rotation, { y: 4 * Math.PI + (6 * Math.PI) / 4, ease: "power2.out", duration: 1 }, "chairKeyboard")
    .to(scale("table_top"), pop, "chairKeyboard-=0.2")
    .to(scale("monitor"), pop, ">")
    .to(scale("keyboard"), pop, "chairKeyboard")
    .to(scale("macbook_stand"), pop, "-=0.1")
    .to(scale("mouse_pad"), pop, "-=0.1")
    .to(scale("mug"), pop, "chairKeyboard+=1")
    .to(scale("flower_pot"), pop, "<+=0.1")
    .to(scale("macbook"), pop, "<+=0.1")
    .to(scale("painting"), pop, "chairKeyboard+=0.3")
    .to(scale("painting001"), pop, ">-=0.3")
    .to(scale("painting002"), pop, ">-=0.3")
    .to(scale("clock"), pop, ">-=0.3")
    .to(scale("shelf001"), pop, "chairKeyboard+=0.2")
    .to(scale("shelf002"), pop, "<+=0.2");

  SHELF_ITEMS.forEach((item) => tl.to(scale(item), pop, "<+=0.1"));

  tl.to(".hero-main-title .animate-this", reveal, ">-=0.1")
    .to(".hero-main-description .animate-this", reveal, "<+=0.2")
    .to(".subheading-one .animate-this", reveal, "<+=0.2")
    .to(".subheading-two .animate-this", reveal, "<+=0.2")
    .to(".arrow-svg-wrapper", { opacity: 1 });

  // The room has stopped moving and turning; only furniture pops in after.
  tl.call(onSettled, undefined, "start+=0.7");

  return tl;
}

interface IntroOptions {
  // Go straight to the finished room, as when coming back to it from
  // another page.
  skip: boolean;
  // The first part has ended and the page can scroll.
  onUnlock: () => void;
  // The second part has put the room in place; scroll can move it now.
  onSettled: () => void;
}

// Runs the whole intro. Returns a cleanup function.
export function playIntro(targets: IntroTargets, { skip, onUnlock, onSettled }: IntroOptions) {
  const mobile = isMobileLayout();
  if (mobile) targets.room.position.set(-0.05, 0, -1.7);
  targets.plane.position.y = mobile ? -0.1 : 0.95;

  for (const selector of HERO_LINES) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) splitChars(el);
  }

  // With reduced motion too, skip straight to the finished room instead of
  // animating it together and waiting for a scroll in between.
  const instant = skip || matchMedia("(prefers-reduced-motion: reduce)").matches;

  let second: gsap.core.Timeline | undefined;
  let stopWaiting: (() => void) | undefined;

  const first = firstIntro(targets, mobile).call(() => {
    unlockScroll();
    setRoomState("waiting");
    onUnlock();
    if (instant) {
      second = secondIntro(targets, onSettled).progress(1);
      return;
    }
    stopWaiting = onFirstScroll(() => {
      second = secondIntro(targets, onSettled);
    });
  });
  if (instant) first.progress(1);

  return () => {
    stopWaiting?.();
    first.kill();
    second?.kill();
  };
}
