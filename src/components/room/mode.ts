// Room mode is decided before first paint in Base.astro: <html> gets
// `has-room` (and `is-locked` until the first intro ends) when WebGL works.
// `data-room` tracks progress: booting -> waiting (first intro done) -> built.

const root = () => document.documentElement;

export const inRoomMode = () => root().classList.contains("has-room");

export function setRoomState(state: "booting" | "waiting" | "built") {
  root().dataset.room = state;
}

export function unlockScroll() {
  root().classList.remove("is-locked");
}

// Drop back to the plain HTML page, e.g. when the model fails to load.
export function leaveRoomMode() {
  root().classList.remove("has-room", "is-locked");
}

export const isMobileLayout = () => matchMedia("(max-width: 968px)").matches;
