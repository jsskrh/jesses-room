import { useState, useEffect, useRef } from "react";
import "./App.css";
import Canvas from "./Canvas";
import Page from "./Page";
import assets from "./assets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as THREE from "three";
import { useStateValue } from "./StateProvider";

function App() {
  const [{ theme }, dispatch] = useStateValue();

  const [items, setItems] = useState({});
  const [ready, setReady] = useState(false);

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

  return (
    <div className={theme ? "App dark-theme" : "App light-theme"}>
      <Canvas ready={ready} items={items} />
      {ready && <Page />}
    </div>
  );
}

export default App;
