import type { ResourceNodeState } from "../../../entities/items/world/resourceNode";
import { isPrimaryAvailable } from "../../../entities/items/world/resourceNode";
import { getItemDefinition } from "../../../entities/items/itemRegistry";
import { TILE_SIZE } from "../../../data/map";

const DEFAULT_SIZE = 24; // sem spriteSrc próprio (pedra) — ícone modesto, tipo um pickup grande
const FALLBACK_ICON_SIZE = 20; // tamanho do ícone do ITEM (não da sprite própria do nó) — mesmo valor de renderPickups.ts

// Desenha os nós de recurso do mapa atual. Só os do mapId certo (a lista
// é global, sobrevive a trocar de mapa — ver resourceNode.ts).
//
// Prioridade de visual, do mais específico pro mais genérico:
// 1) sprite PRÓPRIA do nó (spriteSrc/spriteSrcDepleted — árvore, por
//    exemplo) — cobre o nó inteiro, não é só um "ícone"
// 2) ícone do ITEM que ele entrega (ItemDefinition.iconSrc — pedra,
//    galho...) — mesmo ícone que já aparece no inventário/pickup
// 3) círculo com a cor do item — placeholder final, se nem isso existir
export function renderResourceNodes(
  ctx: CanvasRenderingContext2D,
  nodes: ResourceNodeState[],
  mapId: string,
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  currentGameMs: number,
  nodeSprites: Map<string, HTMLImageElement>,
  itemIcons: Map<string, HTMLImageElement>,
) {
  for (const node of nodes) {
    if (node.mapId !== mapId) continue;

    const available = isPrimaryAvailable(node, currentGameMs);
    const nodeSpriteSrc = available ? node.spriteSrc : node.spriteSrcDepleted;
    if (!available && !nodeSpriteSrc) continue; // esgotado sem variante — some da tela

    const size = node.size ?? DEFAULT_SIZE;
    const worldX = node.tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = node.tileY * TILE_SIZE + TILE_SIZE / 2;
    const drawX = worldX - camX - size / 2;
    const drawY = worldY - camY - size / 2;

    if (drawX + size < 0 || drawX > screenW || drawY + size < 0 || drawY > screenH) {
      continue;
    }

    const nodeImg = nodeSpriteSrc ? nodeSprites.get(nodeSpriteSrc) : undefined;

    if (nodeImg) {
      ctx.drawImage(nodeImg, drawX, drawY, size, size);
      continue;
    }

    if (!available) continue; // esgotado, sem sprite própria carregada ainda — nada a desenhar

    const def = getItemDefinition(node.primary.itemId);
    const itemIcon = itemIcons.get(node.primary.itemId);

    if (itemIcon) {
      const iconDrawX = worldX - camX - FALLBACK_ICON_SIZE / 2;
      const iconDrawY = worldY - camY - FALLBACK_ICON_SIZE / 2;
      ctx.drawImage(itemIcon, iconDrawX, iconDrawY, FALLBACK_ICON_SIZE, FALLBACK_ICON_SIZE);
      continue;
    }

    // sem sprite própria E sem ícone de item — cai no círculo de cor,
    // mesmo placeholder final que os pickups já usam
    ctx.beginPath();
    ctx.arc(worldX - camX, worldY - camY, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = def?.color ?? "#94a3b8";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
