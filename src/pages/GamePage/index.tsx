import { useRef } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";
import type {
  AttackState,
  DamageNumber,
  GameKeys,
  GameState,
  HudState,
} from "../../types/game";
import type { Enemy } from "../../entities/enemies/enemyTypes";
import { PLAYER_CONFIG } from "../../entities/player/player";
import {
  spawnEnemies,
  START_X,
  START_Y,
} from "../../entities/enemies/enemySpawner";

import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGameLoop } from "./hooks/useGameLoop";

// GamePage monta o estado do jogo (tudo em refs, sem re-render a 60fps) e
// pluga as duas peças que rodam em paralelo: o loop de update
// (useGameLoop) e o loop de desenho (dentro do ScreenGame). Spawn de
// inimigos vive em entities/enemies/enemySpawner.ts, e input de teclado em
// hooks/useKeyboardControls.ts.
function GamePage() {
  const posRef = useRef({ x: START_X, y: START_Y });
  const keysRef = useRef<GameKeys>({});
  const hudRef = useRef<HudState>({
    hp: PLAYER_CONFIG.hpMax,
    hpMax: PLAYER_CONFIG.hpMax,
    score: 0,
  });
  const enemiesRef = useRef<Enemy[]>(spawnEnemies());
  const damageNumbersRef = useRef<DamageNumber[]>([]);

  const attackRef = useRef<AttackState>({
    active: false,
    cooldown: 0,
    duration: 0,
    direction: "down",
    hitFlash: 0,
    hitEnemyIds: new Set(),
  });

  const directionRef = useRef("down");
  const gameStateRef = useRef<GameState>("playing");

  useKeyboardControls(keysRef);

  useGameLoop({
    posRef,
    keysRef,
    attackRef,
    enemiesRef,
    directionRef,
    hudRef,
    damageNumbersRef,
    gameStateRef,
  });

  const handleRespawn = () => {
    posRef.current = { x: START_X, y: START_Y };
    hudRef.current.hp = PLAYER_CONFIG.hpMax;
    enemiesRef.current = spawnEnemies();
    attackRef.current = {
      active: false,
      cooldown: 0,
      duration: 0,
      direction: "down",
      hitFlash: 0,
      hitEnemyIds: new Set(),
    };
    gameStateRef.current = "playing";
  };

  return (
    <>
      <ScreenGame
        posRef={posRef}
        keysRef={keysRef}
        hudRef={hudRef}
        enemiesRef={enemiesRef}
        attackRef={attackRef}
        directionRef={directionRef}
        gameStateRef={gameStateRef}
        damageNumbersRef={damageNumbersRef}
        onRespawn={handleRespawn}
      />
      <ControlGame
        keysRef={keysRef}
        attackRef={attackRef}
        directionRef={directionRef}
      />
    </>
  );
}

export default GamePage;