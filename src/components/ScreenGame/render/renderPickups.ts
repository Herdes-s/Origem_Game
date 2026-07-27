import { getItemDefinition } from "../../../entities/items/itemRegistry";
import type { ItemPickup } from "../../../entities/items/world/itemPickup";

const PICKUP_RADIUS = 8; // placeholder — mesmo espírito do círculo de inimigo sem sprite
const PICKUP_ICON_SIZE = 20; // tamanho de desenho quando tem imagem de verdade

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
  icons: Map<string, HTMLImageElement>,
) {
  for (const pickup of pickups) {
    const px = pickup.x - camX;
    const py = pickup.y - camY;

    if (
      px < -PICKUP_ICON_SIZE ||
      px > screenW + PICKUP_ICON_SIZE ||
      py < -PICKUP_ICON_SIZE ||
      py > screenH + PICKUP_ICON_SIZE
    ) {
      continue;
    }

    const def = getItemDefinition(pickup.itemId);
    const icon = icons.get(pickup.itemId);

    if (icon) {
      ctx.drawImage(
        icon,
        px - PICKUP_ICON_SIZE / 2,
        py - PICKUP_ICON_SIZE / 2,
        PICKUP_ICON_SIZE,
        PICKUP_ICON_SIZE,
      );
    } else {
      ctx.beginPath();
      ctx.arc(px, py, PICKUP_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = def?.color ?? "#e2e8f0";
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (pickup.quantity > 1) {
      const labelY = icon
        ? py - PICKUP_ICON_SIZE / 2 - 3
        : py - PICKUP_RADIUS - 3;
      ctx.font = "8px monospace";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.fillText(String(pickup.quantity), px, labelY);
      ctx.textAlign = "left";
    }
  }
}
