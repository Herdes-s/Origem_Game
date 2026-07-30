import { useEffect, useRef } from "react";
import { listBuildingSprites } from "../../../data/maps";

// Carrega todo sprite de prédio (de qualquer mapa) uma vez e expõe como
// Map<spriteSrc, HTMLImageElement> em ref — mesmo padrão de
// useTileTextures/useGameSprites/useItemIcons. Prédio que ainda não
// carregou simplesmente não aparece no Map; renderBuildings.ts pula ele
// nesse frame (aparece assim que carregar, sem quebrar nada).
export function useBuildingSprites() {
  const spritesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const src of listBuildingSprites()) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        spritesRef.current.set(src, img);
      };
    }
  }, []);

  return spritesRef;
}
