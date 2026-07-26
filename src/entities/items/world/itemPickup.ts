import type { Position } from "../../../types/game";

// Um item largado no CHÃO — diferente de ItemDefinition (que descreve o
// que o item É, em itemRegistry.ts). Isso aqui é só uma instância
// efêmera no mundo: nasce de um drop de inimigo ou de um descarte do
// inventário, e morre ao ser coletado. Não entra no save (mesmo
// princípio de inimigo/covil na v0.2 — "regenerado a cada carregamento",
// só que pickup nem regenera, simplesmente some).
export type ItemPickup = {
  id: number;
  itemId: string;
  quantity: number;
  x: number;
  y: number;
};

let nextPickupId = 1;

export function createItemPickup(
  itemId: string,
  quantity: number,
  pos: Position,
): ItemPickup {
  return { id: nextPickupId++, itemId, quantity, x: pos.x, y: pos.y };
}

// Alcance pra aparecer o botão "Coletar" — não é coleta automática por
// encostar, o player precisa confirmar (ver GamePage/index.tsx).
export const PICKUP_COLLECT_RADIUS = 40;

// Acha o pickup mais próximo do player, dentro do alcance de coleta —
// null se não tiver nenhum por perto. Chamado a cada frame no game loop,
// mas é só uma varredura linear numa lista pequena, barato o bastante.
export function findNearestPickup(
  pickups: ItemPickup[],
  playerPos: Position,
): ItemPickup | null {
  let nearest: ItemPickup | null = null;
  let nearestDist = PICKUP_COLLECT_RADIUS;

  for (const pickup of pickups) {
    const d = Math.hypot(pickup.x - playerPos.x, pickup.y - playerPos.y);
    if (d <= nearestDist) {
      nearest = pickup;
      nearestDist = d;
    }
  }

  return nearest;
}
