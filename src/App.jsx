import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Canvas from "./Canvas";
import Page from "./Page";
import Animations from "./Animations";
import assets from "./assets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";
import { useStateValue } from "./StateProvider";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ASScroll from "@ashthornton/asscroll";
import Preloader from "./Preloader";

function App() {
  const [{ theme }] = useStateValue();

  const [items, setItems] = useState({});
  const [ready, setReady] = useState(false);
  const [room, setRoom] = useState({});

  const setupASScroll = () => {
    // https://github.com/ashthornton/asscroll
    const asscroll = new ASScroll({
      ease: 0.3,
      disableRaf: true,
    });

    GSAP.ticker.add(asscroll.update);

    ScrollTrigger.defaults({
      scroller: asscroll.containerElement,
    });

    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
      scrollTop(value) {
        if (arguments.length) {
          asscroll.currentPos = value;
          return;
        }
        return asscroll.currentPos;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // fixedMarkers: true,
    });

    asscroll.on("update", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", asscroll.resize);

    requestAnimationFrame(() => {
      asscroll.enable({
        newScrollElements: document.querySelectorAll(
          ".gsap-marker-start, .gsap-marker-end, [asscroll]"
        ),
      });
    });
    return asscroll;
  };

  useEffect(() => {
    if (ready) {
      const asscroll = setupASScroll();
    }
  }, [ready]);

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
        setRoom(items.room);
        setReady(true);
      }
    };

    setLoaders();
    startLoading();
  }, []);

  /* useEffect(() => {
    if (ready) {
      setRoom(items.scene);
    }
  }); */

  return (
    <div
      className={theme ? "App dark-theme" : "App light-theme"}
      asscroll-container="true"
    >
      <Animations roomObject={room} ready={ready} items={items}>
        <Canvas ready={ready} items={items} roomObject={room} />
        <Preloader />
        {ready && <Page roomObject={room} />}
      </Animations>
    </div>
  );
}

export default App;
