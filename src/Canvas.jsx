import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Canvas.css";
import assets from "./assets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GSAP from "gsap";

function Canvas() {
  const [items, setItems] = useState({});
  const [actualRoom, setActualRoom] = useState({});
  const [room, setRoom] = useState({});
  const [ready, setReady] = useState(false);

  const experienceRef = useRef(null);
  const experience = experienceRef.current;

  useEffect(() => {
    const queue = assets.length;
    let items = {};
    let loaded = 0;
    let loaders = {};

    const setLoaders = () => {
      loaders.gltfLoader = new GLTFLoader();
      loaders.dracoLoader = new DRACOLoader();
      loaders.dracoLoader.setDecoderPath(
        "/node_modules/three/examples/js/libs/draco/"
      );
      loaders.gltfLoader.setDRACOLoader(loaders.dracoLoader);
    };

    const startLoading = () => {
      for (const asset of assets) {
        if (asset.type === "glbModel") {
          loaders.gltfLoader.load(asset.path, (file) => {
            singleAssetLoaded(asset, file);
          });
        } else if (asset.type === "videoTexture") {
          let video = {};
          let videoTexture = {};

          video[asset.name] = document.createElement("video");
          video[asset.name].src = asset.path;
          video[asset.name].muted = true;
          video[asset.name].playsInline = true;
          video[asset.name].autoplay = true;
          video[asset.name].loop = true;
          video[asset.name].play();

          videoTexture[asset.name] = new THREE.VideoTexture(video[asset.name]);
          videoTexture[asset.name].flipY = true;
          videoTexture[asset.name].minFilter = THREE.NearestFilter;
          videoTexture[asset.name].magFilter = THREE.NearestFilter;
          videoTexture[asset.name].generateMipMaps = false;
          videoTexture[asset.name].encoding = THREE.sRGBEncoding;
          singleAssetLoaded(asset, videoTexture[asset.name]);
        }
      }
    };

    const singleAssetLoaded = (asset, file) => {
      items[asset.name] = file;
      loaded++;

      if (loaded === queue) {
        setItems(items);
        setReady(true);
      }
    };

    setLoaders();
    startLoading();
  }, []);

  /* useEffect(() => {
    renderer.setViewport(0, 0, innerWidth, innerHeight);
    renderer.render(scene, orthographicCamera);
  }, [ready]); */

  useEffect(() => {
    if (ready) {
      const lerp = {
        current: 0,
        target: 0,
        ease: 0.1,
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
      setRoom(room);
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

      // FLOOR
      const planeGeometry = new THREE.PlaneGeometry(100, 100);
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff /* 6e85b7 */,
        side: THREE.BackSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = -0.3;
      plane.receiveShadow = true;
      scene.add(plane);

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
