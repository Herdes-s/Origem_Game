import { useEffect, useRef, useState } from "react";
import { calcZoom } from "../../../data/map";

// Detecta capacidade de toque uma vez — não muda em runtime, então não
// precisa ser state. Usado junto da dimensão da tela pra decidir "é
// mobile?" de um jeito que sobrevive a girar o aparelho (ver calcZoom).
const isTouchDevice = 
  typeof window !== "undefined" && 
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// Controla o tamanho da tela (reativo ao resize/rotação/teclado virtual)
// e o zoom responsivo. Mantém refs espelhando os valores para o game loop
// (que roda em requestAnimationFrame e não pode depender de re-renders).
export function useScreenSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const [screenW, setScreenW] = useState(() => window.innerWidth);
  const [screenH, setScreenH] = useState(() => window.innerHeight);
  const zoom = calcZoom(screenW, screenH, isTouchDevice);

  const screenWRef = useRef(screenW);
  const screenHRef = useRef(screenH);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    screenWRef.current = screenW;
    screenHRef.current = screenH;
    zoomRef.current = zoom;

    if (canvasRef.current) {
      canvasRef.current.width = screenW;
      canvasRef.current.height = screenH;
    }
  }, [screenW, screenH, zoom, canvasRef]);

  useEffect(() => {
    const handleResize = () => {
      setScreenW(window.innerWidth);
      setScreenH(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return { screenW, screenH, zoom, screenWRef, screenHRef, zoomRef };
}
