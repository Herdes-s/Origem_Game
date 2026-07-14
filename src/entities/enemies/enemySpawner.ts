import { MAP, MAP_H, MAP_W, TILE_SIZE } from "../../data/map";
import { findTileCoords, isTileSolid, TILE } from "../../data/tiles";
import type { Enemy } from "./enemyTypes";
import { createEnemy } from "./enemyFactory";
import { SLIME_STRONG_CONFIG, SLIME_WEAK_CONFIG } from "./slime/slime";
import { GOBLIN_STRONG_CONFIG, GOBLIN_WEAK_CONFIG } from "./goblin/goblin";
import { createSpawnDen, type SpawnDen } from "./spawnDen";

// Posição inicial do player — centro do mapa. Também é a origem usada pelo
// raio de exclusão de spawn (inimigos fracos não nascem perto do player).
export const START_X =
  Math.floor(MAP_W / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
export const START_Y =
  Math.floor(MAP_H / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

const SPAWN_MARGIN_TILES = 2;
const WEAK_SPAWN_COUNT = 6;
const WEAK_EXCLUDE_RADIUS = 400; // dobrado com o mundo (era 200 pra TILE_SIZE=32)
const GOBLIN_WEAK_SPAWN_COUNT = 3;

// Patrulhas fixas dos slimes fortes — [tileX, tileY, patrolToTileX, patrolToTileY]
const STRONG_PATROLS: [number, number, number, number][] = [
  [8, 3, 19, 3],
  [9, 8, 26, 8],
  [9, 13, 9, 17],
];

// Patrulha do goblin forte — mesma faixa aberta dos covis (linha 19),
// espaçada dos dois covis (colunas 5 e 24)
const GOBLIN_STRONG_PATROLS: [number, number, number, number][] = [
  [13, 19, 19, 19],
];

function isSafeSpawnTile(tileX: number, tileY: number): boolean {
  for (let dy = -SPAWN_MARGIN_TILES; dy <= SPAWN_MARGIN_TILES; dy++) {
    for (let dx = -SPAWN_MARGIN_TILES; dx <= SPAWN_MARGIN_TILES; dx++) {
      const row = MAP[tileY + dy];
      if (!row) return false;
      if (isTileSolid(row[tileX + dx])) return false;
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

function spawnPatrolEnemies(
  enemies: Enemy[],
  config: Parameters<typeof createEnemy>[0],
  patrols: [number, number, number, number][],
) {
  for (const [tx, ty, btx, bty] of patrols) {
    if (!isSafeSpawnTile(tx, ty) || !isSafeSpawnTile(btx, bty)) continue;

    const x = tx * TILE_SIZE + TILE_SIZE / 2;
    const y = ty * TILE_SIZE + TILE_SIZE / 2;
    const bx = btx * TILE_SIZE + TILE_SIZE / 2;
    const by = bty * TILE_SIZE + TILE_SIZE / 2;

    enemies.push(createEnemy(config, "strong", x, y, { x, y }, { x: bx, y: by }));
  }
}

// Cria a leva de inimigos de uma partida — hoje slime + goblin. Isolar
// essa função do GamePage é o que permite plugar uma raça nova ou um
// sistema de fases aqui sem tocar no resto.
export function spawnEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  const safeTiles = getSafeTiles();

  // Slime fraco — spawn aleatório em tiles livres, longe do player
  for (let i = 0; i < WEAK_SPAWN_COUNT; i++) {
    const tile = randomSafeTile(safeTiles);
    if (!tile) continue;
    enemies.push(createEnemy(SLIME_WEAK_CONFIG, "weak", tile.x, tile.y));
  }

  // Goblin fraco — mesma lógica, raça diferente
  for (let i = 0; i < GOBLIN_WEAK_SPAWN_COUNT; i++) {
    const tile = randomSafeTile(safeTiles);
    if (!tile) continue;
    enemies.push(createEnemy(GOBLIN_WEAK_CONFIG, "weak", tile.x, tile.y));
  }

  // Slime forte e goblin forte — posições e patrulhas fixas, verificadas
  // manualmente
  spawnPatrolEnemies(enemies, SLIME_STRONG_CONFIG, STRONG_PATROLS);
  spawnPatrolEnemies(enemies, GOBLIN_STRONG_CONFIG, GOBLIN_STRONG_PATROLS);

  return enemies;
}

// Cria um covil pra cada tile TILE.SPAWN_CAVE encontrado no mapa. Chamado
// uma vez ao montar o GamePage — os covis são fixos no mapa, diferente dos
// inimigos, que vêm e vão.
export function spawnDensFromMap(): SpawnDen[] {
  return findTileCoords(MAP, TILE.SPAWN_CAVE).map(({ tx, ty }) =>
    createSpawnDen({
      x: tx * TILE_SIZE + TILE_SIZE / 2,
      y: ty * TILE_SIZE + TILE_SIZE / 2,
    }),
  );
}
