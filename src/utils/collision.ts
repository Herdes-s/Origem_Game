import { TILE_SIZE } from "../data/map";
import { getCurrentMap } from "../data/maps";
import { isTileSolid } from "../data/tiles";
import type { TileMap } from "../types/game"

export function pixelToTile(pixel: number): number {
  return Math.floor(pixel / TILE_SIZE);
}

export function isSolid(
  tileX: number,
  tileY: number,
  map?: TileMap,
): boolean {
  const activeMap = map ?? getCurrentMap().tiles;
  const row = activeMap[tileY];
  const tile = row?.[tileX];
  return isTileSolid(tile);
}

const MARGIN = 24;

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
