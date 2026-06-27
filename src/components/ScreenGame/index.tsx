import { useRef, useEffect } from "react";
import type {
  GameKeys,
  Position,
  HudState,
  AttackState,
  GameState,
} from "../../types/game";
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
import {
  SLIME_ANIMATION_ROW,
  SLIME_SPRITE,
} from "../../entities/enemies/slime/slimeSprite";
import { PLAYER_CONFIG } from "../../entities/player/player";

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

// Calcula a hitbox do ataque para desenhar no canvas
function getHitbox(pos: Position, dir: string) {
  const { hitboxOffset, hitboxW, hitboxH } = PLAYER_CONFIG;
  const half = hitboxH / 2;
  switch (dir) {
    case "right":
      return {
        x: pos.x + hitboxOffset,
        y: pos.y - half,
        w: hitboxW,
        h: hitboxH,
      };
    case "left":
      return {
        x: pos.x - hitboxOffset - hitboxW,
        y: pos.y - half,
        w: hitboxW,
        h: hitboxH,
      };
    case "down":
      return {
        x: pos.x - half,
        y: pos.y + hitboxOffset,
        w: hitboxH,
        h: hitboxW,
      };
    case "up":
      return {
        x: pos.x - half,
        y: pos.y - hitboxOffset - hitboxW,
        w: hitboxH,
        h: hitboxW,
      };
    default:
      return { x: pos.x, y: pos.y, w: 0, h: 0 };
  }
}

// PROPS
type Props = {
  posRef: React.RefObject<Position>;
  keysRef: React.RefObject<GameKeys>;
  hudRef: React.RefObject<HudState>;
  enemiesRef: React.RefObject<Enemy[]>;
  attackRef: React.RefObject<AttackState>;
  directionRef: React.RefObject<string>;
  gameStateRef: React.RefObject<GameState>;
  onRespawn: () => void;
};

