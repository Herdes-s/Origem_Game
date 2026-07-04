import { getHpColor, roundRect } from "../utils/canvasHelpers";

const HUB_X = 12;
const HUB_Y = 12;
const BAR_W = 140;
const BAR_H = 14;
const BAR_RADIUS = 4;

// Desenha a HUD: barra de HP (canto sup. esquerdo) e score (canto sup.
// direito). Chamado fora do ctx.scale(ZOOM), em pixels de tela reais.
export function renderHud(
  ctx: CanvasRenderingContext2D,
  hp: number,
  hpMax: number,
  score: number,
  screenW: number,
) {
  const percent = Math.max(0, Math.min(1, hp / hpMax));

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("HP", HUB_X, HUB_Y + 10);

  const barX = HUB_X + 22;
  const barY = HUB_Y;

  ctx.fillStyle = "#1e293b";
  roundRect(ctx, barX, barY, BAR_W, BAR_H, BAR_RADIUS);
  ctx.fill();

  if (percent > 0) {
    ctx.fillStyle = getHpColor(percent);
    const filledW = Math.max(1, percent * BAR_W);
    roundRect(ctx, barX, barY, filledW, BAR_H, BAR_RADIUS);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(225,225,225,0.15)";
  roundRect(ctx, barX + 2, barY + 2, BAR_W - 4, BAR_H / 3, BAR_RADIUS - 1);
  ctx.fill();

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  roundRect(ctx, barX, barY, BAR_W, BAR_H, BAR_RADIUS);
  ctx.stroke();

  ctx.font = "10px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${hp} / ${hpMax}`, barX, barY + BAR_H + 13);

  ctx.font = "bold 11px monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "#fde68a";
  ctx.fillText(`${score} pts`, screenW - 12, 26);
  ctx.textAlign = "left";
}
