import { useRef, useEffect } from "react";
import type { GameKeys, Position } from "../../types/game";
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

const FRAME_W = 64;
const FRAME_H = 64;
const FRAME_COUNT = 4;
const FRAME_SPEED = 8;

const DIRECTION_ROW: Record<string, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3,
};

type Props = {
  posRef: React.RefObject<Position>;
  keysRef: React.RefObject<GameKeys>;
};

function ScreenGame({ posRef, keysRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const directionRef = useRef("down");
  const isMovingRef = useRef(false);

  const spriteRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/sprites/player.png";
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

      isMovingRef.current = moving;

      if (moving) {

        frameTimerRef.current++;

        if (frameTimerRef.current >= FRAME_SPEED) {
          frameTimerRef.current = 0;

          frameIndexRef.current = (frameIndexRef.current + 1) % FRAME_COUNT;
        }
      } else {
        frameIndexRef.current = 0;
        frameTimerRef.current = 0;
      }

      // CÂMERA
      let camX = pos.x - SCREEN_W / 2;
      let camY = pos.y - SCREEN_H / 2;

      camX = Math.max(0, camX);
      camY = Math.max(0, camY);

      camX = Math.min(MAP_W - SCREEN_W, camX);
      camY = Math.min(MAP_H - SCREEN_H, camY);

      // LIMPA O FRAME
      ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

      // DESENHA O MAPA
      MAP.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          const worldX = colIndex * TILE_SIZE;
          const worldY = rowIndex * TILE_SIZE;

          const drawX = worldX - camX;
          const drawY = worldY - camY;

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

      // DESENHA O PERSONAGEM
      const screenX = pos.x - camX;
      const screenY = pos.y - camY;
      

      if (spriteRef.current) {

         const srcX = frameIndexRef.current * FRAME_W;
         const srcY = DIRECTION_ROW[directionRef.current] * FRAME_H;

         ctx.drawImage(
          spriteRef.current,
          srcX,
          srcY,
          FRAME_W,
          FRAME_H,
          screenX - FRAME_W / 2,
          screenY - FRAME_H / 2,
          FRAME_W,
          FRAME_H,
         );
      } else {
        
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(screenX - 10, screenY - 10, 20, 20);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [posRef, keysRef]);

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
