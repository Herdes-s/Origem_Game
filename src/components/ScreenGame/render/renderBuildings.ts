import type { BuildingConfig } from "../../../data/maps";
import { TILE_SIZE } from "../../../data/map";

// Desenha os prédios do mapa atual por cima do grid de tiles. A colisão
// de verdade já vem do grid (HOUSE_WALL sólido, DOOR andável/portal) —
// isso aqui é só visual, cobrindo o mosaico de tile por baixo com uma
// imagem única, alinhada exatamente ao retângulo tileX/tileY/tilesW/
// tilesH do prédio (a imagem já vem pronta nesse múltiplo de 64px, sem
// precisar de nenhum ajuste extra de escala/posição).
export function renderBuildings(
  ctx: CanvasRenderingContext2D,
  buildings: BuildingConfig[],
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
  sprites: Map<string, HTMLImageElement>,
) {
  for (const building of buildings) {
    const img = sprites.get(building.spriteSrc);
    if (!img) continue; // ainda carregando — aparece assim que estiver pronto

    const drawX = building.tileX * TILE_SIZE - camX;
    const drawY = building.tileY * TILE_SIZE - camY;
    const drawW = building.tilesW * TILE_SIZE;
    const drawH = building.tilesH * TILE_SIZE;

    if (drawX + drawW < 0 || drawX > screenW || drawY + drawH < 0 || drawY > screenH) {
      continue; // fora da tela — pula
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}
