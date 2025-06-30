// src/hooks/useAssetLoader.js
import { useState, useEffect } from "react";

const useAssetLoader = (assets) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = assets.length;

    if (totalAssets === 0) {
      setLoaded(true);
      return;
    }

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === totalAssets) {
        setLoaded(true);
      }
    };

    const handleError = () => {
      setError(true);
    };

    assets.forEach((asset) => {
      if (asset.endsWith(".mp4") || asset.endsWith(".wav")) {
        const element = document.createElement("video");
        element.src = asset;
        element.addEventListener("canplaythrough", handleLoad, { once: true });
        element.addEventListener("error", handleError, { once: true });
      } else if (asset.endsWith(".jpg") || asset.endsWith(".png") || asset.endsWith(".svg")) {
        const element = new Image();
        element.src = asset;
        element.addEventListener("load", handleLoad, { once: true });
        element.addEventListener("error", handleError, { once: true });
      } else {
        // For other asset types, you might need different loading strategies
        handleLoad();
      }
    });
  }, [assets]);

  return { loaded, error };
};

export default useAssetLoader;