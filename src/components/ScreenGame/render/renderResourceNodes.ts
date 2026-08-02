import type { ResourceNodeState } from "../../../entities/items/world/resourceNode";
import { isNodeAvailable } from "../../../entities/items/world/resourceNode";
import { getItemDefinition } from "../../../entities/items/itemRegistry";
import { TILE_SIZE } from "../../../data/map";

const DEFAULT_SIZE = 24; // sem spriteSrc próprio (pedra) — ícone modesto, tipo um pickup grande

// Desenha os nós de recurso do mapa atual. Só os do mapId certo (a lista
// é global, sobrevive a trocar de mapa — ver resourceNode.ts). Nó
// indisponível (colhido, ainda recarregando) não desenha nada — some da
// tela até voltar.
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
) {
  for (const node of nodes) {
    if (node.mapId !== mapId) continue;
    if (!isNodeAvailable(node, currentGameMs)) continue;

    const size = node.size ?? DEFAULT_SIZE;
    const worldX = node.tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = node.tileY * TILE_SIZE + TILE_SIZE / 2;
    const drawX = worldX - camX - size / 2;
    const drawY = worldY - camY - size / 2;

    if (drawX + size < 0 || drawX > screenW || drawY + size < 0 || drawY > screenH) {
      continue;
    }

    const img = node.spriteSrc ? nodeSprites.get(node.spriteSrc) : undefined;

    if (img) {
      ctx.drawImage(img, drawX, drawY, size, size);
      continue;
    }

    // sem sprite própria (pedra) — cai no ícone/cor do item que entrega,
    // mesmo placeholder que os pickups já usam
    const def = getItemDefinition(node.itemId);
    ctx.beginPath();
    ctx.arc(worldX - camX, worldY - camY, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = def?.color ?? "#94a3b8";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
