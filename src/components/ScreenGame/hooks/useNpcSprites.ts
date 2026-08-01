import { useEffect, useRef } from "react";
import { listNpcSprites } from "../../../data/maps";

// Mesmo padrão de useBuildingSprites/useTileTextures/useItemIcons —
// carrega todo sprite de NPC (de qualquer mapa) uma vez, expõe como
// Map<spriteSrc, HTMLImageElement> em ref.
export function useNpcSprites() {
  const spritesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const src of listNpcSprites()) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        spritesRef.current.set(src, img);
      };
    }
  }, []);

  return spritesRef;
}
