import { useRef, useEffect } from "react";
import type { GameKeys, Position, HudState } from "../../types/game";
import styles from "./ScreenGame.module.scss";
import {
  MAP,
  MAP_H,
  MAP_W,
  SCREEN_H,
  SCREEN_W,
  TILE_COLORS,
  TILE_SIZE,
} from "../../data/map";
import type { Enemy } from "../../entities/enemies/enemyTypes";
import {
  PLAYER_DIRECTION_ROW,
  PLAYER_SPRITE,
} from "../../entities/player/playerSprite";

//HUB
const HUB_X = 12;
const HUB_Y = 12;
const BAR_W = 140;
const BAR_H = 14;
const BAR_RADIUS = 4;

function getHpColor(percent: number): string {
  if (percent > 0.6) return "#22c55e";
  if (percent > 0.3) return "#eab308";
  return "#ef4444";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// PROPS
type Props = {
  posRef: React.RefObject<Position>;
  keysRef: React.RefObject<GameKeys>;
  hudRef: React.RefObject<HudState>;
  enemiesRef: React.RefObject<Enemy[]>;
};

function ScreenGame({ posRef, keysRef, hudRef, enemiesRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // ESTADO DA ANIMAÇÂO DO PALYER

  //Todos em refs - não causam re-render
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const directionRef = useRef("down");

  const spriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = PLAYER_SPRITE.src;
    img.onload = () => {
      spriteRef.current = img;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const loop = () => {
      const pos = posRef.current;
      const keys = keysRef.current;
      const hud = hudRef.current;
      const enemies = enemiesRef.current;

      // DIREÇÂO E ANIMAÇÂO
      let moving = false;

      if (keys["ArrowDown"] || keys["s"]) {
        directionRef.current = "down";
        moving = true;
      }

      if (keys["ArrowUp"] || keys["w"]) {
        directionRef.current = "up";
        moving = true;
      }

      if (keys["ArrowLeft"] || keys["a"]) {
        directionRef.current = "left";
        moving = true;
      }

      if (keys["ArrowRight"] || keys["d"]) {
        directionRef.current = "right";
        moving = true;
      }

      if (moving) {
        frameTimerRef.current++;

        if (frameTimerRef.current >= PLAYER_SPRITE.frameSpeed) {
          frameTimerRef.current = 0;

          frameIndexRef.current =
            (frameIndexRef.current + 1) % PLAYER_SPRITE.frameCount;
        }
      } else {
        frameIndexRef.current = 0;
        frameTimerRef.current = 0;
      }

      // CÂMERA
      let camX = pos.x - SCREEN_W / 2;
      let camY = pos.y - SCREEN_H / 2;

      camX = Math.max(0, Math.min(MAP_W - SCREEN_W, camX));
      camY = Math.max(0, Math.min(MAP_H - SCREEN_H, camY));

      // LIMPA O FRAME
      ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

      // 1 MAPA
      MAP.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          const drawX = colIndex * TILE_SIZE - camX;
          const drawY = rowIndex * TILE_SIZE - camY;

          const fora =
            drawX + TILE_SIZE < 0 ||
            drawY + TILE_SIZE < 0 ||
            drawX > SCREEN_W ||
            drawY > SCREEN_H;

          if (fora) return;

          ctx.fillStyle = TILE_COLORS[tile];
          ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        });
      });

      // 2 PERSONAGEM
      for (const enemy of enemies) {
        const ex = enemy.x - camX;
        const ey = enemy.y - camY;

        if (ex < -32 || ex > SCREEN_W + 32 || ey < -32 || ey > SCREEN_H + 32)
          continue;

        const radius = 12;

        // Corpo circular do slime (cor vem de slime.ts)
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Barra de HP do inimigo
        const barW = 30;
        const barH = 4;
        const barX = ex - barW / 2;
        const barY = ey - radius - 8;
        const hpPct = enemy.hp / enemy.hpMax;

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(barX, barY, barW, barH);

        ctx.fillStyle = getHpColor(hpPct);
        ctx.fillRect(barX, barY, barW * hpPct, barH);

        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(barX, barY, barW, barH);

        // Label da raça e variante
        ctx.font = "8px monospace";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        ctx.fillText(
          enemy.variant === "strong" ? `★ ${enemy.race}` : enemy.race,
          ex,
          barY - 2,
        );
        ctx.textAlign = "left";
      }

      // 3 PLAYER
      const screenX = pos.x - camX;
      const screenY = pos.y - camY;

      if (spriteRef.current) {
        const srcX = frameIndexRef.current * PLAYER_SPRITE.frameW;
        const srcY =
          PLAYER_DIRECTION_ROW[directionRef.current] * PLAYER_SPRITE.frameH;

        ctx.drawImage(
          spriteRef.current,
          srcX,
          srcY,
          PLAYER_SPRITE.frameW,
          PLAYER_SPRITE.frameH,
          screenX - PLAYER_SPRITE.frameW / 2,
          screenY - PLAYER_SPRITE.frameH / 2,
          PLAYER_SPRITE.frameW,
          PLAYER_SPRITE.frameH,
        );
      } else {
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
      }

      // 4 HUB
      const { hp, hpMax } = hud;

      const percent = Math.max(0, Math.min(1, hp / hpMax));
      const hpColor = getHpColor(percent);

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("HP", HUB_X, HUB_Y + 10);

      const barX2 = HUB_X + 22;
      const barY2 = HUB_Y;

      ctx.fillStyle = "#1e293b";
      roundRect(ctx, barX2, barY2, BAR_W, BAR_H, BAR_RADIUS);
      ctx.fill();

      if (percent > 0) {
        ctx.fillStyle = hpColor;

        const fillendW = Math.max(1, percent * BAR_W);
        roundRect(ctx, barX2, barY2, fillendW, BAR_H, BAR_RADIUS);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(225,225,225,0.15)";
      roundRect(ctx, barX2 + 2, barY2 + 2, BAR_W - 4, BAR_H / 3, BAR_RADIUS - 1);
      ctx.fill();

      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      roundRect(ctx, barX2, barY2, BAR_W, BAR_H, BAR_RADIUS);
      ctx.stroke();

      ctx.font = "10px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${hp} / ${hpMax}`, barX2, barY2 + BAR_H + 13);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [posRef, keysRef, hudRef, enemiesRef]);

  return (
    <section className={styles.screen_game}>
      <div className={styles.screen_base}>
        <canvas
          ref={canvasRef}
          width={SCREEN_W}
          height={SCREEN_H}
          className={styles.canvas}
        />
      </div>
    </section>
  );
}

export default ScreenGame;
