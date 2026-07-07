import { useEffect, useRef } from "react";
import type {
  AttackState,
  DamageNumber,
  GameKeys,
  GameState,
  HudState,
  Position,
} from "../../../types/game";
import type { Enemy } from "../../../entities/enemies/enemyTypes";
import { updatePlayerMovement } from "../../../entities/player/playerMovement";
import { updateEnemies } from "../../../entities/enemies/enemyAI";
import type { PlayerAttributes } from "../../../entities/player/playerAttributes";
import { computeDerivedStats } from "../../../entities/player/playerAttributes";
import { updateSpawnDens, type SpawnDen } from "../../../entities/enemies/spawnDen";

type Args = {
  posRef: React.RefObject<Position>;
  keysRef: React.RefObject<GameKeys>;
  attackRef: React.RefObject<AttackState>;
  enemiesRef: React.RefObject<Enemy[]>;
  directionRef: React.RefObject<string>;
  hudRef: React.RefObject<HudState>;
  damageNumbersRef: React.RefObject<DamageNumber[]>;
  gameStateRef: React.RefObject<GameState>;
  attributesRef: React.RefObject<PlayerAttributes>;
  densRef: React.RefObject<SpawnDen[]>;
};

// Loop principal de atualização (não é o de desenho, esse fica no
// ScreenGame): movimento do player, IA dos inimigos, limpeza de mortos e
// damage numbers expirados, e checagem de morte do player. Roda em
// requestAnimationFrame próprio, independente do RAF do ScreenGame.
export function useGameLoop({
  posRef,
  keysRef,
  attackRef,
  enemiesRef,
  directionRef,
  hudRef,
  damageNumbersRef,
  gameStateRef,
  attributesRef,
  densRef,
}: Args) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      if (gameStateRef.current === "playing") {
        // Stats derivados dos atributos atuais (FOR/DES/CON/Precisão).
        // Recalcular por frame é barato (só aritmética) e mantém a HUD e o
        // combate sempre em dia com o que estiver em attributesRef — inclui
        // futuras mudanças por level up sem precisar de plumbing extra.
        const stats = computeDerivedStats(attributesRef.current);
        hudRef.current.hpMax = stats.hpMax;

        // Movimento do player — lógica isolada em playerMovement.ts
        updatePlayerMovement(
          posRef.current,
          keysRef.current,
          attackRef.current,
          enemiesRef.current,
          directionRef,
          hudRef.current,
          damageNumbersRef.current,
          stats,
        );

        // Atualiza todos os inimigos — IA, movimento e dano
        updateEnemies(
          enemiesRef.current,
          posRef.current,
          hudRef.current,
          attackRef,
        );

        // Covis de spawn — nasce um inimigo novo onde o anterior morreu
        updateSpawnDens(densRef.current, enemiesRef.current);

        // Remove inimigos cuja animação de morte já terminou
        enemiesRef.current = enemiesRef.current.filter(
          (e) => !e.deathAnimDone,
        );

        // Remove damage numbers expirados
        damageNumbersRef.current = damageNumbersRef.current.filter(
          (dn) => dn.timer > 0,
        );

        // Checa morte do player
        if (hudRef.current.hp <= 0) {
          gameStateRef.current = "dead";
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [
    posRef,
    keysRef,
    attackRef,
    enemiesRef,
    directionRef,
    hudRef,
    damageNumbersRef,
    gameStateRef,
    attributesRef,
    densRef,
  ]);
}
