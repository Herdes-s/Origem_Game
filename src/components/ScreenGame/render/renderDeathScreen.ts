import { roundRect } from "../utils/canvasHelpers";

const BTN_W = 160;
const BTN_H = 44;

// Posição/tamanho do botão de renascer — extraído para ser reaproveitado
// tanto no desenho quanto na detecção de clique em index.tsx (evita
// duplicar os mesmos números mágicos nos dois lugares).
export function getRespawnButtonRect(screenW: number, screenH: number) {
  return {
    x: screenW / 2 - BTN_W / 2,
    y: screenH / 2,
    w: BTN_W,
    h: BTN_H,
  };
}

// Tela de morte: overlay escuro + texto + score final + botão de renascer
// desenhado como retângulo clicável no canvas.
export function renderDeathScreen(
  ctx: CanvasRenderingContext2D,
  screenW: number,
  screenH: number,
  score: number,
) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, screenW, screenH);

  ctx.font = "bold 28px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("Você morreu", screenW / 2, screenH / 2 - 30);

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#fde68a";
  ctx.fillText(`Score: ${score} pts`, screenW / 2, screenH / 2 - 20);

  const btn = getRespawnButtonRect(screenW, screenH);

  ctx.fillStyle = "#166534";
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
  ctx.fill();

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
  ctx.stroke();

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#dcfce7";
  ctx.fillText("↺  Renascer", screenW / 2, btn.y + 28);

  ctx.textAlign = "left";
}
