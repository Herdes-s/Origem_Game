import type { DamageNumber } from "../../../types/game";

// Números de dano flutuantes — sobem gradualmente e somem conforme o timer
// cai. Desenhados dentro do ctx.scale(ZOOM), ou seja, em coordenadas de mundo.
export function renderDamageNumbers(
  ctx: CanvasRenderingContext2D,
  damageNumbers: DamageNumber[],
  camX: number,
  camY: number,
  viewW: number,
  viewH: number,
) {
  for (const dn of damageNumbers) {
    const dnX = dn.x - camX;
    const dnY = dn.y - camY;

    // Culling — pula se fora da tela
    if (dnX < -40 || dnX > viewW + 40 || dnY < -40 || dnY > viewH + 40) continue;

    // Alpha: começa em 1.0 e vai a 0 conforme o timer cai
    const alpha = dn.timer / dn.maxTimer;

    // Tamanho: começa menor e cresce levemente no início (punch feel)
    // Crítico cresce mais e fica maior no pico, pra se destacar
    const scale =
      dn.timer > dn.maxTimer * 0.8
        ? 1 + (1 - dn.timer / dn.maxTimer) * (dn.isCrit ? 3 : 2)
        : dn.isCrit
          ? 1.6
          : 1.2;

    const fontSize = Math.round(8 * scale);
    const label = dn.isCrit ? `${dn.value}!` : String(dn.value);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "center";

    // Sombra para legibilidade sobre qualquer fundo
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(label, dnX + 1, dnY + 1);

    // Texto principal — dourado normal, vermelho-alaranjado no crítico
    ctx.fillStyle = dn.isCrit ? "#f97316" : "#fde68a";
    ctx.fillText(label, dnX, dnY);

    ctx.restore();
  }
  ctx.textAlign = "left";
}
