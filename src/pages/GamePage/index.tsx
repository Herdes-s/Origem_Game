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
  allocatePoint,
  computeDerivedStats,
  type PlayerAttributes,
  type PrimaryAttributes,
} from "../../entities/player/playerAttributes";
import {
  applyDeathPenalty,
  DEFAULT_PROGRESS,
  gainXp,
  type PlayerProgress,
} from "../../entities/player/playerProgress";
import {
  spawnEnemies,
  spawnDensFromMap,
  getMapStartPixel,
} from "../../entities/enemies/enemySpawner";
import { TILE_SIZE } from "../../data/map";
import {
  DEFAULT_MAP_ID,
  setCurrentMapId,
  getCurrentMapId,
  type Portal,
} from "../../data/maps";
import { loadGame, saveGame } from "../../entities/save/saveGame";
import { playLevelUp } from "../../entities/audio/soundEngine";
import GameMenu from "../../components/GameMenu";
import InventoryPanel from "../../components/InventoryPanel";
import type { Inventory } from "../../entities/items/itemTypes";
import {
  addItem,
  computeInventoryWeight,
  createEmptyInventory,
  moveItem,
  removeItem,
} from "../../entities/items/inventory";
import { computeCarryCapacity } from "../../entities/items/weight";
import { createItemPickup, type ItemPickup } from "../../entities/items/world/itemPickup";

import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGameLoop } from "./hooks/useGameLoop";
import { useGameClock } from "./hooks/useGameClock";
import styles from "./GamePage.module.scss";

const AUTOSAVE_INTERVAL_MS = 5000;

