import { MAP, MAP_H, MAP_W, TILE_SIZE } from "../../data/map";
import type { Enemy } from "./enemyTypes";
import { createEnemy } from "./enemyFactory";
import { SLIME_STRONG_CONFIG, SLIME_WEAK_CONFIG } from "./slime/slime";

// Posição inicial do player — centro do mapa. Também é a origem usada pelo
// raio de exclusão de spawn (inimigos fracos não nascem perto do player).
export const START_X =
  Math.floor(MAP_W / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
export const START_Y =
  Math.floor(MAP_H / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

const SPAWN_MARGIN_TILES = 2;
const WEAK_SPAWN_COUNT = 6;
const WEAK_EXCLUDE_RADIUS = 200;

// Patrulhas fixas dos slimes fortes — [tileX, tileY, patrolToTileX, patrolToTileY]
const STRONG_PATROLS: [number, number, number, number][] = [
  [8, 3, 19, 3],
  [9, 8, 26, 8],
  [9, 13, 9, 17],
];

function isSafeSpawnTile(tileX: number, tileY: number): boolean {
  for (let dy = -SPAWN_MARGIN_TILES; dy <= SPAWN_MARGIN_TILES; dy++) {
    for (let dx = -SPAWN_MARGIN_TILES; dx <= SPAWN_MARGIN_TILES; dx++) {
      const row = MAP[tileY + dy];
      if (!row) return false;
      const tile = row[tileX + dx];
      if (tile === undefined || tile === 1) return false;
    }
  }
  return true;
}

function getSafeTiles(): { x: number; y: number }[] {
  const safe: { x: number; y: number }[] = [];

  for (let ty = 0; ty < MAP.length; ty++) {
    for (let tx = 0; tx < MAP[0].length; tx++) {
      if (isSafeSpawnTile(tx, ty)) {
        safe.push({
          x: tx * TILE_SIZE + TILE_SIZE / 2,
          y: ty * TILE_SIZE + TILE_SIZE / 2,
        });
      }
    }
  }

  return safe;
}

function randomSafeTile(
  safeTiles: { x: number; y: number }[],
  excludeRadius = WEAK_EXCLUDE_RADIUS,
): { x: number; y: number } | null {
  const candidates = safeTiles.filter((t) => {
    const dx = t.x - START_X;
    const dy = t.y - START_Y;
    return Math.sqrt(dx * dx + dy * dy) > excludeRadius;
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Cria a leva de inimigos de uma partida. Hoje só existe uma configuração
// (slime weak/strong) — isolar essa função do GamePage é o que permite,
// na v0.2, plugar goblins e um sistema de fases aqui sem tocar no resto.
export function spawnEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  const safeTiles = getSafeTiles();

  // Slime fraco — spawn aleatório em tiles livres, longe do player
  for (let i = 0; i < WEAK_SPAWN_COUNT; i++) {
    const tile = randomSafeTile(safeTiles);
    if (!tile) continue;
    enemies.push(createEnemy(SLIME_WEAK_CONFIG, "weak", tile.x, tile.y));
  }

  // Slime forte — posições e patrulhas fixas, verificadas manualmente
  for (const [tx, ty, btx, bty] of STRONG_PATROLS) {
    if (!isSafeSpawnTile(tx, ty) || !isSafeSpawnTile(btx, bty)) continue;

    const x = tx * TILE_SIZE + TILE_SIZE / 2;
    const y = ty * TILE_SIZE + TILE_SIZE / 2;
    const bx = btx * TILE_SIZE + TILE_SIZE / 2;
    const by = bty * TILE_SIZE + TILE_SIZE / 2;

    enemies.push(
      createEnemy(
        SLIME_STRONG_CONFIG,
        "strong",
        x,
        y,
        { x, y },
        { x: bx, y: by },
      ),
    );
  }

  return enemies;
}
