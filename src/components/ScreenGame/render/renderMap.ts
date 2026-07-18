import { TILE_SIZE } from "../../../data/map";
import { getTileDefinition } from "../../../data/tiles";
import type { TileMap } from "../../../types/game";

// Desenha o tilemap, pulando (culling) tiles fora da área visível.
// Recebe o grid do mapa ATUAL como parâmetro (não importa um fixo) —
// troca de fase é só passar um grid diferente aqui, nada mais muda.
export function renderMap(
  ctx: CanvasRenderingContext2D,
  tiles: TileMap,
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  textures: Map<number, HTMLImageElement>,
) {
  tiles.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const drawX = colIndex * TILE_SIZE - camX;
      const drawY = rowIndex * TILE_SIZE - camY;

      const fora =
        drawX + TILE_SIZE < 0 ||
        drawY + TILE_SIZE < 0 ||
        drawX > screenW ||
        drawY > screenH;

      if (fora) return;

      const texture = textures.get(tile);

      if (texture) {
        ctx.drawImage(texture, drawX, drawY, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = getTileDefinition(tile).color;
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    }

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    });
  });
}
