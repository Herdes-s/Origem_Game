import { getItemDefinition } from "../../../entities/items/itemRegistry";
import type { ItemPickup } from "../../../entities/items/world/itemPickup";

const PICKUP_RADIUS = 8; // placeholder — mesmo espírito do círculo de inimigo sem sprite

// Desenha os itens largados no mundo — por enquanto sempre em círculo com
// a cor da ItemDefinition (nenhum item tem sprite próprio ainda). Um
// contorno claro ajuda a diferenciar item de chão/textura no fundo.
export function renderPickups(
  ctx: CanvasRenderingContext2D,
  pickups: ItemPickup[],
  camX: number,
  camY: number,
  screenW: number,
  screenH: number,
) {
  for (const pickup of pickups) {
    const px = pickup.x - camX;
    const py = pickup.y - camY;

    if (px < -PICKUP_RADIUS || px > screenW + PICKUP_RADIUS || py < -PICKUP_RADIUS || py > screenH + PICKUP_RADIUS) {
      continue;
    }

    const def = getItemDefinition(pickup.itemId);
    const color = def?.color ?? "#e2e8f0";

    ctx.beginPath();
    ctx.arc(px, py, PICKUP_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (pickup.quantity > 1) {
      ctx.font = "8px monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.fillText(String(pickup.quantity), px, py - PICKUP_RADIUS - 3);
      ctx.textAlign = "left";
    }
  }
}
