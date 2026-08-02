import { useEffect, useRef } from "react";
import { listResourceNodeSprites } from "../../../data/maps";

// Mesmo padrão de useBuildingSprites/useNpcSprites/useTileTextures.
export function useResourceNodeSprites() {
  const spritesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const src of listResourceNodeSprites()) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        spritesRef.current.set(src, img);
      };
    }
  }, []);

  return spritesRef;
}
