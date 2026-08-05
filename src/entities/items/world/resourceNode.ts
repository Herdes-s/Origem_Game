import type { Position } from "../../../types/game";
import type { Inventory } from "../itemTypes";
import { countItem } from "../inventory";
import { TILE_SIZE } from "../../../data/map";

// O que um nó entrega numa colheita — usado tanto pro yield PRIMÁRIO
// quanto pro SECUNDÁRIO (ver ResourceNodeConfig). `requiredTool` é só
// POSSUIR a ferramenta no inventário — não equipa, não gasta.
export type ResourceYield = {
  itemId: string;
  quantityMin: number;
  quantityMax: number;
  requiredTool?: string; // itemId da ferramenta (ex: "machado")
  actionLabel: string; // texto do botão (ex: "🍎 Colher", "🪓 Cortar")
};

// Um "nó de recurso" é um coletável FIXO no mapa (pedra, macieira,
// árvore de madeira...) — diferente de ItemPickup (que nasce e morre:
// drop de inimigo, descarte do inventário).
export type ResourceNodeConfig = {
  id: string; // único no jogo inteiro, não só no mapa — usado no rastreio global
  tileX: number;
  tileY: number;
  interactionRadius: number; // px — alcance pra virar coletável sozinho
  primary: ResourceYield;
  // null = depois de colher o PRIMÁRIO, nunca recarrega nessa sessão
  // (ex: pedra — não é uma coisa viva). Número = ms de tempo de JOGO até
  // voltar a dar (ver entities/time/gameTime.ts).
  regrowGameMs: number | null;
  spriteSrc?: string; // visual com o primário disponível — sem isso, cai no ícone/cor do item
  spriteSrcDepleted?: string; // visual com o primário esgotado — sem isso, some da tela nesse estado
  size?: number; // px de desenho — default é tamanho de ícone comum
  // Yield extra, só existe enquanto o PRIMÁRIO está esgotado (ex: madeira
  // da macieira "sem fruto") — some de novo assim que o primário
  // recarregar, e só dá uma vez por ciclo de esgotamento.
  secondary?: ResourceYield;
};

// Estado de UM nó específico, em runtime — precisa sobreviver a trocar
// de mapa (diferente de inimigo/pickup, que resetam), porque "recarregar
// em X horas de jogo" só faz sentido se o relógio continuar contando
// mesmo enquanto o player está em outro mapa. `mapId` é denormalizado
// aqui pra filtrar "quais nós pertencem ao mapa atual" sem re-agrupar a
// cada frame.
export type ResourceNodeState = ResourceNodeConfig & {
  mapId: string;
  depletedAtGameMs: number | null; // null = primário disponível agora
  secondaryHarvestedAtGameMs: number | null; // null = secundário ainda não foi colhido nesse ciclo
};

export function isPrimaryAvailable(node: ResourceNodeState, currentGameMs: number): boolean {
  if (node.depletedAtGameMs === null) return true;
  if (node.regrowGameMs === null) return false;
  return currentGameMs - node.depletedAtGameMs >= node.regrowGameMs;
}

// O secundário só existe enquanto o primário está esgotado (ex: só dá
// pra cortar madeira da macieira DEPOIS de colher as maçãs), e só uma
// vez por ciclo — comparar com `depletedAtGameMs` (não um booleano) faz
// isso resetar sozinho: cada novo esgotamento do primário muda esse
// valor, então qualquer colheita de secundário de um ciclo ANTERIOR
// automaticamente conta como "already expired" pro ciclo atual.
export function isSecondaryAvailable(node: ResourceNodeState, currentGameMs: number): boolean {
  if (!node.secondary) return false;
  if (isPrimaryAvailable(node, currentGameMs)) return false;
  if (node.secondaryHarvestedAtGameMs === null) return true;
  return node.secondaryHarvestedAtGameMs < (node.depletedAtGameMs ?? 0);
}

export function hasTool(inventory: Inventory, requiredTool?: string): boolean {
  if (!requiredTool) return true;
  return countItem(inventory, requiredTool) > 0;
}

// O que dá pra colher AGORA nesse nó (ou null se nada) — já considera
// tempo de recarga E se o player tem a ferramenta certa. Primário tem
// prioridade sobre secundário (nunca os dois ao mesmo tempo, por
// definição — um só existe quando o outro está esgotado).
export function getActiveYield(
  node: ResourceNodeState,
  currentGameMs: number,
  inventory: Inventory,
): { yieldConfig: ResourceYield; isSecondary: boolean } | null {
  if (isPrimaryAvailable(node, currentGameMs) && hasTool(inventory, node.primary.requiredTool)) {
    return { yieldConfig: node.primary, isSecondary: false };
  }
  if (node.secondary && isSecondaryAvailable(node, currentGameMs) && hasTool(inventory, node.secondary.requiredTool)) {
    return { yieldConfig: node.secondary, isSecondary: true };
  }
  return null;
}

// Acha o nó com ALGO colhível AGORA mais próximo do player (considera
// ferramenta — um nó que precisa de picareta sem o player ter uma não
// conta como disponível), dentro do alcance de CADA UM, só entre os nós
// do mapa atual.
export function findNearestAvailableNode(
  nodes: ResourceNodeState[],
  mapId: string,
  playerPos: Position,
  currentGameMs: number,
  inventory: Inventory,
): ResourceNodeState | null {
  let nearest: ResourceNodeState | null = null;
  let nearestDist = Infinity;

  for (const node of nodes) {
    if (node.mapId !== mapId) continue;
    if (!getActiveYield(node, currentGameMs, inventory)) continue;

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

export function rollHarvestQuantity(y: ResourceYield): number {
  return Math.round(y.quantityMin + Math.random() * (y.quantityMax - y.quantityMin));
}
