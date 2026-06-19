import { useRef, useEffect } from "react";
import type { Position } from "../../types/game";
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

const PLAYER_SIZE = 20;

type Props = {
  posRef: React.RefObject<Position>;
};

function ScreenGame({ posRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const pos = posRef.current;

      let camX = pos.x - SCREEN_W / 2;
      let camY = pos.y - SCREEN_H / 2;

      camX = Math.max(0, camX);
      camY = Math.max(0, camY);

      camX = Math.min(MAP_W - SCREEN_W, camX);
      camY = Math.min(MAP_H - SCREEN_H, camY);

      ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

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

      const screenX = pos.x - camX;
      const screenY = pos.y - camY;
      const half = PLAYER_SIZE / 2;

      ctx.fillStyle = "#fde68a";
      ctx.fillRect(screenX - half, screenY - half, PLAYER_SIZE, PLAYER_SIZE);

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX - half, screenY - half, PLAYER_SIZE, PLAYER_SIZE);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [posRef]);

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
