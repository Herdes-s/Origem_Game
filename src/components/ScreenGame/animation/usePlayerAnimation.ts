import { useRef } from "react";
import type { AttackState, GameKeys, GameState } from "../../../types/game";
import {
  PLAYER_ATTACK_FRAME_SPEED,
  PLAYER_SPRITE,
} from "../../../entities/player/playerSprite";

// Estado de animação do player (walk + punch) e leitura de direção pelas
// teclas pressionadas. Tudo em refs — não deve causar re-render a 60fps.
export function usePlayerAnimation() {
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);

  const attackFrameIndexRef = useRef(0);
  const attackFrameTimerRef = useRef(0);
  const isAttackingRef = useRef(false);

  // Chamado uma vez por frame do game loop. Atualiza directionRef.current
  // conforme as teclas e avança os frames de walk/punch.
  function update(
    keys: GameKeys,
    attack: AttackState,
    gameState: GameState,
    directionRef: React.RefObject<string>,
  ) {
    let moving = false;

    if (keys["ArrowDown"] || keys["s"]) {
      directionRef.current = "down";
      moving = true;
    }
    if (keys["ArrowUp"] || keys["w"]) {
      directionRef.current = "up";
      moving = true;
    }
    if (keys["ArrowLeft"] || keys["a"]) {
      directionRef.current = "left";
      moving = true;
    }
    if (keys["ArrowRight"] || keys["d"]) {
      directionRef.current = "right";
      moving = true;
    }

    // Animação de ataque (punch)
    if (attack.active && gameState === "playing") {
      isAttackingRef.current = true;
      attackFrameTimerRef.current++;
      if (attackFrameTimerRef.current >= PLAYER_ATTACK_FRAME_SPEED) {
        attackFrameTimerRef.current = 0;
        attackFrameIndexRef.current =
          (attackFrameIndexRef.current + 1) % PLAYER_SPRITE.frameCount;
      }
    } else if (isAttackingRef.current) {
      attackFrameIndexRef.current = 0;
      attackFrameTimerRef.current = 0;
      isAttackingRef.current = false;
    }

    // Animação de caminhada (walk)
    if (moving && gameState === "playing") {
      frameTimerRef.current++;
      if (frameTimerRef.current >= PLAYER_SPRITE.frameSpeed) {
        frameTimerRef.current = 0;
        frameIndexRef.current =
          (frameIndexRef.current + 1) % PLAYER_SPRITE.frameCount;
      }
    } else {
      frameIndexRef.current = 0;
      frameTimerRef.current = 0;
    }

    return moving;
  }

  return { frameIndexRef, attackFrameIndexRef, update };
}
