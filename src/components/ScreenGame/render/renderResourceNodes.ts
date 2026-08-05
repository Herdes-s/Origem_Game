import type { ResourceNodeState } from "../../../entities/items/world/resourceNode";
import { isPrimaryAvailable } from "../../../entities/items/world/resourceNode";
import { getItemDefinition } from "../../../entities/items/itemRegistry";
import { TILE_SIZE } from "../../../data/map";

const DEFAULT_SIZE = 24; // sem spriteSrc próprio (pedra) — ícone modesto, tipo um pickup grande

// Desenha os nós de recurso do mapa atual. Só os do mapId certo (a lista
// é global, sobrevive a trocar de mapa — ver resourceNode.ts).
//
// Com o primário disponível: spriteSrc (ou ícone/cor do item, tipo
// pedra). Com o primário esgotado: spriteSrcDepleted se existir (ex: a
// macieira vira árvore "sem fruto", ainda cortável a machado) — sem
// isso, some da tela até recarregar (comportamento antigo, ainda vale
// pra pedra/galho, que não têm variante "esgotada").
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

    const available = isPrimaryAvailable(node, currentGameMs);
    const spriteSrc = available ? node.spriteSrc : node.spriteSrcDepleted;
    if (!available && !spriteSrc) continue; // esgotado sem variante — some da tela

    const size = node.size ?? DEFAULT_SIZE;
    const worldX = node.tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = node.tileY * TILE_SIZE + TILE_SIZE / 2;
    const drawX = worldX - camX - size / 2;
    const drawY = worldY - camY - size / 2;

    if (drawX + size < 0 || drawX > screenW || drawY + size < 0 || drawY > screenH) {
      continue;
    }

    const img = spriteSrc ? nodeSprites.get(spriteSrc) : undefined;

    if (img) {
      ctx.drawImage(img, drawX, drawY, size, size);
      continue;
    }

    if (!available) continue; // esgotado, sem sprite carregada ainda — nada a desenhar

    // sem sprite própria (pedra) — cai no ícone/cor do item que entrega,
    // mesmo placeholder que os pickups já usam
    const def = getItemDefinition(node.primary.itemId);
    ctx.beginPath();
    ctx.arc(worldX - camX, worldY - camY, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = def?.color ?? "#94a3b8";
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
