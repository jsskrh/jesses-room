import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Canvas.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useStateValue } from "./StateProvider";
import GUI from "lil-gui";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

function Canvas({ ready, items, roomObject }) {
  const [{ theme }, dispatch] = useStateValue();

  const [room, setRoom] = useState({});

  const roomChildren = {};

  useEffect(() => {
    if (ready) {
      setRoom(roomObject.scene);
    }
  });

  const create_camera = (camera) => {
    dispatch({
      type: "create_camera",
      camera: camera,
    });
  };

  const create_circle_first = (circleFirst) => {
    dispatch({
      type: "create_circle_first",
      circleFirst: circleFirst,
    });
  };

  const create_circle_second = (circleSecond) => {
    dispatch({
      type: "create_circle_second",
      circleSecond: circleSecond,
    });
  };

  const create_circle_third = (circleThird) => {
    dispatch({
      type: "create_circle_third",
      circleThird: circleThird,
    });
  };

  const create_room_children = (roomChildren) => {
    dispatch({
      type: "create_room_children",
      roomChildren: roomChildren,
    });
  };

  const experienceRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  });
  /* 
  const frustrum = 5;
  const orthographicCamera = new THREE.OrthographicCamera(
    ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
    ((window.innerWidth / window.innerHeight) * frustrum) / 2,
    frustrum / 2,
    -frustrum / 2,
    -50,
    50
  ); */

  useEffect(() => {
    if (ready) {
      const lerp = {
        current: 0,
        target: 0,
        ease: 0.1,
      };

      /* console.log(room, "sue"); */

      /* const gui = new GUI({ container: document.querySelector(".hero-main") }); */

      /* const obj = {
        colorObj: { r: 0, g: 0, b: 0 },
        intensity: 3,
      }; */

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
      const canvas = renderer.domElement;
      experienceRef.current.appendChild(canvas);

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
      /* const frustrum = 5;
      const orthographicCamera = new THREE.OrthographicCamera(
        ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
        ((window.innerWidth / window.innerHeight) * frustrum) / 2,
        frustrum / 2,
        -frustrum / 2,
        -50,
        50
      ); */
      const frustrum = 5;
      const orthographicCamera = new THREE.OrthographicCamera(
        ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
        ((window.innerWidth / window.innerHeight) * frustrum) / 2,
        frustrum / 2,
        -frustrum / 2,
        -50,
        50
      );
      create_camera(orthographicCamera);

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
      const actualRoom = roomObject.scene;
      scene.add(actualRoom);
      actualRoom.scale.set(0.0, 0.0, 0.0);
      actualRoom.position.y = 1;
      actualRoom.children.forEach((child) => {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child instanceof THREE.Group) {
          child.children.forEach((groupChild) => {
            groupChild.castShadow = true;
            groupChild.receiveShadow = true;
          });
        }

        if (child.name === "Aquarium") {
          let aquaGlass = child.children[0];
          aquaGlass.material = new THREE.MeshPhysicalMaterial();
          aquaGlass.material.roughness = 0;
          aquaGlass.material.color.set(0x549dd2);
          aquaGlass.material.ior = 3;
          aquaGlass.material.transmission = 1;
          aquaGlass.material.opacity = 1;
        }

        // Fix lamp opacity
        // Separate lamp and light
        if (child.name === "Plane005") {
          child.material = new THREE.MeshPhysicalMaterial();
          child.material.roughness = 0;
          child.material.color.set(0xffffff);
          child.material.ior = 3;
          child.material.transmission = 1;
          child.material.transparency = true;
          child.material.opacity = 0.5;
        }

        // Fix computer name
        if (child.name === "Monitor") {
          child.children[1].material = new THREE.MeshBasicMaterial({
            map: items.screen,
          });
        }

        if (child.name === "Floor") {
          child.position.x = 8.65263;
          child.position.z = -2.63444;
        }

        if (
          child.name === "Mailbox" ||
          /* child.name === "Floor_Pad" || */
          child.name === "Floor_Pad001" ||
          child.name === "Floor_Pad002" ||
          child.name === "Floor_Pad003" ||
          child.name === "Flower_Pad" ||
          child.name === "Flower001" ||
          child.name === "Flower002" ||
          child.name === "Lamp"
        ) {
          child.scale.set(0, 0, 0);
        }
        child.scale.set(0, 0, 0);
        /* if (
          child.name === "Wall" ||
          child.name === "Cube" ||
          child.name === "Floor"
        ) {
          child.scale.set(1, 1, 1);
        } */
        if (child.name === "Room_Cube") {
          /* child.scale.set(1, 1, 1); */
          child.scale.set(0, 0, 0);
          child.position.set(0, -1.5, 0);
          child.rotation.y = Math.PI / 4;
        }

        roomChildren[child.name.toLowerCase()] = child;
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
      const monitorLight = new THREE.RectAreaLight(0xffffff, 0, 0.724, 0.3515);
      monitorLight.position.set(-7.1, 8.3, -3.6);
      /* monitorLight.position.set(-9.56, 8.3, -1); */
      monitorLight.rotation.y = (Math.PI / 4) * 5;
      roomChildren["monitorLight"] = monitorLight;
      /* actualRoom.add(monitorLight); */

      const tankLight = new THREE.RectAreaLight(0xffffff, 0, 0.5, 1.015);
      tankLight.position.set(9.08244, 7.2, -0.510353);
      tankLight.rotation.x = -Math.PI / 2;
      tankLight.rotation.z = Math.PI / 4;
      roomChildren["tankLight"] = tankLight;
      //actualRoom.add(tankLight);

      const lampLight = new THREE.RectAreaLight(0xffffff, 0, 0.1, 0.1);
      lampLight.position.set(-8.72089, 1.215046, 13.5548);
      lampLight.rotation.x = -Math.PI / 2;
      lampLight.rotation.z = Math.PI / 4;
      roomChildren["lampLight"] = lampLight;
      //actualRoom.add(lampLight);

      // DARK THEME
      window.addEventListener("click", () => {
        if (themeRef.current) {
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
          /* GSAP.to(monitorLight, {
            intensity: 1,
          }); */
          /* GSAP.to(tankLight, {
            intensity: 1,
          });
          GSAP.to(lampLight, {
            intensity: 1,
          }); */
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
          /* GSAP.to(monitorLight, {
            intensity: 0,
          }); */
          /* GSAP.to(tankLight, {
            intensity: 0,
          });
          GSAP.to(lampLight, {
            intensity: 0,
          }); */
        }
      });
      /* console.log(actualRoom.position); */

      const rectLightHelper = new RectAreaLightHelper(monitorLight);
      monitorLight.add(rectLightHelper);

      /* gui.add(obj, "intensity", 0, 10).onChange(() => {
        sunLight.intesity = obj.intesity;
      }); */
      /* const grid = new THREE.GridHelper(20, 20);
      scene.add(grid); */

      // FLOOR
      const planeGeometry = new THREE.PlaneGeometry(100, 100);
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xfbf4e4,
        /* color: 0x000000, */
        /* color: 0x6e85b7, */
        /* color: 0xffffff, */
        side: THREE.BackSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = 0.95;
      /* plane.position.y = -0.4; */
      /* plane.material.color.setHex(0xfbf4e4); */
      /* plane.material.color.setHex(0x000000); */
      plane.receiveShadow = true;
      roomChildren["planeFloor"] = plane;
      scene.add(plane);

      /* gui.addColor(obj, "colorObj").onChange(() => {
        plane.material.color.copy(obj.colorObj);
        console.log(obj.colorObj);
      }); */

      // CIRCLES
      const circleGeometry = new THREE.CircleGeometry(5, 64);
      const circleMaterial = new THREE.MeshStandardMaterial({
        color: 0xdb929d,
      });
      const circleMaterial2 = new THREE.MeshStandardMaterial({
        color: 0x7bd0ad,
      });
      const circleMaterial3 = new THREE.MeshStandardMaterial({
        color: 0x95abe5,
      });

      const circleFirst = new THREE.Mesh(circleGeometry, circleMaterial);
      const circleSecond = new THREE.Mesh(circleGeometry, circleMaterial2);
      const circleThird = new THREE.Mesh(circleGeometry, circleMaterial3);

      circleFirst.position.y = -0.39;
      circleSecond.position.y = -0.38;
      circleThird.position.y = -0.37;

      circleFirst.scale.set(0, 0, 0);
      circleSecond.scale.set(0, 0, 0);
      circleThird.scale.set(0, 0, 0);

      circleFirst.rotation.x =
        circleSecond.rotation.x =
        circleThird.rotation.x =
          -Math.PI / 2;

      circleFirst.receiveShadow =
        circleSecond.receiveShadow =
        circleThird.receiveShadow =
          true;

      create_circle_first(circleFirst);
      create_circle_second(circleSecond);
      create_circle_third(circleThird);

      scene.add(circleFirst);
      scene.add(circleSecond);
      scene.add(circleThird);

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

      create_room_children(roomChildren);

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
