import { useEffect, useRef } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";
import type { GameKeys, HudState } from "../../types/game";
import { MAP_H, MAP_W, TILE_SIZE } from "../../data/map";
import { wouldCollide } from "../../utils/cillision";

const SPEED = 3;

const START_X = Math.floor((MAP_W / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
const START_Y = Math.floor((MAP_H / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

function GamePage() {
  const posRef = useRef({ x: START_X, y: START_Y });

  const keysRef = useRef<GameKeys>({});

  const rafRef = useRef<number>(0);

  const hudRef = useRef<HudState>({
    hp: 100,
    hpMax: 100,
    score: 0,
  }) 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
      }

      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      const keys = keysRef.current;
      const pos = posRef.current;

      let dx = 0;
      let dy = 0;

      if (keys["ArrowUp"] || keys["w"]) dy -= 1;
      if (keys["ArrowDown"] || keys["s"]) dy += 1;
      if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
      if (keys["ArrowRight"] || keys["d"]) dx += 1;

      // Normalização diagonal
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx = dx / len;
        dy = dy / len;
      }

      const nextX = pos.x + dx * SPEED;
      const nextY = pos.y + dy * SPEED;

      // Colisão com separação de eixos (deslizamento)
      if (!wouldCollide(nextX, pos.y)) {
        pos.x = nextX
      }

      if (!wouldCollide(pos.x, nextY)) {
        pos.y = nextY
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <ScreenGame posRef={posRef} keysRef={keysRef} hudRef={hudRef} />
      <ControlGame keysRef={keysRef} />
    </>
  );
}

export default GamePage;
