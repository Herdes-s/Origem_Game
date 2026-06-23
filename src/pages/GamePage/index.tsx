import { useEffect, useRef } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";
import type { GameKeys, HudState } from "../../types/game";
import { MAP, MAP_H, MAP_W, TILE_SIZE } from "../../data/map";
import type { Enemy } from "../../entities/enemies/enemyTypes";
import { createEnemy } from "../../entities/enemies/enemyFactory";
import {
  SLIME_STRONG_CONFIG,
  SLIME_WEAK_CONFIG,
} from "../../entities/enemies/slime/slime";
import { PLAYER_CONFIG } from "../../entities/player/player";
import { updatePlayerMovement } from "../../entities/player/playerMovement";
import { updateEnemies } from "../../entities/enemies/enemyAI";

// Posição inicial do player - centro do mapa
const START_X = Math.floor(MAP_W / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
const START_Y = Math.floor(MAP_H / 2 / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

const SPAWN_MARGIN_TILES = 2;

function isSafeSpawnTile(tileX: number, tileY: number): boolean {
  for (let dy = -SPAWN_MARGIN_TILES; dy <= SPAWN_MARGIN_TILES; dy++) {
    for (let dx = -SPAWN_MARGIN_TILES; dx < +SPAWN_MARGIN_TILES; dx++) {
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
    for (let tx = 0; tx < MAP.length; tx++) {
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
  excludeRadius = 200,
): { x: number; y: number } | null {
  const candidates = safeTiles.filter((t) => {
    const dx = t.x - START_X;
    const dy = t.y - START_Y;
    return Math.sqrt(dx * dx + dy * dy) > excludeRadius;
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// SPAWN
function spawnEnemies(): Enemy[] {
  const enemies: Enemy[] = [];
  const safeTiles = getSafeTiles();

  // Slime fraco - spawn aleatório em tiles livres
  for (let i = 0; i < 6; i++) {
    const tile = randomSafeTile(safeTiles);
    if (!tile) continue;
    enemies.push(createEnemy(SLIME_WEAK_CONFIG, "weak", tile.x, tile.y));
  }

  // Slime fortes - posições e patrulhas fixas
  const strongPatrols: [number, number, number, number][] = [
    [3, 2, 8, 2],
    [20, 2, 26, 2],
    [3, 18, 3, 12],
  ];

  for (const [tx, ty, btx, bty] of strongPatrols) {
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

function GamePage() {
  const posRef = useRef({ x: START_X, y: START_Y });

  const keysRef = useRef<GameKeys>({});

  const rafRef = useRef<number>(0);

  const hudRef = useRef<HudState>({
    hp: PLAYER_CONFIG.hpMax,
    hpMax: PLAYER_CONFIG.hpMax,
    score: 0,
  });
  const enemiesRef = useRef<Enemy[]>(spawnEnemies());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      // Movimento do palyer - lógica isolada em playerMoviment.ts
      updatePlayerMovement(posRef.current, keysRef.current);

      // Atualizar todos os inimigos - IA, movimento e dano
      updateEnemies(enemiesRef.current, posRef.current, hudRef.current);

      // Remover inimigo morto
      enemiesRef.current = enemiesRef.current.filter((e) => e.hp > 0);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <ScreenGame
        posRef={posRef}
        keysRef={keysRef}
        hudRef={hudRef}
        enemiesRef={enemiesRef}
      />
      <ControlGame keysRef={keysRef} />
    </>
  );
}

export default GamePage;
