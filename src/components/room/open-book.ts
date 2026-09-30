import gsap from "gsap";
import * as THREE from "three";
import { frontOf } from "./covers";
import { isMobileLayout } from "./mode";

// Opening a book. The model's books are solid, so each gets a front board
// that swings open on the spine, with the first page under it. They're
// hidden until the book opens and look just like its closed cover.

// Board thickness, in the book's own units.
const BOARD = 0.02;
// Space kept around the open page, in pixels.
const MARGIN = 32;

export interface Pose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
}

interface Opening {
  // The page frame: z towards the reader, x to the right, y up.
  parts: THREE.Group;
  hinge: THREE.Group;
  width: number;
  height: number;
  place: THREE.Matrix4;
}

const openings = new WeakMap<THREE.Object3D, Opening | null>();

function openingOf(book: THREE.Object3D): Opening | undefined {
  if (openings.has(book)) return openings.get(book) ?? undefined;
  const front = frontOf(book);
  if (!front) {
    openings.set(book, null);
    return;
  }
  const { place, width, height, binding, pages } = front;

  const parts = new THREE.Group();
  parts.name = "opening";
  parts.visible = false;
  place.decompose(parts.position, parts.quaternion, parts.scale);

  const paper = (pages.material as THREE.MeshStandardMaterial).clone();
  paper.polygonOffset = true;
  paper.polygonOffsetFactor = -1;
  const page = new THREE.Mesh(new THREE.PlaneGeometry(width, height), paper);
  // Just above the cover and its title, inside the closed board.
  page.position.z = BOARD / 4;
  page.receiveShadow = true;

  // The board turns about the spine edge of the page.
  const hinge = new THREE.Group();
  hinge.position.x = -width / 2;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, BOARD),
    (binding.material as THREE.Material).clone(),
  );
  board.position.set(width / 2, 0, BOARD / 2);
  hinge.add(board);
  if (front.cover) {
    const title = new THREE.Mesh(front.cover.geometry, front.cover.material);
    title.position.set(width / 2, 0, BOARD);
    hinge.add(title);
  }

  parts.add(page, hinge);
  book.add(parts);
  const opening = { parts, hinge, width, height, place };
  openings.set(book, opening);
  return opening;
}

const poseOf = (object: THREE.Object3D): Pose => {
  object.updateWorldMatrix(true, false);
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  object.matrixWorld.decompose(position, quaternion, scale);
  return { position, quaternion, scale: scale.x };
};

// Moves an object with no parent transform (a child of the scene) to `to`,
// from wherever it is when the tween starts.
function moveTo(object: THREE.Object3D, to: () => Pose, vars: gsap.TweenVars) {
  let from: Pose;
  let target: Pose;
  const step = { t: 0 };
  return gsap.to(step, {
    t: 1,
    ...vars,
    onStart: () => {
      from = poseOf(object);
      target = to();
    },
    onUpdate: () => {
      object.position.lerpVectors(from.position, target.position, step.t);
      object.quaternion.slerpQuaternions(from.quaternion, target.quaternion, step.t);
      object.scale.setScalar(THREE.MathUtils.lerp(from.scale, target.scale, step.t));
    },
  });
}

// Where the open right-hand page goes on screen. On a wide screen its spine
// meets the edge of the text card, which hides the left-hand page; on a
// narrow one the spine is at the screen's edge.
function pageRect({ width, height }: Opening, canvas: HTMLCanvasElement) {
  const left = isMobileLayout() ? 0 : canvas.clientWidth / 2;
  const across = canvas.clientWidth - left - MARGIN;
  const down = innerHeight - MARGIN * 2;
  const scale = Math.min(across / width, down / height);
  return {
    left,
    top: (innerHeight - height * scale) / 2,
    width: width * scale,
    height: height * scale,
  };
}

export type PageRect = ReturnType<typeof pageRect>;

