import { useEffect } from "react";
import type { GameKeys } from "../../../types/game";

const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

// Escuta o teclado e mantém o estado das teclas pressionadas em keysRef
// (ref, não state — lido a cada frame do game loop). Previne o scroll da
// página quando as setas direcionais são usadas para mover o player.
export function useKeyboardControls(keysRef: React.RefObject<GameKeys>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (ARROW_KEYS.includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keysRef]);
}
