import { MAP, TILE_SIZE } from "../data/map";
import { isTileSolid } from "../data/tiles";
import type { TileMap } from "../types/game"

export function pixelToTile(pixel: number): number {
  return Math.floor(pixel / TILE_SIZE);
}

export function isSolid(
  tileX: number,
  tileY: number,
  map: TileMap = MAP,
): boolean {
  const row = map[tileY];
  const tile = row?.[tileX] ?? 1;
  return isTileSolid(tile);
}

const MARGIN = 12;

export function wouldCollide(nextX: number, nextY: number): boolean {
  const left = pixelToTile(nextX - MARGIN);
  const right = pixelToTile(nextX + MARGIN);
  const top = pixelToTile(nextY - MARGIN);
  const bottom = pixelToTile(nextY + MARGIN);

  return (
    isSolid(left, top) ||
    isSolid(right, top) ||
    isSolid(left, bottom) ||
    isSolid(right, bottom)
  );
}
