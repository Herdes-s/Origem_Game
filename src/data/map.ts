export const TILE_SIZE = 64;

const VISIBLE_TILES_MOBILE = 5;
const VISIBLE_TILES_DESKTOP = 18;

// "Mobile" depende de toque + a menor das duas dimensões, não só a
// largura. A referência "menor dimensão" pro zoom só vale pro MOBILE —
// é o que faz o tamanho do tile ficar igual girando o aparelho ou não.
// Desktop não gira: sempre usa a largura, como já era, senão a altura
// (menor que a largura na maioria dos monitores) encolhia o zoom à toa.
export function calcZoom(
  screenW: number,
  screenH: number,
  isTouchDevice: boolean,
): number {
  const isMobile = isTouchDevice && (screenW < 768 || screenH < 768);

  if (isMobile) {
    const referenceSize = Math.min(screenW, screenH);
    return referenceSize / (VISIBLE_TILES_MOBILE * TILE_SIZE);
  }

  return screenW / (VISIBLE_TILES_DESKTOP * TILE_SIZE);
}