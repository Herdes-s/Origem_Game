import { TILE_SIZE } from "../../data/map";
import { findTileCoords, isTileSolid, TILE } from "../../data/tiles";
import type { Enemy } from "./enemyTypes";
import { createEnemy } from "./enemyFactory";
import { createSpawnDen, type SpawnDen } from "./spawnDen";
import { getCurrentMap } from "../../data/maps";
import { getTierConfig } from "./raceConfigs";
import { rollLevelInRange } from "./enemyLeveling";
import type { TileMap } from "../../types/game";

const SPAWN_MARGIN_TILES = 2;
const WEAK_EXCLUDE_RADIUS = 400; // não nasce fraco perto demais de onde o player está

// Posição (pixel) do ponto de partida do mapa ATUAL — usado pra montar o
// player na primeira vez e como origem do raio de exclusão de spawn.
export function getMapStartPixel(): { x: number; y: number } {
  const map = getCurrentMap();
  return {
    x: map.startTx * TILE_SIZE + TILE_SIZE / 2,
    y: map.startTy * TILE_SIZE + TILE_SIZE / 2,
  };
}

function isSafeSpawnTile(tiles: TileMap, tileX: number, tileY: number): boolean {
  for (let dy = -SPAWN_MARGIN_TILES; dy <= SPAWN_MARGIN_TILES; dy++) {
    for (let dx = -SPAWN_MARGIN_TILES; dx <= SPAWN_MARGIN_TILES; dx++) {
      const row = tiles[tileY + dy];
      if (!row) return false;
      if (isTileSolid(row[tileX + dx])) return false;
    }
  }
  return true;
}

function getSafeTiles(tiles: TileMap): { x: number; y: number }[] {
  const safe: { x: number; y: number }[] = [];

  for (let ty = 0; ty < tiles.length; ty++) {
    for (let tx = 0; tx < tiles[0].length; tx++) {
      if (isSafeSpawnTile(tiles, tx, ty)) {
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
  originX: number,
  originY: number,
  excludeRadius = WEAK_EXCLUDE_RADIUS,
): { x: number; y: number } | null {
  const candidates = safeTiles.filter((t) => {
    const dx = t.x - originX;
    const dy = t.y - originY;
    return Math.sqrt(dx * dx + dy * dy) > excludeRadius;
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Cria a leva de inimigos do mapa ATUAL, a partir do wanderSpawns/
// patrolSpawns definidos no MapDefinition (data/maps/*.ts) — trocar de
// fase muda automaticamente quem nasce, sem precisar tocar nesse arquivo.
// Cada instância resolve o EnemyTierConfig via (raça, tier) e sorteia o
// próprio level dentro do levelRange daquela entrada do mapa.
export function spawnEnemies(): Enemy[] {
  const map = getCurrentMap();
  const enemies: Enemy[] = [];
  const safeTiles = getSafeTiles(map.tiles);
  const origin = getMapStartPixel();

  for (const { race, tier, count, levelRange } of map.wanderSpawns) {
    const tierConfig = getTierConfig(race, tier);
    if (!tierConfig) continue; // tier inválido/removido — não quebra o spawn dos outros

    for (let i = 0; i < count; i++) {
      const tile = randomSafeTile(safeTiles, origin.x, origin.y);
      if (!tile) continue;
      const level = rollLevelInRange(levelRange);
      enemies.push(createEnemy(tierConfig, level, tile.x, tile.y));
    }
  }

  for (const { race, tier, patrol, levelRange } of map.patrolSpawns) {
    const [tx, ty, btx, bty] = patrol;
    if (!isSafeSpawnTile(map.tiles, tx, ty) || !isSafeSpawnTile(map.tiles, btx, bty)) continue;

    const tierConfig = getTierConfig(race, tier);
    if (!tierConfig) continue;

    const x = tx * TILE_SIZE + TILE_SIZE / 2;
    const y = ty * TILE_SIZE + TILE_SIZE / 2;
    const bx = btx * TILE_SIZE + TILE_SIZE / 2;
    const by = bty * TILE_SIZE + TILE_SIZE / 2;

    const level = rollLevelInRange(levelRange);
    enemies.push(createEnemy(tierConfig, level, x, y, { x, y }, { x: bx, y: by }));
  }

  return enemies;
}

// Cria um covil pra cada tile TILE.SPAWN_CAVE encontrado no mapa. Chamado
// uma vez ao montar o GamePage — os covis são fixos no mapa, diferente dos
// inimigos, que vêm e vão. Hoje todo covil nasce sempre slime no tier
// base ("slime") — o level que ele respawna usa o mesmo levelRange do
// wanderSpawns de slime/"slime" já definido pro mapa (fallback 1-3 se o
// mapa não tiver essa entrada). Associar o covil a uma raça/tier
// diferente por tile é um passo futuro (hoje TILE.SPAWN_CAVE não carrega
// essa informação).
export function spawnDensFromMap(): SpawnDen[] {
  const map = getCurrentMap();
  const denSpawnConfig = map.wanderSpawns.find(
    (s) => s.race === "slime" && s.tier === "slime",
  );
  const levelRange = denSpawnConfig?.levelRange ?? { min: 1, max: 3 };

  return findTileCoords(map.tiles, TILE.SPAWN_CAVE).map(({ tx, ty }) =>
    createSpawnDen(
      {
        x: tx * TILE_SIZE + TILE_SIZE / 2,
        y: ty * TILE_SIZE + TILE_SIZE / 2,
      },
      levelRange,
    ),
  );
}
