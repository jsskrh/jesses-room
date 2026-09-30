// Builds the room model the site loads from the Blender export.
//
//   npm run model
//
// models/FinalRoomV7.glb (source, not deployed) -> public/models/room.glb
//
// - Removes the animation clips Blender exported; the site animates
//   everything with GSAP and never plays them.
// - Re-encodes the painting textures as WebP, at most 1024px.
// - Keeps the Draco-compressed geometry as it is.
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { prune, textureCompress } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { statSync } from "node:fs";

const SOURCE = "models/FinalRoomV7.glb";
const OUTPUT = "public/models/room.glb";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
});

const doc = await io.read(SOURCE);

// Samplers outlive their animation unless disposed too, and keep the
// keyframe data from being pruned.
for (const animation of doc.getRoot().listAnimations()) {
  for (const channel of animation.listChannels()) channel.dispose();
  for (const sampler of animation.listSamplers()) sampler.dispose();
  animation.dispose();
}

await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 85 }),
  // Conservative: keep empty nodes and every vertex attribute as exported.
  prune({ keepLeaves: true, keepAttributes: true }),
);

await io.write(OUTPUT, doc);

const kb = (path) => `${Math.round(statSync(path).size / 1024)} KB`;
console.log(`${SOURCE} (${kb(SOURCE)}) -> ${OUTPUT} (${kb(OUTPUT)})`);
