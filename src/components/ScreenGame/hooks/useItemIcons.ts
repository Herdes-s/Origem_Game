import { useEffect, useRef } from "react";
import { ITEM_DEFINITIONS } from "../../../entities/items/itemRegistry";

// Carrega os ícones de item (só os que têm iconSrc definido) uma vez e
// expõe como Map<itemId, HTMLImageElement> em ref — mesmo padrão de
// useTileTextures/useGameSprites. Item sem iconSrc, ou que ainda não
// carregou, simplesmente não entra no Map, e renderPickups cai pro
// círculo de cor (mesmo placeholder de sempre).
export function useItemIcons() {
  const iconsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const def of Object.values(ITEM_DEFINITIONS)) {
      if (!def.iconSrc) continue;

      const img = new Image();
      img.src = def.iconSrc;
      img.onload = () => {
        iconsRef.current.set(def.id, img);
      };
    }
  }, []);

  return iconsRef;
}
