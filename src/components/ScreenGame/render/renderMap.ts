import { MAP, TILE_SIZE } from "../../../data/map";
import { getTileDefinition } from "../../../data/tiles";

// Desenha o tilemap, pulando (culling) tiles fora da área visível.
export function renderMap(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
) {
  MAP.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      const drawX = colIndex * TILE_SIZE - camX;
      const drawY = rowIndex * TILE_SIZE - camY;

      const fora =
        drawX + TILE_SIZE < 0 ||
        drawY + TILE_SIZE < 0 ||
        drawX > screenW ||
        drawY > screenH;

      if (fora) return;

      ctx.fillStyle = getTileDefinition(tile).color;
      ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
    });
  });
}
