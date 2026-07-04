// Flash vermelho ao receber dano — usa um canvas offscreen com
// globalCompositeOperation "source-atop" para tingir só os pixels
// visíveis do sprite (sem afetar o resto do frame).
//
// Antes esse bloco estava duplicado dentro do render do player e do
// render do inimigo. Agora é uma função só, reaproveitada pelos dois.

export function drawSpriteWithHitFlash(
  ctx: CanvasRenderingContext2D,
  flashCanvas: HTMLCanvasElement,
  flashCtx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  srcX: number,
  srcY: number,
  frameW: number,
  frameH: number,
  destX: number,
  destY: number,
  flashAlpha: number, // 0 a 1 — já calculado como (timer / duration) * intensidade
) {
  flashCtx.clearRect(0, 0, flashCanvas.width, flashCanvas.height);

  // 1. Desenha o frame atual do sprite no canvas temporário
  flashCtx.drawImage(image, srcX, srcY, frameW, frameH, 0, 0, frameW, frameH);

  // 2. source-atop: tint vermelho só sobre pixels visíveis do sprite
  flashCtx.globalCompositeOperation = "source-atop";
  flashCtx.fillStyle = `rgba(255, 60, 60, ${flashAlpha})`;
  flashCtx.fillRect(0, 0, frameW, frameH);
  flashCtx.globalCompositeOperation = "source-over";

  // 3. Copia o resultado para o canvas principal
  ctx.drawImage(flashCanvas, destX, destY);
}
