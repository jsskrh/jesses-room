import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Canvas.css";

function Canvas() {
  const experienceRef = useRef(null);
  const experience = experienceRef.current;

  useEffect(() => {
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const perspectiveCamera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const frustrum = 5;
    const orthographicCamera = new THREE.OrthographicCamera(
      ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
      ((window.innerWidth / window.innerHeight) * frustrum) / 2,
      frustrum / 2,
      -frustrum / 2,
      -100,
      100
    );

    const renderer = new THREE.WebGLRenderer({
      /* canvas: this.canvas, */
      antialias: true,
    });
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let start = Date.now();
    let current = start;
    let elapsed = 0;
    let delta = 16;

    /* const update = () => {
      let currentTime = Date.now();
      delta = currentTime - current;
      current = currentTime;
      elapsed = current - start;

      console.log(delta);
      window.requestAnimationFrame(() => {
        update();
      });
    };
 */
    /* update(); */

    experienceRef.current.appendChild(renderer.domElement);

    // ROOM
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    perspectiveCamera.position.z = 5;

    const animate = () => {
      let currentTime = Date.now();
      delta = currentTime - current;
      current = currentTime;
      elapsed = current - start;

      /* console.log(delta); */

      requestAnimationFrame(animate);

      /* cube.rotation.x += 0.01;
      cube.rotation.y += 0.01; */

      renderer.render(scene, perspectiveCamera);
    };

    let onWindowResize = function () {
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      orthographicCamera.left =
        ((-window.innerWidth / window.innerHeight) * frustrum) / 2;
      orthographicCamera.right =
        ((window.innerWidth / window.innerHeight) * frustrum) / 2;
      orthographicCamera.left = frustrum / 2;
      orthographicCamera.left = -frustrum / 2;
      perspectiveCamera.updateProjectionMatrix();
      orthographicCamera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", onWindowResize, false);

    animate();

    return () => experienceRef.current.removeChild(renderer.domElement);
  }, []);

  return <div className="experience" ref={experienceRef}></div>;
}

export default Canvas;
