import { useRef, useEffect } from "react";
import type { Position } from "../../types/game";
import styles from "./ScreenGame.module.scss";
import { MAP, MAP_H, MAP_W, TILE_COLORS, TILE_SIZE } from "../../data/map";

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
      ctx.clearRect(0, 0, MAP_W, MAP_H);

      MAP.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          const x = colIndex * TILE_SIZE;
          const y = rowIndex * TILE_SIZE;

          ctx.fillStyle = TILE_COLORS[tile]

          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        });
      });

      const pos = posRef.current;

      if (pos) {
        const half = PLAYER_SIZE / 2;

        ctx.fillStyle = "#fde68a";
        ctx.fillRect(pos.x - half, pos.y - half, PLAYER_SIZE, PLAYER_SIZE);

        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.strokeRect(pos.x - half, pos.y - half, PLAYER_SIZE, PLAYER_SIZE);
      }

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
       width={MAP_W}
       height={MAP_H}
       className={styles.canvas}
       />
      </div>
    </section>
  );
}

export default ScreenGame;
