import * as THREE from "three";
import type { RoomNodes } from "./model";

// Each project's book has the project's name printed on its front cover, so
// it can be told apart when it comes off the shelf. Names come from the
// project headings on the page, which name their book in data-book.

// Canvas pixels per unit of the book's own size.
const RESOLUTION = 400;
// The site's text colour.
const INK = "#323232";

export function addCovers(nodes: RoomNodes) {
  const headings = document.querySelectorAll<HTMLElement>("[data-book]");
  const covers: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>[] = [];
  let removed = false;

  // Canvas text only uses a web font once it has loaded.
  document.fonts
    .load('500 64px "Montserrat"')
    .catch(() => {})
    .then(() => {
      if (removed) return;
      for (const heading of headings) {
        const book = nodes[heading.dataset.book!.toLowerCase()];
        const title = heading.textContent?.trim();
        const cover = book && title && makeCover(book, title);
        if (!cover) continue;
        book.add(cover);
        covers.push(cover);
      }
    });

  return () => {
    removed = true;
    for (const cover of covers) {
      cover.removeFromParent();
      cover.geometry.dispose();
      cover.material.map?.dispose();
      cover.material.dispose();
    }
  };
}

// A book is its binding plus its pages. Seen from the camera once the book
// is out, its front cover faces +y, with the spine (+z) on the left and +x
// pointing down. Some books were modelled leaning, turned about z within
// their own axes, so the faces are found from the shape itself.
function makeCover(book: THREE.Object3D, title: string) {
  const parts = book.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh);
  const binding = parts.find((part) => !isPages(part));
  const pages = parts.find(isPages);
  if (!binding || !pages) return;

  const lean = leanOf(binding);
  const upright = new THREE.Matrix4().makeRotationZ(-lean);
  const outer = bounds(binding, upright);
  const inner = bounds(pages, upright);
  // From the fore edge to where the spine starts.
  const width = inner.max.z - outer.min.z;
  const height = outer.max.x - outer.min.x;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * RESOLUTION);
  canvas.height = Math.round(height * RESOLUTION);
  printTitle(canvas, title);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const surface = binding.material as THREE.MeshStandardMaterial;

  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map,
      transparent: true,
      roughness: surface.roughness,
      metalness: surface.metalness,
      // Drawn over the binding without flickering against it.
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  cover.name = "cover";
  cover.receiveShadow = true;

  // The plane faces +z, reading along +x with +y up. Turn it to face +y,
  // reading along -z with -x up, then lean it with the book.
  const facing = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
  );
  const place = new THREE.Matrix4()
    .makeRotationZ(lean)
    .multiply(
      new THREE.Matrix4().makeTranslation(
        (outer.min.x + outer.max.x) / 2,
        outer.max.y,
        (outer.min.z + inner.max.z) / 2,
      ),
    )
    .multiply(facing);
  place.decompose(cover.position, cover.quaternion, cover.scale);
  return cover;
}

const isPages = (part: THREE.Mesh) => (part.material as THREE.Material).name === "Book Pages";

// The book's turn about z: the angle that fits it in the smallest upright
// rectangle.
function leanOf(part: THREE.Mesh) {
  const position = part.geometry.getAttribute("position");
  let best = { angle: 0, area: Infinity };
  for (let degrees = -45; degrees <= 45; degrees += 0.25) {
    const angle = THREE.MathUtils.degToRad(degrees);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      // Turned back by `angle`.
      const u = x * cos + y * sin;
      const v = y * cos - x * sin;
      minX = Math.min(minX, u);
      maxX = Math.max(maxX, u);
      minY = Math.min(minY, v);
      maxY = Math.max(maxY, v);
    }
    const area = (maxX - minX) * (maxY - minY);
    if (area < best.area) best = { angle, area };
  }
  return best.angle;
}

// A part's bounds in the book's space, after `turn`. Measured point by
// point: turning a box's corners would give a larger box.
function bounds(part: THREE.Mesh, turn: THREE.Matrix4) {
  part.updateMatrix();
  const toBook = turn.clone().multiply(part.matrix);
  const position = part.geometry.getAttribute("position");
  const point = new THREE.Vector3();
  const box = new THREE.Box3();
  for (let i = 0; i < position.count; i++) {
    box.expandByPoint(point.fromBufferAttribute(position, i).applyMatrix4(toBook));
  }
  return box;
}

// The title in capitals in the upper part of the cover, like the section
// titles, over a short rule.
function printTitle(canvas: HTMLCanvasElement, title: string) {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const textWidth = width * 0.72;
  ctx.fillStyle = INK;

  // Wrapped between words; smaller if a single word is still too wide.
  let size = width * 0.11;
  const fit = () => {
    ctx.font = `500 ${size}px Montserrat, sans-serif`;
    ctx.letterSpacing = `${size * 0.15}px`;
    return wrap(ctx, title.toUpperCase(), textWidth);
  };
  let lines = fit();
  while (lines.some((line) => ctx.measureText(line).width > textWidth)) {
    size *= 0.92;
    lines = fit();
  }

  const lineHeight = size * 1.5;
  const top = height * 0.2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) => ctx.fillText(line, width / 2, top + i * lineHeight));

  const rule = top + lines.length * lineHeight;
  ctx.fillRect(width / 2 - width * 0.12, rule, width * 0.24, Math.max(2, width * 0.008));
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && ctx.measureText(`${last} ${word}`).width <= maxWidth) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}
