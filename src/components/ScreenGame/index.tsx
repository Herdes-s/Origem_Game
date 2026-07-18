import { useRef, useEffect } from "react";
import type {
  GameKeys,
  Position,
  HudState,
  AttackState,
  GameState,
  DamageNumber,
} from "../../types/game";
import styles from "./ScreenGame.module.scss";
import { TILE_SIZE } from "../../data/map";
import { getCurrentMap } from "../../data/maps";
import type { Enemy } from "../../entities/enemies/enemyTypes";

import { useScreenSize } from "./hooks/useScreenSize";
import { useGameSprites } from "./hooks/useGameSprites";
import { useFlashCanvas } from "./hooks/useFlashCanvas";
import { useTileTextures } from "./hooks/useTileTextures";
import { usePlayerAnimation } from "./animation/usePlayerAnimation";

import { renderMap } from "./render/renderMap";
import { renderEnemies } from "./render/renderEnemies";
import { renderPlayer } from "./render/renderPlayer";
import { renderDamageNumbers } from "./render/renderDamageNumbers";
import { renderHud } from "./render/renderHud";
import {
  renderDeathScreen,
  getRespawnButtonRect,
} from "./render/renderDeathScreen";
import { renderDebugHitbox } from "./render/renderDebugHitbox";
import { DEBUG_HITBOX } from "./utils/hitbox";

// PROPS
type Props = {
  posRef: React.RefObject<Position>;
  keysRef: React.RefObject<GameKeys>;
  hudRef: React.RefObject<HudState>;
  enemiesRef: React.RefObject<Enemy[]>;
  attackRef: React.RefObject<AttackState>;
  directionRef: React.RefObject<string>;
  gameStateRef: React.RefObject<GameState>;
  damageNumbersRef: React.RefObject<DamageNumber[]>;
  onRespawn: () => void;
};

// ScreenGame é o orquestrador do game loop. Toda a lógica de desenho vive
// em render/*, os efeitos colaterais (sprites, tamanho de tela, canvas de
// flash) vivem em hooks/, e a animação do player vive em animation/.
// Isso deixa esse arquivo curto: ele só chama as peças, na ordem certa.
function ScreenGame({
  posRef,
  keysRef,
  hudRef,
  enemiesRef,
  attackRef,
  directionRef,
  gameStateRef,
  damageNumbersRef,
  onRespawn,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const { screenW, screenH, screenWRef, screenHRef, zoomRef } =
    useScreenSize(canvasRef);
  const spritesRef = useGameSprites();
  const { flashCanvasRef, flashCtxRef } = useFlashCanvas();
  const tileTexturesRef = useTileTextures();
  const {
    frameIndexRef,
    attackFrameIndexRef,
    update: updatePlayerAnimation,
  } = usePlayerAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const loop = () => {
      const SCREEN_W = screenWRef.current;
      const SCREEN_H = screenHRef.current;
      const ZOOM = zoomRef.current;

      const pos = posRef.current;
      const keys = keysRef.current;
      const hud = hudRef.current;
      const enemies = enemiesRef.current;
      const attack = attackRef.current;
      const gameState = gameStateRef.current;

      // MAPA ATUAL — lido de novo a cada frame, porque pode mudar no meio
      // do jogo (portal). getCurrentMap() é uma leitura barata (só um
      // Record lookup), sem problema chamar isso todo frame.
      const activeMap = getCurrentMap();
      const mapW = activeMap.tiles[0].length * TILE_SIZE;
      const mapH = activeMap.tiles.length * TILE_SIZE;

      // ANIMAÇÃO DO PLAYER — atualiza direção e avança frames de walk/punch
      updatePlayerAnimation(keys, attack, gameState, directionRef);
      const direction = directionRef.current;

      // CÂMERA — segue o player, sem sair dos limites do mapa
      const viewW = SCREEN_W / ZOOM;
      const viewH = SCREEN_H / ZOOM;

      let camX = pos.x - viewW / 2;
      let camY = pos.y - viewH / 2;

      camX = Math.max(0, Math.min(mapW - viewW, camX));
      camY = Math.max(0, Math.min(mapH - viewH, camY));

      // LIMPA O FRAME
      ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

      ctx.save();
      ctx.scale(ZOOM, ZOOM);

      // 1 MAPA
      renderMap(ctx, activeMap.tiles, camX, camY, SCREEN_W, SCREEN_H, tileTexturesRef.current);

      // 2 INIMIGOS
      renderEnemies(
        ctx,
        enemies,
        camX,
        camY,
        SCREEN_W,
        SCREEN_H,
        spritesRef.current,
        flashCanvasRef.current,
        flashCtxRef.current,
      );

      // 3 PLAYER
      renderPlayer(
        ctx,
        pos,
        camX,
        camY,
        direction,
        attack,
        frameIndexRef.current,
        attackFrameIndexRef.current,
        spritesRef.current,
        flashCanvasRef.current,
        flashCtxRef.current,
      );

      // NÚMEROS DE DANO FLUTUANTES
      renderDamageNumbers(ctx, damageNumbersRef.current, camX, camY, viewW, viewH);

      if (DEBUG_HITBOX && attack.active) {
        renderDebugHitbox(ctx, pos, attack, camX, camY);
      }

      ctx.restore(); // remove zoom — daqui pra baixo é pixel de tela real

      // 4 HUD
      renderHud(ctx, hud.hp, hud.hpMax, hud.score, SCREEN_W);

      // TELA DE MORTE
      if (gameState === "dead") {
        renderDeathScreen(ctx, SCREEN_W, SCREEN_H, hud.score);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (gameStateRef.current !== "dead") return;

      const SCREEN_W = screenWRef.current;
      const SCREEN_H = screenHRef.current;

      const rect = canvasRef.current!.getBoundingClientRect();
      // Escala o clique para coordenadas do canvas (pode estar escalado por CSS)
      const scaleX = SCREEN_W / rect.width;
      const scaleY = SCREEN_H / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const btn = getRespawnButtonRect(SCREEN_W, SCREEN_H);

      if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
        onRespawn();
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [
    posRef,
    keysRef,
    hudRef,
    enemiesRef,
    attackRef,
    directionRef,
    gameStateRef,
    damageNumbersRef,
    onRespawn,
    screenWRef,
    screenHRef,
    zoomRef,
    spritesRef,
    flashCanvasRef,
    flashCtxRef,
    tileTexturesRef,
    frameIndexRef,
    attackFrameIndexRef,
    updatePlayerAnimation,
  ]);

  return (
    <section className={styles.screen_game}>
      <div className={styles.screen_base}>
        <canvas
          ref={canvasRef}
          width={screenW}
          height={screenH}
          className={styles.canvas}
        />
      </div>
    </section>
  );
}

export default ScreenGame;
