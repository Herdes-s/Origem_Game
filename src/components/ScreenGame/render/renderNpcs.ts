import type { NpcConfig } from "../../../data/maps";
import { TILE_SIZE } from "../../../data/map";

const NPC_SIZE = 64; // mesmo tamanho de frame que player/inimigo — só que sem spritesheet, é o desenho inteiro

// NPC não tem direção nem animação — é sempre o mesmo frame, parado.
// Desenhado centralizado no tile dela (tileX/tileY), igual ao player.
export function renderNpcs(
  ctx: CanvasRenderingContext2D,
  npcs: NpcConfig[],
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  sprites: Map<string, HTMLImageElement>,
) {
  for (const npc of npcs) {
    const img = sprites.get(npc.spriteSrc);
    if (!img) continue; // ainda carregando

    const worldX = npc.tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = npc.tileY * TILE_SIZE + TILE_SIZE / 2;
    const drawX = worldX - camX - NPC_SIZE / 2;
    const drawY = worldY - camY - NPC_SIZE / 2;

    if (drawX + NPC_SIZE < 0 || drawX > screenW || drawY + NPC_SIZE < 0 || drawY > screenH) {
      continue;
    }

    ctx.drawImage(img, drawX, drawY, NPC_SIZE, NPC_SIZE);
  }
}
