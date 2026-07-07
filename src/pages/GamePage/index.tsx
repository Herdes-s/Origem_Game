import { useCallback, useEffect, useRef, useState } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";
import StatusPanel from "../../components/StatusPanel";
import type {
  AttackState,
  DamageNumber,
  GameKeys,
  GameState,
  HudState,
} from "../../types/game";
import type { Enemy } from "../../entities/enemies/enemyTypes";
import {
  DEFAULT_ATTRIBUTES,
  allocatepoint,
  computeDerivedStats,
  type PlayerAttributes,
  type PrimaryAttributes,
} from "../../entities/player/playerAttributes";
import {
  spawnDensFromMap,
  spawnEnemies,
  START_X,
  START_Y,
} from "../../entities/enemies/enemySpawner";

import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGameLoop } from "./hooks/useGameLoop";
import type { SpawnDen } from "../../entities/enemies/spawnDen";
import {
  DEFAULT_PROGRESS,
  gainXp,
  type PlayerProgress,
} from "../../entities/player/playerProgress";

// GamePage monta o estado do jogo (tudo em refs, sem re-render a 60fps) e
// pluga as duas peças que rodam em paralelo: o loop de update
// (useGameLoop) e o loop de desenho (dentro do ScreenGame). Spawn de
// inimigos vive em entities/enemies/enemySpawner.ts, input de teclado em
// hooks/useKeyboardControls.ts, e os atributos do player (FOR/DES/CON +
// Precisão) em entities/player/playerAttributes.ts.
function GamePage() {
  // Atributos vivem em state — é o que a UI (StatusPanel) lê pra
  // renderizar. O setter (setAttributes) vai voltar aqui quando o level up
  // existir; por enquanto os atributos são fixos em DEFAULT_ATTRIBUTES.
  // O ref abaixo é só um espelho pro game loop (RAF), que não pode reagir
  // a re-render e precisa ler o valor mais recente a cada frame sem
  // depender do React.
  const [attributes, setAttributes] =
    useState<PlayerAttributes>(DEFAULT_ATTRIBUTES);
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const attributesRef = useRef<PlayerAttributes>(attributes);

  useEffect(() => {
    attributesRef.current = attributes;
  }, [attributes]);

  const startingHpMax = computeDerivedStats(DEFAULT_ATTRIBUTES).hpMax;

  const posRef = useRef({ x: START_X, y: START_Y });
  const keysRef = useRef<GameKeys>({});
  const hudRef = useRef<HudState>({
    hp: startingHpMax,
    hpMax: startingHpMax,
    score: 0,
  });
  const enemiesRef = useRef<Enemy[]>(spawnEnemies());
  const densRef = useRef<SpawnDen[]>(spawnDensFromMap());
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

  const handleXpGained = useCallback((amount: number) => {
    setProgress((prev) => gainXp(prev, amount));
  }, []);

  useGameLoop({
    posRef,
    keysRef,
    attackRef,
    enemiesRef,
    directionRef,
    hudRef,
    damageNumbersRef,
    gameStateRef,
    attributesRef,
    densRef,
    onXpGained: handleXpGained,
  });

  // Gasta 1 ponto de level up num atributo primário — chamado pela UI do
  // StatusPanel quando o player clica em "+" ao lado de FOR/DES/CON/RES.
  const handleAllocate = (key: keyof PrimaryAttributes) => {
    if (progress.unallocatedPoints <= 0) return;
    setAttributes((prev) => allocatepoint(prev, key));
    setProgress((prev) => ({
      ...prev,
      unallocatedPoints: prev.unallocatedPoints - 1,
    }));
  };

  const handleRespawn = () => {
    // Atributos não resetam no respawn — só posição, vida, inimigos e ataque
    posRef.current = { x: START_X, y: START_Y };
    hudRef.current.hp = computeDerivedStats(attributesRef.current).hpMax;
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
      <StatusPanel
        attributes={attributes}
        progress={progress}
        onAllocate={handleAllocate}
      />
    </>
  );
}

export default GamePage;
