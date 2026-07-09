import { useEffect, useRef } from "react";
import { listTileTextures } from "../../../data/tiles";

// Carrega as texturas de tile (floor, wall, água...) uma vez e expõe como
// um Map<tileId, HTMLImageElement> em ref — igual useGameSprites faz pros
// personagens. Tiles sem textura definida (ou que ainda não carregaram)
// simplesmente não aparecem no Map, e renderMap cai pro fillStyle de cor.
export function useTileTextures() {
  const texturesRef = useRef<Map<number, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const { id, src } of listTileTextures()) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        texturesRef.current.set(id, img);
      };
    }
  }, []);

  return texturesRef;
}
