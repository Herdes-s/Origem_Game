// Um "nó de recurso" é um coletável FIXO no mapa (pedra, macieira...) —
// diferente de ItemPickup (que nasce e morre: drop de inimigo, descarte
// do inventário). Mesma config serve pra qualquer coletável parado; só

import { TILE_SIZE } from "../../../data/map";
import type { Position } from "../../../types/game";

// muda o que cada um entrega e se/quando recarrega.
export type ResourceNodeConfig = {
  id: string; // único no jogo inteiro, não só no mapa — usado no rastreio global
  itemId: string;
  quantityMin: number;
  quantityMax: number;
  tileX: number;
  tileY: number;
  interactionRadius: number; // px — alcance pra virar coletável sozinho
  // null = depois de colher, NUNCA recarrega nessa sessão (ex: pedra —
  // "pega com a mão", não é uma coisa viva). Número = ms de tempo de
  // JOGO (não real — ver entities/time/gameTime.ts) até voltar a dar.
  regrowGameMs: number | null;
  spriteSrc?: string; // imagem própria (árvore) — sem isso, cai no ícone/cor do item (bom pra pedra, sem precisar de arte nova)
  size?: number; // px de desenho — default é o tamanho de ícone comum; árvore usa um valor maior
};

// Estado de UM nó específico, em runtime — precisa sobreviver a trocar
// de mapa (diferente de inimigo/pickup, que resetam), porque "recarregar
// em X horas de jogo" só faz sentido se o relógio continuar contando
// mesmo enquanto o player está noutro mapa. `mapId` é denormalizado aqui
// pra filtrar "quais nós pertencem ao mapa atual" sem precisar
// re-agrupar a cada frame.
export type ResourceNodeState = ResourceNodeConfig & {
  mapId: string;
  depletedAtGameMs: number | null; // null = disponível agora
};

export function isNodeAvailable(
  node: ResourceNodeState,
  currentGameMs: number,
): boolean {
  if (node.depletedAtGameMs === null) return true;
  if (node.regrowGameMs === null) return false; // nunca recarrega nessa sessão
  return currentGameMs - node.depletedAtGameMs >= node.regrowGameMs;
}

// Acha o nó DISPONÍVEL mais próximo do player, dentro do alcance de
// CADA UM, só entre os nós do mapa atual — mesmo padrão de
// findNearestPickup/findNearestNpc.
export function findNearestAvailableNode(
  nodes: ResourceNodeState[],
  mapId: string,
  playerPos: Position,
  currentGameMs: number,
): ResourceNodeState | null {
  let nearest: ResourceNodeState | null = null;
  let nearestDist = Infinity;

  for (const node of nodes) {
    if (node.mapId !== mapId) continue;
    if (!isNodeAvailable(node, currentGameMs)) continue;

    const worldX = node.tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = node.tileY * TILE_SIZE + TILE_SIZE / 2;
    const d = Math.hypot(worldX - playerPos.x, worldY - playerPos.y);

    if (d <= node.interactionRadius && d < nearestDist) {
      nearest = node;
      nearestDist = d;
    }
  }

  return nearest;
}

export function rollHarvestQuantity(node: ResourceNodeConfig): number {
  return Math.round(
    node.quantityMin + Math.random() * (node.quantityMax - node.quantityMin),
  );
}
