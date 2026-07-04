import { useEffect, useRef } from "react";
import { PLAYER_SPRITE } from "../../../entities/player/playerSprite";
import { SLIME_SPRITE } from "../../../entities/enemies/slime/slimeSprite";

// Carrega as spritesheets uma vez e expõe como refs (sem causar re-render
// quando terminam de carregar — o game loop lê o ref a cada frame).
export function useGameSprites() {
  const playerSpriteRef = useRef<HTMLImageElement | null>(null);
  const slimeWeakSpriteRef = useRef<HTMLImageElement | null>(null);
  const slimeStrongSpriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const playerImg = new Image();
    playerImg.src = PLAYER_SPRITE.src;
    playerImg.onload = () => {
      playerSpriteRef.current = playerImg;
    };

    const slimeWeakImg = new Image();
    slimeWeakImg.src = SLIME_SPRITE.weak.src;
    slimeWeakImg.onload = () => {
      slimeWeakSpriteRef.current = slimeWeakImg;
    };

    const slimeStrongImg = new Image();
    slimeStrongImg.src = SLIME_SPRITE.strong.src;
    slimeStrongImg.onload = () => {
      slimeStrongSpriteRef.current = slimeStrongImg;
    };
  }, []);

  return { playerSpriteRef, slimeWeakSpriteRef, slimeStrongSpriteRef };
}
