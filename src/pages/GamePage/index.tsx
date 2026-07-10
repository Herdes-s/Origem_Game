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
import type { SpawnDen } from "../../entities/enemies/spawnDen";
import {
  DEFAULT_ATTRIBUTES,
  allocatepoint,
  computeDerivedStats,
  type PlayerAttributes,
  type PrimaryAttributes,
} from "../../entities/player/playerAttributes";
import {
  DEFAULT_PROGRESS,
  gainXp,
  type PlayerProgress,
} from "../../entities/player/playerProgress";
import {
  spawnEnemies,
  spawnDensFromMap,
  START_X,
  START_Y,
} from "../../entities/enemies/enemySpawner";
import { loadGame, saveGame } from "../../entities/save/saveGame";

import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGameLoop } from "./hooks/useGameLoop";

const AUTOSAVE_INTERVAL_MS = 5000;

// GamePage monta o estado do jogo (tudo em refs, sem re-render a 60fps) e
// pluga as duas peças que rodam em paralelo: o loop de update
// (useGameLoop) e o loop de desenho (dentro do ScreenGame). Spawn de
// inimigos vive em entities/enemies/enemySpawner.ts, input de teclado em
// hooks/useKeyboardControls.ts, atributos (FOR/DES/CON/RES + Precisão) em
// entities/player/playerAttributes.ts, e level/XP em
// entities/player/playerProgress.ts.
function GamePage() {
  // Carrega o save uma vez (localStorage) — se não existir ou estiver
  // corrompido, loadGame() retorna null e o jogo começa do zero, igual
  // sempre começou. É uma leitura pura (sempre o mesmo resultado entre
  // saves), então não precisa de ref — só os useState/useRef abaixo usam
  // esse valor, e eles só levam em conta o valor inicial mesmo (1ª render).
  const savedGame = loadGame();

  // Atributos e progresso vivem em state — é o que a UI (StatusPanel) lê
  // pra renderizar. O ref abaixo é só um espelho pro game loop (RAF), que
  // não pode reagir a re-render e precisa ler o valor mais recente a cada
  // frame sem depender do React.
  const [attributes, setAttributes] = useState<PlayerAttributes>(
    savedGame?.attributes ?? DEFAULT_ATTRIBUTES,
  );
  const [progress, setProgress] = useState<PlayerProgress>(
    savedGame?.progress ?? DEFAULT_PROGRESS,
  );
  const attributesRef = useRef<PlayerAttributes>(attributes);
  const progressRef = useRef<PlayerProgress>(progress);

  useEffect(() => {
    attributesRef.current = attributes;
  }, [attributes]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const startingHpMax = computeDerivedStats(attributes).hpMax;

  const posRef = useRef(savedGame?.position ?? { x: START_X, y: START_Y });
  const keysRef = useRef<GameKeys>({});
  const hudRef = useRef<HudState>({
    hp: savedGame?.hp ?? startingHpMax,
    hpMax: startingHpMax,
    score: savedGame?.score ?? 0,
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

  // Identidade estável (useCallback) — evita recriar o RAF loop a cada
  // render só porque a função mudou de referência. gainXp já processa
  // level up (pode subir mais de um level de uma vez).
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

  // Monta o snapshot pra salvar, sempre lendo os refs mais recentes (não
  // captura valor "velho" de closure, mesmo chamado de dentro de um
  // interval configurado uma vez só no mount)
  const buildSnapshot = () => ({
    attributes: attributesRef.current,
    progress: progressRef.current,
    position: posRef.current,
    hp: hudRef.current.hp,
    score: hudRef.current.score,
  });

  // Salva na hora quando atributos ou progresso mudam (level up, ponto
  // alocado) — essas mudanças são raras, então salvar na hora não pesa.
  useEffect(() => {
    saveGame(buildSnapshot());
  }, [attributes, progress]);

  // Posição/HP/score mudam a cada frame dentro de refs (não disparam
  // re-render), então autosave periódico + um último save ao fechar/trocar
  // de aba é o jeito de não perder esse progresso.
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(buildSnapshot());
    }, AUTOSAVE_INTERVAL_MS);

    const handleBeforeUnload = () => saveGame(buildSnapshot());
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
    // Atributos e progresso não resetam no respawn — só posição, vida,
    // inimigos e ataque
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
    saveGame(buildSnapshot());
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
      <ControlGame keysRef={keysRef} />
      <StatusPanel
        attributes={attributes}
        progress={progress}
        onAllocate={handleAllocate}
      />
    </>
  );
}

export default GamePage;
