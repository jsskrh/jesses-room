import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Canvas.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useStateValue } from "./StateProvider";
import GUI from "lil-gui";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

function Canvas({ ready, items }) {
  const [{ theme }] = useStateValue();

  const [actualRoom, setActualRoom] = useState({});

  const experienceRef = useRef(null);

  const themeRef = useRef(theme);
  /* themeRef.current = theme; */

  useEffect(() => {
    themeRef.current = theme;
    console.log(themeRef.current, "effect 1");
  });

  /* useEffect(() => {
    // LIGHTS
    const sunLight = new THREE.DirectionalLight("#ffffff", 3);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(-1.5, 7, 3);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    scene.add(ambientLight);
    
    if (theme) {
      GSAP.to(sunLight.color, {
        r: 0.17254901960784313,
        g: 0.23137254901960785,
        b: 0.6862745098039216,
      });
      GSAP.to(ambientLight.color, {
        r: 0.17254901960784313,
        g: 0.23137254901960785,
        b: 0.6862745098039216,
      });
      GSAP.to(sunLight, {
        intensity: 0.78,
      });
      GSAP.to(ambientLight, {
        intensity: 0.78,
      });
    } else {
      GSAP.to(sunLight.color, {
        r: 1,
        g: 1,
        b: 1,
      });
      GSAP.to(ambientLight.color, {
        r: 1,
        g: 1,
        b: 1,
      });
      GSAP.to(sunLight, {
        intensity: 3,
      });
      GSAP.to(ambientLight, {
        intensity: 1,
      });
    }
  }, [ready, theme]); */

  useEffect(() => {
    if (ready) {
      const lerp = {
        current: 0,
        target: 0,
        ease: 0.1,
      };

      const gui = new GUI({ container: document.querySelector(".hero-main") });

      const obj = {
        colorObj: { r: 0, g: 0, b: 0 },
        intensity: 3,
      };

      // RENDERER
      const renderer = new THREE.WebGLRenderer({
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
      experienceRef.current.appendChild(renderer.domElement);

      // SCENE
      const scene = new THREE.Scene();

      // LIGHTS
      const sunLight = new THREE.DirectionalLight("#ffffff", 3);
      sunLight.castShadow = true;
      sunLight.shadow.camera.far = 20;
      sunLight.shadow.mapSize.set(2048, 2048);
      sunLight.shadow.normalBias = 0.05;
      sunLight.position.set(-1.5, 7, 3);
      scene.add(sunLight);
      const ambientLight = new THREE.AmbientLight("#ffffff", 1);
      scene.add(ambientLight);

      if (themeRef.current) {
        console.log(true);
        GSAP.to(sunLight.color, {
          r: 0.17254901960784313,
          g: 0.23137254901960785,
          b: 0.6862745098039216,
        });
        GSAP.to(ambientLight.color, {
          r: 0.17254901960784313,
          g: 0.23137254901960785,
          b: 0.6862745098039216,
        });
        GSAP.to(sunLight, {
          intensity: 0.78,
        });
        GSAP.to(ambientLight, {
          intensity: 0.78,
        });
      } else {
        console.log(false);
        GSAP.to(sunLight.color, {
          r: 1,
          g: 1,
          b: 1,
        });
        GSAP.to(ambientLight.color, {
          r: 1,
          g: 1,
          b: 1,
        });
        GSAP.to(sunLight, {
          intensity: 3,
        });
        GSAP.to(ambientLight, {
          intensity: 1,
        });
      }

      // CAMERA
      const perspectiveCamera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      scene.add(perspectiveCamera);
      perspectiveCamera.position.x = 29;
      perspectiveCamera.position.y = 14;
      perspectiveCamera.position.z = 12;
      const frustrum = 5;
      const orthographicCamera = new THREE.OrthographicCamera(
        ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
        ((window.innerWidth / window.innerHeight) * frustrum) / 2,
        frustrum / 2,
        -frustrum / 2,
        -50,
        50
      );

      orthographicCamera.position.y = 4;
      orthographicCamera.position.z = 5;
      orthographicCamera.rotation.x = -Math.PI / 6;

      scene.add(orthographicCamera);

      // HELPERS
      //const size = 20;
      //const divisions = 20;
      //const gridHelper = new THREE.GridHelper(size, divisions);
      //scene.add(gridHelper);
      //const axesHelper = new THREE.AxesHelper(10);
      //scene.add(axesHelper);
      //const helper = new THREE.CameraHelper(orthographicCamera);
      //scene.add(helper);
      //helper.matrixWorldNeedsUpdate = true;
      //helper.update();
      //helper.position.copy(orthographicCamera.position);
      //helper.rotation.copy(orthographicCamera.rotation);
      //console.log(helper.position);

      // ORBIT CONTROLS
      const controls = new OrbitControls(
        perspectiveCamera,
        renderer.domElement
      );
      controls.enableDamping = true;
      controls.enableZoom = false;

      // CONTROLS
      //Create a closed wavey loop
      // Create the final object to add to the scene
      let progress = 0;
      lerp.current = GSAP.utils.interpolate(
        lerp.current,
        lerp.target,
        lerp.ease
      );

      let start = Date.now();
      let current = start;
      let elapsed = 0;
      let delta = 16;

      // ROOM
      const room = items.room;
      /* setRoom(room); */
      const actualRoom = room.scene;
      setActualRoom(actualRoom);
      scene.add(actualRoom);
      actualRoom.scale.set(0.11, 0.11, 0.11);
      actualRoom.children.forEach((child) => {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child instanceof THREE.Group) {
          child.children.forEach((groupChild) => {
            groupChild.castShadow = true;
            groupChild.receiveShadow = true;
          });
        }

        if (child.name === "AquaGlass") {
          child.material = new THREE.MeshPhysicalMaterial();
          child.material.roughness = 0;
          child.material.color.set(0x549dd2);
          child.material.ior = 3;
          child.material.transmission = 1;
          child.material.opacity = 1;
        }

        if (child.name === "Screen") {
          child.material = new THREE.MeshBasicMaterial({
            map: items.screen,
          });
        }
      });
      window.addEventListener("mousemove", (e) => {
        let rotation =
          ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
        lerp.target = rotation * 0.1;
        lerp.current = GSAP.utils.interpolate(
          lerp.current,
          lerp.target,
          lerp.ease
        );
        actualRoom.rotation.y = lerp.current;
      });
      console.log(room);

      GSAP.registerPlugin(ScrollTrigger);

      const timeline = new GSAP.timeline();
      timeline.to(actualRoom.position, {
        x: () => {
          return innerWidth * 0.00165;
        },
        scrollTrigger: {
          trigger: ".first-margin",
          markers: true,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // FISH
      // fix fish animation
      /* if (Object.keys(room).length !== 0) {
        const mixer = new THREE.AnimationMixer(actualRoom);
        const swim = mixer.clipAction(room.animations[156]);
        swim.play();
        mixer.update(delta * 0.009);
      } */
      /* const mixer = new THREE.AnimationMixer(actualRoom);
      const swim = mixer.clipAction(room.animations[156]);
      swim.play();
      mixer.update(delta * 0.009); */

      // RECTAREA LIGHT
      const monitorLight = new THREE.RectAreaLight(0xffffff, 1, 0.73, 0.3515);
      monitorLight.position.set(-9.56, 7.3, -2.8);
      monitorLight.rotation.y = (Math.PI / 4) * 5;
      if (themeRef.current) {
        actualRoom.add(monitorLight);
      }

      /* const rectLightHelper = new RectAreaLightHelper(rectLight);
      rectLight.add(rectLightHelper); */

      const tankLight = new THREE.RectAreaLight(0xffffff, 1, 0.5, 1.015);
      tankLight.position.set(9.08244, 7.2, -0.510353);
      tankLight.rotation.x = -Math.PI / 2;
      tankLight.rotation.z = Math.PI / 4;
      if (themeRef.current) {
        actualRoom.add(tankLight);
      }

      /* const rectLightHelper = new RectAreaLightHelper(tankLight);
      tankLight.add(rectLightHelper); */

      /* gui.add(obj, "intensity", 0, 10).onChange(() => {
sunLight.intesity = obj.intesity;
}); */

      // FLOOR
      const planeGeometry = new THREE.PlaneGeometry(100, 100);
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbf4e4,
        /* color: 0x6e85b7, */
        /* color: 0xfefbe7, */
        side: THREE.BackSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = -0.3;
      /* plane.material.color.setHex(0xfbf4e4); */
      plane.receiveShadow = true;
      scene.add(plane);

      gui.addColor(obj, "colorObj").onChange(() => {
        plane.material.color.copy(obj.colorObj);
        console.log(obj.colorObj);
      });

      // ANIMATE
      var animate = function () {
        requestAnimationFrame(animate);
        /* if (Object.keys(room).length !== 0) {
          const mixer = new THREE.AnimationMixer(actualRoom);
          const swim = mixer.clipAction(room.animations[156]);
          swim.play();
          mixer.update(delta * 0.009);
        } */
        /* const mixer = new THREE.AnimationMixer(actualRoom);
        const swim = mixer.clipAction(room.animations[156]);
        swim.play();
        mixer.update(delta * 0.009); */
        renderer.render(scene, orthographicCamera);
      };

      let onWindowResize = function () {
        orthographicCamera.left =
          ((-window.innerWidth / window.innerHeight) * frustrum) / 2;
        orthographicCamera.right =
          ((window.innerWidth / window.innerHeight) * frustrum) / 2;
        orthographicCamera.top = frustrum / 2;
        orthographicCamera.bottom = -frustrum / 2;
        perspectiveCamera.updateProjectionMatrix();
        orthographicCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      };

      window.addEventListener("resize", onWindowResize, false);

      animate();

      return () => experienceRef.current.removeChild(renderer.domElement);
    }
  }, [ready]);

  return <div className="experience" ref={experienceRef}></div>;
}

export default Canvas;
