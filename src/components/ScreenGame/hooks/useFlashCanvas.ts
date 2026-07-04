import { useEffect, useRef } from "react";

// Canvas offscreen reutilizado pelo player e pelos inimigos para o efeito
// de flash vermelho (evita criar um canvas novo a cada frame).
export function useFlashCanvas(size = 64) {
  const flashCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    flashCanvasRef.current = canvas;
    flashCtxRef.current = canvas.getContext("2d");
  }, [size]);

  return { flashCanvasRef, flashCtxRef };
}
