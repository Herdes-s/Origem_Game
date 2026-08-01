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
import { playPlayerDeath } from "../../../entities/audio/soundEngine";
import { getCurrentMap, type Portal } from "../../../data/maps";
import { TILE_SIZE } from "../../../data/map";
import { computeDeltaScale } from "../../../entities/combat/deltaTime";
import { computeCarryCapacity, computeKnockbackMultiplier } from "../../../entities/items/weight";
import { findNearestPickup, type ItemPickup } from "../../../entities/items/world/itemPickup";
import { findNearestNpc } from "../../../entities/npc/npcInteraction";
import type { NpcConfig } from "../../../data/maps";

const PORTAL_COOLDOWN_FRAMES = 30; // ~0.5s — evita re-teleportar no mesmo frame/instante

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
  pickupsRef: React.RefObject<ItemPickup[]>;
  onXpGained: (amount: number) => void;
  onPortalEnter: (portal: Portal) => void;
  onPlayerDeath: () => void;
  onNearbyPickupChange: (pickupId: number | null) => void;
  onNearNpcChange: (npc: NpcConfig | null) => void;
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
  pickupsRef,
  onXpGained,
  onPortalEnter,
  onPlayerDeath,
  onNearbyPickupChange,
  onNearNpcChange,
}: Args) {
  const rafRef = useRef<number>(0);
  const portalCooldownRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  // Guarda o último id avisado pro React, pra só chamar onNearbyPickupChange
  // quando o valor realmente MUDA (não a cada frame) — evita re-render de
  // 60fps só pra mostrar/esconder o botão "Coletar".
  const lastNearbyPickupIdRef = useRef<number | null>(null);
  const lastNearNpcIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const dt = computeDeltaScale(timestamp, lastTimeRef);

      if (gameStateRef.current === "playing") {
        // Stats derivados dos atributos atuais (FOR/DES/CON/Precisão +
        // Peso, esse último já aplicando a penalidade de carga por dentro
        // de computeDerivedStats — ver playerAttributes.ts). Recalcular
        // por frame é barato e mantém a HUD e o combate sempre em dia com
        // o que estiver em attributesRef.
        const stats = computeDerivedStats(attributesRef.current);
        hudRef.current.hpMax = stats.hpMax;

        // Multiplicador de peso pro knockback RECEBIDO (o DADO já vem
        // embutido em stats.knockbackForce) — mesma fórmula, reaproveitada
        // na direção contrária: carregado, é mais fácil de ser empurrado.
        const carryCapacity = computeCarryCapacity(attributesRef.current.primary.for);
        const weightMultiplier = computeKnockbackMultiplier(
          attributesRef.current.secondary.peso,
          carryCapacity,
        );

        // Movimento do player — lógica isolada em playerMovement.ts
        const xpGained = updatePlayerMovement(
          posRef.current,
          keysRef.current,
          attackRef.current,
          enemiesRef.current,
          directionRef,
          hudRef.current,
          damageNumbersRef.current,
          pickupsRef.current,
          stats,
          dt,
        );

        if (xpGained > 0) onXpGained(xpGained);

        // Atualiza todos os inimigos — IA, movimento e dano
        updateEnemies(
          enemiesRef.current,
          posRef.current,
          hudRef.current,
          attackRef,
          stats.defense,
          weightMultiplier,
          damageNumbersRef.current,
          dt,
        );

        // Covis de spawn — nasce um inimigo novo onde o anterior morreu
        updateSpawnDens(densRef.current, enemiesRef.current, dt);

        // Remove inimigos cuja animação de morte já terminou
        enemiesRef.current = enemiesRef.current.filter(
          (e) => !e.deathAnimDone,
        );

        // Remove damage numbers expirados
        damageNumbersRef.current = damageNumbersRef.current.filter(
          (dn) => dn.timer > 0,
        );

        // Item largado mais próximo do player, dentro do alcance de coleta
        // — só avisa o React (pra mostrar/esconder o botão "Coletar")
        // quando o id muda, não a cada frame.
        const nearestPickup = findNearestPickup(pickupsRef.current, posRef.current);
        const nearestId = nearestPickup?.id ?? null;
        if (nearestId !== lastNearbyPickupIdRef.current) {
          lastNearbyPickupIdRef.current = nearestId;
          onNearbyPickupChange(nearestId);
        }

        // NPC mais próximo do player, dentro do alcance de interação
        // DELE (cada NPC pode ter um raio diferente) — mesmo padrão do
        // pickup: só avisa o React na borda de mudança, e null quando
        // ninguém está por perto (quem ouve decide o que fazer, ex:
        // abrir o CraftPanel sozinho).
        const nearestNpc = findNearestNpc(getCurrentMap().npcs, posRef.current);
        const nearestNpcId = nearestNpc?.id ?? null;
        if (nearestNpcId !== lastNearNpcIdRef.current) {
          lastNearNpcIdRef.current = nearestNpcId;
          onNearNpcChange(nearestNpc);
        }

        if (portalCooldownRef.current > 0) {
          portalCooldownRef.current -= dt;
        } else {
          const playerTx = Math.floor(posRef.current.x / TILE_SIZE);
          const playerTy = Math.floor(posRef.current.y / TILE_SIZE);
          const portal = getCurrentMap().portals.find(
            (p) => p.tx === playerTx && p.ty === playerTy,
          );

          if (portal) {
            portalCooldownRef.current = PORTAL_COOLDOWN_FRAMES;
            onPortalEnter(portal);
          }
        }

        // Checa morte do player
        if (hudRef.current.hp <= 0) {
          gameStateRef.current = "dead";
          playPlayerDeath();
          onPlayerDeath();
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
    pickupsRef,
    onXpGained,
    onPortalEnter,
    onPlayerDeath,
    onNearbyPickupChange,
    onNearNpcChange,
  ]);
}
