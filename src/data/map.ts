export const TILE_SIZE = 64;

const VISIBLE_TILES_MOBILE = 5;
const VISIBLE_TILES_DESKTOP = 18;

export function calcZoom(
  screenW: number,
  screenH: number,
  isTouchDevice: boolean,
): number {
  const isMobile = isTouchDevice && (screenW < 768 || screenH < 768);
  const visibleTiles = isMobile ? VISIBLE_TILES_MOBILE : VISIBLE_TILES_DESKTOP;

  return screenW / (visibleTiles * TILE_SIZE);
}
