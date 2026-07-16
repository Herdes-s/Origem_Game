import { useEffect, useRef } from "react";
import { PLAYER_ATTACK_SPRITE, PLAYER_WALK_SPRITE } from "../../../entities/player/playerSprite";
import { SLIME_STRONG_ATTACK_SPRITE, SLIME_STRONG_DEATH_SPRITE, SLIME_STRONG_WALK_SPRITE, SLIME_WEAK_ATTACK_SPRITE, SLIME_WEAK_DEATH_SPRITE, SLIME_WEAK_WALK_SPRITE } from "../../../entities/enemies/slime/slimeSprite";
import { GOBLIN_ATTACK_SPRITE, GOBLIN_DEATH_SPRITE, GOBLIN_WALK_SPRITE } from "../../../entities/enemies/goblin/goblinSprite";

const SPRITE_SOURCES: Record<string, string> = {
  player_walk: PLAYER_WALK_SPRITE.src,
  player_attack: PLAYER_ATTACK_SPRITE.src,

  slime_weak_walk: SLIME_WEAK_WALK_SPRITE.src,
  slime_weak_attack: SLIME_WEAK_ATTACK_SPRITE.src,
  slime_weak_death: SLIME_WEAK_DEATH_SPRITE.src,
  slime_strong_walk: SLIME_STRONG_WALK_SPRITE.src,
  slime_strong_attack: SLIME_STRONG_ATTACK_SPRITE.src,
  slime_strong_death: SLIME_STRONG_DEATH_SPRITE.src,

  goblin_walk: GOBLIN_WALK_SPRITE.src,
  goblin_attack: GOBLIN_ATTACK_SPRITE.src,
  goblin_death: GOBLIN_DEATH_SPRITE.src,
}

export function useGameSprites() {
  const spritesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    for (const [key, src] of Object.entries(SPRITE_SOURCES)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        spritesRef.current.set(key, img);
      };
    }
  }, []);

  return spritesRef;
}