// GamePage monta o estado do jogo (tudo em refs, sem re-render a 60fps) e
// pluga as duas peças que rodam em paralelo: o loop de update
// (useGameLoop) e o loop de desenho (dentro do ScreenGame). Spawn de
// inimigos vive em entities/enemies/enemySpawner.ts, input de teclado em
// hooks/useKeyboardControls.ts, atributos (FOR/DES/CON/RES + Precisão) em
// entities/player/playerAttributes.ts, level/XP em
// entities/player/playerProgress.ts, e mapas/fases em data/maps/*.ts.
function GamePage() {
  // Carrega o save uma vez (localStorage) — se não existir ou estiver
  // corrompido, loadGame() retorna null e o jogo começa do zero, igual
  // sempre começou. É uma leitura pura, então não precisa de ref — só os
  // useState/useRef abaixo usam esse valor, e eles só levam em conta o
  // valor inicial mesmo (1ª render).
  const savedGame = loadGame();

  // Restaura o mapa salvo ANTES de qualquer coisa abaixo, porque
  // spawnEnemies()/spawnDensFromMap()/getMapStartPixel() todos leem o
  // mapa atual — precisa estar certo antes de criar os refs iniciais.
  // Chamada idempotente (é só um Record lookup), então rodar de novo em
  // cada render não causa problema.
  setCurrentMapId(savedGame?.mapId ?? DEFAULT_MAP_ID);

  // Atributos e progresso vivem em state — é o que a UI (StatusPanel) lê
  // pra renderizar. O ref abaixo é só um espelho pro game loop (RAF), que
  // não pode reagir a re-render e precisa ler o valor mais recente a cada
  // frame sem depender do React.
  const [attributes, setAttributes] = useState<PlayerAttributes>(() => {
    const base = savedGame?.attributes ?? DEFAULT_ATTRIBUTES;
    const startingInventory = savedGame?.inventory ?? createEmptyInventory();
    // Blindagem pra save antigo sem `peso` em secondary (feature nova) —
    // preenche o que faltar com o default, e recalcula peso a partir do
    // inventário de verdade (fonte única), em vez de confiar num valor
    // salvo que pode estar desatualizado.
    return {
      ...base,
      secondary: {
        ...DEFAULT_ATTRIBUTES.secondary,
        ...base.secondary,
        peso: computeInventoryWeight(startingInventory),
      },
    };
  });
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

  // Inventário — mesmo padrão de attributes/progress: state pra UI
  // (InventoryPanel) reagir, ref-espelho pro game loop ler o peso a cada
  // frame sem precisar de re-render.
  const [inventory, setInventory] = useState<Inventory>(
    savedGame?.inventory ?? createEmptyInventory(),
  );
  const inventoryRef = useRef<Inventory>(inventory);

  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  const startingHpMax = computeDerivedStats(attributes).hpMax;

  const posRef = useRef(savedGame?.position ?? getMapStartPixel());
  const keysRef = useRef<GameKeys>({});
  const hudRef = useRef<HudState>({
    hp: savedGame?.hp ?? startingHpMax,
    hpMax: startingHpMax,
    score: savedGame?.score ?? 0,
  });
  const enemiesRef = useRef<Enemy[]>(spawnEnemies());
  const densRef = useRef<SpawnDen[]>(spawnDensFromMap());
  const damageNumbersRef = useRef<DamageNumber[]>([]);
  // Itens largados no mundo (drop de inimigo, descarte do inventário) —
  // mesmo padrão de enemiesRef: não entra no save, começa vazio a cada
  // carregamento (ver entities/items/world/itemPickup.ts).
  const pickupsRef = useRef<ItemPickup[]>([]);

  // Só existe pra mostrar/esconder o botão "Coletar" — o game loop
  // (useGameLoop) já faz a detecção de proximidade a 60fps em refs, e só
  // chama isso quando o id realmente muda (ver onNearbyPickupChange).
  const [nearbyPickupId, setNearbyPickupId] = useState<number | null>(null);
  // Qual painel grande está aberto agora — só um por vez (StatusPanel e
  // InventoryPanel são modais controlados daqui, não mais donos do
  // próprio "open"; quem decide é o GameMenu, através disso).
  const [activePanel, setActivePanel] = useState<"inventory" | "status" | null>(null);
  const handleNearbyPickupChange = useCallback((id: number | null) => {
    setNearbyPickupId(id);
  }, []);

  const attackRef = useRef<AttackState>({
    active: false,
    cooldown: 0,
    duration: 0,
    direction: "down",
    hitFlash: 0,
    hitEnemyIds: new Set(),
    knockbackX: 0,
    knockbackY: 0,
  });

  const directionRef = useRef("down");
  const gameStateRef = useRef<GameState>("playing");

  // Tempo de jogo — tempo real, só conta enquanto a aba está visível (ver
  // useGameClock.ts). Dia 1, 00:00 é o padrão pra save novo/antigo sem
  // esse campo ainda.
  const { totalPlayedMsRef } = useGameClock(savedGame?.totalPlayedMs ?? 0);

  useKeyboardControls(keysRef);

  // Identidade estável (useCallback) — evita recriar o RAF loop a cada
  // render só porque a função mudou de referência. gainXp já processa
  // level up (pode subir mais de um level de uma vez).
  const handleXpGained = useCallback((amount: number) => {
    setProgress((prev) => {
      const next = gainXp(prev, amount);
      if (next.level > prev.level) playLevelUp();
      return next;
    });
  }, []);

  // Monta o snapshot pra salvar, sempre lendo os refs mais recentes (não
  // captura valor "velho" de closure, mesmo chamado de dentro de um
  // interval configurado uma vez só no mount). useCallback com deps
  // vazias é seguro aqui porque só lê `.current` de refs — nunca captura
  // state direto, então a identidade nunca precisa mudar.
  const buildSnapshot = useCallback(() => ({
    attributes: attributesRef.current,
    progress: progressRef.current,
    position: posRef.current,
    hp: hudRef.current.hp,
    score: hudRef.current.score,
    mapId: getCurrentMapId(),
    inventory: inventoryRef.current,
    totalPlayedMs: totalPlayedMsRef.current,
  }), [totalPlayedMsRef]);

  // Player pisou num portal — troca de mapa, reposiciona, e gera os
  // inimigos/covis do mapa novo. Atributos/progresso não mudam (mesmo
  // princípio do respawn: level e atributos são do PLAYER, não do mapa).
  const handlePortalEnter = useCallback((portal: Portal) => {
    setCurrentMapId(portal.targetMapId);
    posRef.current = {
      x: portal.targetTx * TILE_SIZE + TILE_SIZE / 2,
      y: portal.targetTy * TILE_SIZE + TILE_SIZE / 2,
    };
    enemiesRef.current = spawnEnemies();
    densRef.current = spawnDensFromMap();
    pickupsRef.current = [];
    saveGame(buildSnapshot());
  }, [buildSnapshot]);

  const handlePlayerDeath = useCallback(() => {
    const result = applyDeathPenalty(
      progressRef.current,
      attributesRef.current,
    );
    setProgress(result.progress);
    setAttributes(result.attributes);
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
    pickupsRef,
    onXpGained: handleXpGained,
    onPortalEnter: handlePortalEnter,
    onPlayerDeath: handlePlayerDeath,
    onNearbyPickupChange: handleNearbyPickupChange,
  });

  // Salva na hora quando atributos ou progresso mudam (level up, ponto
  // alocado) — essas mudanças são raras, então salvar na hora não pesa.
  useEffect(() => {
    saveGame(buildSnapshot());
  }, [attributes, progress, inventory, buildSnapshot]);

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
  }, [buildSnapshot]);

  // Gasta 1 ponto de level up num atributo primário — chamado pela UI do
  // StatusPanel quando o player clica em "+" ao lado de FOR/DES/CON/RES.
  const handleAllocate = (key: keyof PrimaryAttributes) => {
    if (progress.unallocatedPoints <= 0) return;
    setAttributes((prev) => allocatePoint(prev, key));
    setProgress((prev) => ({
      ...prev,
      unallocatedPoints: prev.unallocatedPoints - 1,
    }));
  };

  // TEMPORÁRIO: até existir coleta de verdade (drop de inimigo, planta no
  // mapa etc.), o InventoryPanel tem botões de item de teste que chamam
  // isso — só pra validar stack/slot/peso. addItem() já respeita
  // capacidade de carga (não deixa passar do limite).
  //
  // Peso (atributo secundário) é atualizado JUNTO do inventário, aqui no
  // handler — não via useEffect reagindo a `inventory` (isso causaria uma
  // cascata de re-render: um set dispara o outro). Assim os dois mudam
  // numa render só, sempre em sincronia, e é o único lugar que precisa
  // saber que peso vem do inventário — o resto do jogo só lê
  // attributes.secondary.peso como qualquer outro atributo.
  const handleAddTestItem = (itemId: string) => {
    const capacity = computeCarryCapacity(attributesRef.current.primary.for);
    const currentWeight = attributesRef.current.secondary.peso;
    const result = addItem(inventoryRef.current, itemId, 1, currentWeight, capacity);

    if (result.added <= 0) return;

    setInventory(result.inventory);
    setAttributes((prev) => ({
      ...prev,
      secondary: { ...prev.secondary, peso: computeInventoryWeight(result.inventory) },
    }));
  };

  // Player confirmou coletar o pickup mais próximo (botão "Coletar" na
  // tela, só aparece quando nearbyPickupId != null). addItem() já
  // respeita capacidade de carga — se não couber tudo, o que sobrar
  // simplesmente continua largado no mundo com a quantidade restante.
  const handleCollectPickup = () => {
    const pickup = pickupsRef.current.find((p) => p.id === nearbyPickupId);
    if (!pickup) return;

    const capacity = computeCarryCapacity(attributesRef.current.primary.for);
    const currentWeight = attributesRef.current.secondary.peso;
    const result = addItem(inventoryRef.current, pickup.itemId, pickup.quantity, currentWeight, capacity);

    if (result.added <= 0) return; // nada coube, não faz nada (nem remove o pickup)

    setInventory(result.inventory);
    setAttributes((prev) => ({
      ...prev,
      secondary: { ...prev.secondary, peso: computeInventoryWeight(result.inventory) },
    }));

    if (result.added >= pickup.quantity) {
      // coletou tudo — remove o pickup do mundo
      pickupsRef.current = pickupsRef.current.filter((p) => p.id !== pickup.id);
      setNearbyPickupId(null);
    } else {
      // coube só uma parte — o resto continua largado ali
      pickup.quantity -= result.added;
    }
  };

  // Reorganizar slots dentro do inventário (arrastar) — nunca muda o peso
  // total (mesmos itens, só de posição), então não precisa resincronizar
  // attributes.secondary.peso aqui.
  const handleMoveItem = (from: number, to: number) => {
    setInventory((prev) => moveItem(prev, from, to));
  };

  // Player confirmou descartar a pilha inteira de um slot (lixeira do
  // InventoryPanel, com confirmação) — o item não é destruído de
  // verdade, volta pro mundo como um ItemPickup na posição atual do
  // player, pra poder ser recolhido depois se for o caso.
  const handleConfirmDiscard = (slotIndex: number) => {
    const slot = inventoryRef.current[slotIndex];
    if (!slot) return;

    const nextInventory = removeItem(inventoryRef.current, slotIndex, slot.quantity);

    setInventory(nextInventory);
    setAttributes((prev) => ({
      ...prev,
      secondary: { ...prev.secondary, peso: computeInventoryWeight(nextInventory) },
    }));

    pickupsRef.current.push(createItemPickup(slot.itemId, slot.quantity, posRef.current));
  };

  const handleRespawn = () => {
    // Atributos e progresso não resetam no respawn — só posição (volta
    // pro início do mapa ATUAL, não necessariamente a caverna), vida,
    // inimigos e ataque
    posRef.current = getMapStartPixel();
    hudRef.current.hp = computeDerivedStats(attributesRef.current).hpMax;
    enemiesRef.current = spawnEnemies();
    pickupsRef.current = [];
    attackRef.current = {
      active: false,
      cooldown: 0,
      duration: 0,
      direction: "down",
      hitFlash: 0,
      hitEnemyIds: new Set(),
      knockbackX: 0,
      knockbackY: 0,
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
        pickupsRef={pickupsRef}
        attackRef={attackRef}
        directionRef={directionRef}
        gameStateRef={gameStateRef}
        damageNumbersRef={damageNumbersRef}
        totalPlayedMsRef={totalPlayedMsRef}
        onRespawn={handleRespawn}
      />
      <ControlGame keysRef={keysRef} />
      {nearbyPickupId !== null && (
        <button className={styles.collect_button} onClick={handleCollectPickup} type="button">
          ✋ Coletar
        </button>
      )}

      <GameMenu
        inventoryLabel={`Inventário (${inventory.filter((s) => s !== null).length}/${inventory.length})`}
        statusLabel={`Status${progress.unallocatedPoints > 0 ? ` (${progress.unallocatedPoints})` : ""}`}
        onOpenInventory={() => setActivePanel("inventory")}
        onOpenStatus={() => setActivePanel("status")}
      />

      <InventoryPanel
        open={activePanel === "inventory"}
        onClose={() => setActivePanel(null)}
        inventory={inventory}
        currentWeight={attributes.secondary.peso}
        carryCapacity={computeCarryCapacity(attributes.primary.for)}
        onAddTestItem={handleAddTestItem}
        onMoveItem={handleMoveItem}
        onConfirmDiscard={handleConfirmDiscard}
      />
      <StatusPanel
        open={activePanel === "status"}
        onClose={() => setActivePanel(null)}
        attributes={attributes}
        progress={progress}
        onAllocate={handleAllocate}
      />
    </>
  );
}

export default GamePage;