function ScreenGame({
  posRef,
  keysRef,
  hudRef,
  enemiesRef,
  attackRef,
  directionRef,
  gameStateRef,
  onRespawn,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // ESTADO DA ANIMAÇÂO DO PALYER

  //Todos em refs - não causam re-render
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);

  const spriteRef = useRef<HTMLImageElement | null>(null);

  // Sprites dos slimes - um por variante
  const slimeWeakSpriteRef = useRef<HTMLImageElement | null>(null);
  const slimeStrongSpriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // CARREGAR SPRITES
    const playerImg = new Image();
    playerImg.src = PLAYER_SPRITE.src;
    playerImg.onload = () => {
      spriteRef.current = playerImg;
    };

    // Carregar weak e strong separadamente
    const slimeWeakImg = new Image();
    slimeWeakImg.src = SLIME_SPRITE.weak.src;
    slimeWeakImg.onload = () => {
      slimeWeakSpriteRef.current = slimeWeakImg;
    };

    const slimeStrongImg = new Image();
    slimeStrongImg.src = SLIME_SPRITE.strong.src;
    slimeStrongImg.onload = () => {
      slimeStrongSpriteRef.current = slimeStrongImg;
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
      const attack = attackRef.current;
      const direction = directionRef.current;
      const gameState = gameStateRef.current;

      //ANIMAÇÂO DO PLAYER

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

      if (moving && gameState === "playing") {
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

      // 2 INIMIGO
      for (const enemy of enemies) {
        const ex = enemy.x - camX;
        const ey = enemy.y - camY;

        if (ex < -64 || ex > SCREEN_W + 64 || ey < -64 || ey > SCREEN_H + 64)
          continue;

        const spriteConfig =
          enemy.variant === "strong" ? SLIME_SPRITE.strong : SLIME_SPRITE.weak;

        const spriteImg =
          enemy.variant === "strong"
            ? slimeStrongSpriteRef.current
            : slimeWeakSpriteRef.current;

        const srcX = enemy.frameIndex * spriteConfig.frameW;
        const srcY = SLIME_ANIMATION_ROW[enemy.animState] * spriteConfig.frameH;

        if (spriteImg) {
          if (enemy.hp <= 0) {
            const alpha = Math.max(0, 1 - enemy.frameIndex / 4);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(
              spriteImg,
              srcX,
              srcY,
              spriteConfig.frameW,
              spriteConfig.frameH,
              ex - spriteConfig.frameW / 2,
              ey - spriteConfig.frameH / 2,
              spriteConfig.frameW,
              spriteConfig.frameH,
            );
            ctx.restore();
            continue;
          }

          //Frame vermelho
          if (enemy.hitFlashTimer > 0) {
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(
              spriteImg,
              srcX,
              srcY,
              spriteConfig.frameW,
              spriteConfig.frameH,
              ex - spriteConfig.frameW / 2,
              ey - spriteConfig.frameH / 2,
              spriteConfig.frameW,
              spriteConfig.frameH,
            );

            ctx.globalCompositeOperation = "multiply";
            ctx.fillStyle = `rgba(255, 80, 80, ${enemy.hitFlashTimer / PLAYER_CONFIG.hitFlashDuration})`;
            ctx.fillRect(
              ex - spriteConfig.frameW / 2,
              ey - spriteConfig.frameH / 2,
              spriteConfig.frameW,
              spriteConfig.frameH,
            );
            ctx.restore();
          } else {
            ctx.drawImage(
              spriteImg,
              srcX,
              srcY,
              spriteConfig.frameW,
              spriteConfig.frameH,
              ex - spriteConfig.frameW / 2,
              ey - spriteConfig.frameH / 2,
              spriteConfig.frameW,
              spriteConfig.frameH,
            );
          }
        } else {
          if(enemy.hp <= 0) {
            const alpha = Math.max(0, 1 - (enemy.frameIndex / 4));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(ex, ey, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
          }
            ctx.fillStyle = enemy.hitFlashTimer > 0 ? "#ef4444" : enemy.color;
            ctx.beginPath();
            ctx.arc(ex, ey, 12, 0, Math.PI * 2);
            ctx.fill();

        }

        const barW = 40;
        const barH = 4;
        const barX = ex - barW / 2;
        const barY = ey - spriteConfig.frameH / 2 - 8;
        const hpPct = enemy.hp / enemy.hpMax;

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = getHpColor(hpPct);
        ctx.fillRect(barX, barY, barW * hpPct, barH);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(barX, barY, barW, barH);

        // Label
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
        const srcY = PLAYER_DIRECTION_ROW[direction] * PLAYER_SPRITE.frameH;

        if (attack.hitFlash > 0) {
          ctx.save();
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
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = `rgba(255, 80, 80, ${attack.hitFlash / PLAYER_CONFIG.hitFlashDuration})`;
          ctx.fillRect(
            screenX - PLAYER_SPRITE.frameW / 2,
            screenY - PLAYER_SPRITE.frameH / 2,
            PLAYER_SPRITE.frameW,
            PLAYER_SPRITE.frameH,
          );
          ctx.restore();
        } else {
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
        }
      } else {
        ctx.fillStyle = attack.hitFlash > 0 ? "#ef4444" : "#fde68a";
        ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
      }

      if (attack.active) {
        const hb = getHitbox(pos, attack.direction);
        ctx.fillStyle = "rgba(255, 200, 0, 0.25)";
        ctx.fillRect(hb.x - camX, hb.y - camY, hb.w, hb.h);
        ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(hb.x - camX, hb.y - camY, hb.w, hb.h);
      }

      // 4 HUB
      const { hp, hpMax } = hud;

      const percent = Math.max(0, Math.min(1, hp / hpMax));

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("HP", HUB_X, HUB_Y + 10);

      const barX2 = HUB_X + 22;
      const barY2 = HUB_Y;

      ctx.fillStyle = "#1e293b";
      roundRect(ctx, barX2, barY2, BAR_W, BAR_H, BAR_RADIUS);
      ctx.fill();

      if (percent > 0) {
        ctx.fillStyle = getHpColor(percent);

        const fillendW = Math.max(1, percent * BAR_W);
        roundRect(ctx, barX2, barY2, fillendW, BAR_H, BAR_RADIUS);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(225,225,225,0.15)";
      roundRect(
        ctx,
        barX2 + 2,
        barY2 + 2,
        BAR_W - 4,
        BAR_H / 3,
        BAR_RADIUS - 1,
      );
      ctx.fill();

      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      roundRect(ctx, barX2, barY2, BAR_W, BAR_H, BAR_RADIUS);
      ctx.stroke();

      ctx.font = "10px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`${hp} / ${hpMax}`, barX2, barY2 + BAR_H + 13);

      //TELA DE MORTE
      if (gameState === "dead") {
        // Overlay escuro semitransparente
        ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

        // Texto "Você morreu"
        ctx.font = "bold 28px monospace";
        ctx.fillStyle = "#ef4444";
        ctx.textAlign = "center";
        ctx.fillText("Você morreu", SCREEN_W / 2, SCREEN_H / 2 - 30);

        // Botão de renascer — desenhado como retângulo clicável
        const btnW = 160;
        const btnH = 44;
        const btnX = SCREEN_W / 2 - btnW / 2;
        const btnY = SCREEN_H / 2;

        ctx.fillStyle = "#166534";
        roundRect(ctx, btnX, btnY, btnW, btnH, 8);
        ctx.fill();

        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        roundRect(ctx, btnX, btnY, btnW, btnH, 8);
        ctx.stroke();

        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#dcfce7";
        ctx.fillText("↺  Renascer", SCREEN_W / 2, btnY + 28);

        ctx.textAlign = "left";
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (gameStateRef.current !== "dead") return;

      const rect = canvasRef.current!.getBoundingClientRect();
      // Escala o clique para coordenadas do canvas (pode estar escalado por CSS)
      const scaleX = SCREEN_W / rect.width;
      const scaleY = SCREEN_H / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const btnW = 160;
      const btnH = 44;
      const btnX = SCREEN_W / 2 - btnW / 2;
      const btnY = SCREEN_H / 2;

      if (cx >= btnX && cx <= btnX + btnW && cy >= btnY && cy <= btnY + btnH) {
        onRespawn();
      }
    };

    canvasRef.current?.addEventListener("click", handleCanvasClick);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvasRef.current?.removeEventListener("click", handleCanvasClick);
    };
  }, [
    posRef,
    keysRef,
    hudRef,
    enemiesRef,
    attackRef,
    directionRef,
    gameStateRef,
    onRespawn,
  ]);

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
