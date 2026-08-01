import type { Position } from "../../types/game";
import type { NpcConfig } from "./npcTypes";
import { TILE_SIZE } from "../../data/map";

// Acha o NPC mais próximo do player, dentro do alcance de interação de
// CADA UM (não um raio global — um NPC pode ter alcance maior/menor que
// outro). null se ninguém por perto. Chamado a cada frame no game loop,
// mas é só uma varredura linear numa lista pequena (poucos NPCs por
// mapa), barato o bastante.
export function findNearestNpc(npcs: NpcConfig[], playerPos: Position): NpcConfig | null {
  let nearest: NpcConfig | null = null;
  let nearestDist = Infinity;

  for (const npc of npcs) {
    const npcX = npc.tileX * TILE_SIZE + TILE_SIZE / 2;
    const npcY = npc.tileY * TILE_SIZE + TILE_SIZE / 2;
    const d = Math.hypot(npcX - playerPos.x, npcY - playerPos.y);

    if (d <= npc.interactionRadius && d < nearestDist) {
      nearest = npc;
      nearestDist = d;
    }
  }

  return nearest;
}
