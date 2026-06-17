import { useEffect, useRef } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";

import type { GameKeys } from "../../types/game";

const SCREEN_W = window.innerWidth * 0.9;
const SCREEN_H = 400;
const SPEED = 3;

function GamePage() {
  const posRef = useRef({ x: SCREEN_W / 2, y: SCREEN_H / 2 });

  const keysRef = useRef<GameKeys>({});

  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx = dx / len;
        dy = dy / len;
      }

      pos.x = Math.max(0, Math.min(SCREEN_W, pos.x + dx * SPEED));
      pos.y = Math.max(0, Math.min(SCREEN_H, pos.y + dy * SPEED));

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
      <ScreenGame posRef={posRef} width={SCREEN_W} height={SCREEN_H} />
      <ControlGame keysRef={keysRef} />
    </>
  );
}

export default GamePage;
