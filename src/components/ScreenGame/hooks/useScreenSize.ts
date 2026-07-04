import { useEffect, useRef, useState } from "react";
import { calcZoom } from "../../../data/map";

// Controla o tamanho da tela (reativo ao resize/rotação/teclado virtual)
// e o zoom responsivo. Mantém refs espelhando os valores para o game loop
// (que roda em requestAnimationFrame e não pode depender de re-renders).
export function useScreenSize(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const [screenW, setScreenW] = useState(() => window.innerWidth);
  const [screenH, setScreenH] = useState(() => window.innerHeight);
  const zoom = calcZoom(screenW);

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