// The book's pose, in the scene, for its page to fill `rect`, square on to
// the camera.
function readingPose(
  { height, place }: Opening,
  rect: PageRect,
  camera: THREE.OrthographicCamera,
  canvas: HTMLCanvasElement,
): Pose {
  camera.updateMatrixWorld();
  // The orthographic camera shows `zoom` pixels per unit.
  const scale = rect.height / (height * camera.zoom);
  const pagePosition = new THREE.Vector3().setFromMatrixPosition(place);
  const pageTurn = new THREE.Quaternion().setFromRotationMatrix(place);
  const quaternion = camera.quaternion.clone().multiply(pageTurn.invert());

  // Near the front of the camera's depth range (-1), in front of the whole
  // room, some of which is behind the camera itself when the room comes close.
  const centre = new THREE.Vector3(
    ((rect.left + rect.width / 2) / canvas.clientWidth) * 2 - 1,
    1 - ((rect.top + rect.height / 2) / canvas.clientHeight) * 2,
    -0.9,
  ).unproject(camera);
  const position = centre.sub(pagePosition.multiplyScalar(scale).applyQuaternion(quaternion));
  return { position, quaternion, scale };
}

interface OpenBook {
  room: THREE.Object3D;
  camera: THREE.OrthographicCamera;
  canvas: HTMLCanvasElement;
}

// Brings the book out of the room to face the reader and opens it. Calls
// `onOpen` with the page's place on screen.
export function openBook(
  book: THREE.Object3D,
  { room, camera, canvas }: OpenBook,
  onOpen: (rect: PageRect) => void,
) {
  const opening = openingOf(book);
  const scene = room.parent;
  const tl = gsap.timeline();
  if (!opening || !scene) return tl;

  let rect: PageRect;
  return tl
    .call(() => {
      scene.attach(book);
      opening.parts.visible = true;
      rect = pageRect(opening, canvas);
    })
    .add(moveTo(book, () => readingPose(opening, rect, camera, canvas), { duration: 0.8, ease: "power2.inOut" }))
    .to(opening.hinge.rotation, { y: -Math.PI, duration: 0.8, ease: "power2.inOut" }, "-=0.2")
    .call(() => onOpen(rect));
}

// Closes the book and puts it back in the room at `home`, its pose there.
export function closeBook(book: THREE.Object3D, room: THREE.Object3D, home: () => Pose) {
  const opening = openingOf(book);
  const tl = gsap.timeline();
  if (!opening || !room.parent) return tl;
  // In case it's closed before it was fully out of the room.
  room.parent.attach(book);

  const inRoom = () => {
    const { position, quaternion, scale } = home();
    const local = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3().setScalar(scale));
    return poseOfMatrix(local.premultiply(room.matrixWorld));
  };

  return tl
    .to(opening.hinge.rotation, { y: 0, duration: 0.6, ease: "power2.inOut" })
    .add(moveTo(book, inRoom, { duration: 0.7, ease: "power2.inOut" }), "-=0.1")
    .call(() => {
      room.attach(book);
      const { position, quaternion, scale } = home();
      book.position.copy(position);
      book.quaternion.copy(quaternion);
      book.scale.setScalar(scale);
      opening.parts.visible = false;
    });
}

// Keeps an open book's page where it belongs after the window changes size.
export function reopen(book: THREE.Object3D, { camera, canvas }: OpenBook): PageRect | undefined {
  const opening = openingOf(book);
  if (!opening) return;
  const rect = pageRect(opening, canvas);
  const { position, quaternion, scale } = readingPose(opening, rect, camera, canvas);
  book.position.copy(position);
  book.quaternion.copy(quaternion);
  book.scale.setScalar(scale);
  return rect;
}

function poseOfMatrix(matrix: THREE.Matrix4): Pose {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);
  return { position, quaternion, scale: scale.x };
}

export const canOpen = (book: THREE.Object3D) => Boolean(openingOf(book));
