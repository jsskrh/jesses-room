import * as THREE from "three";

export type RoomNodes = Record<string, THREE.Object3D>;

// The room's top-level objects, keyed by lowercased node name as three.js
// sanitises them ("Floor Pad.001" -> "floor_pad001").
export function prepareRoom(scene: THREE.Group): RoomNodes {
  const nodes: RoomNodes = {};

  scene.scale.setScalar(0);
  scene.position.y = 1;

  for (const child of scene.children) {
    child.castShadow = true;
    child.receiveShadow = true;
    if (child instanceof THREE.Group) {
      for (const part of child.children) {
        part.castShadow = true;
        part.receiveShadow = true;
      }
    }

    // Everything starts hidden and pops in during the intro.
    child.scale.setScalar(0);

    if (child.name === "Floor") {
      child.position.x = 8.65263;
      child.position.z = -2.63444;
    }
    if (child.name === "Room_Cube") {
      child.position.set(0, -1.5, 0);
      child.rotation.y = Math.PI / 4;
    }

    nodes[child.name.toLowerCase()] = child;
  }

  // The closed box the second intro opens up.
  for (const name of ["wall", "cube", "false_wall", "floor"]) {
    nodes[name]?.scale.setScalar(1);
  }

  return nodes;
}
