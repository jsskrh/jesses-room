import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./Canvas.css";
import assets from "./assets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Canvas() {
  /* var events = require("events"); */
  /* const EventEmitter = require("events");
  const eventEmitter = new EventEmitter(); */

  const [items, setItems] = useState({});
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
        console.log("first ran");
        /* emit("ready"); */
        setItems(items);
        setReady(true);
      }
    };

    setLoaders();
    startLoading();
  }, []);

  useEffect(() => {
    // RENDERER
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
    const frustrum = 5;
    const orthographicCamera = new THREE.OrthographicCamera(
      ((-window.innerWidth / window.innerHeight) * frustrum) / 2, //note
      ((window.innerWidth / window.innerHeight) * frustrum) / 2,
      frustrum / 2,
      -frustrum / 2,
      -100,
      100
    );
    scene.add(orthographicCamera);

    // HELPERS
    const size = 10;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // LIGHTS
    const sunLight = new THREE.DirectionalLight("#ffffff", 3);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(1.5, 7, 3);
    scene.add(sunLight);
    /* sunLight.shadow.camera.far=set(x:number, y:number,z:number):THREE.Vector3 */
    const ambientLight = new THREE.AmbientLight("#ffffff", 1);
    scene.add(ambientLight);

    // ORBIT CONTROLS
    const controls = new OrbitControls(perspectiveCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;

    let start = Date.now();
    let current = start;
    let elapsed = 0;
    let delta = 16;

    // ROOM
    if (ready === true) {
      const room = items.room;
      const actualRoom = room.scene;
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
      });
      /* actualRoom.rotation.y = Math.PI * 2; */
    }

    /* const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material); */
    /* scene.add(cube); */

    perspectiveCamera.position.z = 5;

    const animate = () => {
      let currentTime = Date.now();
      delta = currentTime - current;
      current = currentTime;
      elapsed = current - start;
      requestAnimationFrame(animate);
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
  }, [ready]);

  /* useEffect(() => {
    if (ready === true) {
      const room = items.room;
      const actualRoom = room.scene;
      scene.add(actualRoom);
    }
  }, [ready]); */

  return <div className="experience" ref={experienceRef}></div>;
}

export default Canvas;
