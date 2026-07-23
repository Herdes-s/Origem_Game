export const TILE_SIZE = 64;

const VISIBLE_TILES_MOBILE = 5;
const VISIBLE_TILES_DESKTOP = 18;

// "Mobile" depende de toque + a menor das duas dimensões, não só a
// largura. O zoom em si também usa a MENOR dimensão como referência —
// assim o tamanho do tile na tela fica igual girando o aparelho ou não;
// só o lado comprido passa a mostrar mais tiles (visão mais larga em
// paisagem, não mais perto). Antes, virar a tela fazia a largura virar o
// lado comprido, e a conta tentava encaixar os mesmos 5 tiles nesse
// espaço bem maior — cada tile ficava enorme.
export function calcZoom(
  screenW: number,
  screenH: number,
  isTouchDevice: boolean,
): number {
  const isMobile = isTouchDevice && (screenW < 768 || screenH < 768);
  const visibleTiles = isMobile ? VISIBLE_TILES_MOBILE : VISIBLE_TILES_DESKTOP;

  const referenceSize = Math.min(screenW, screenH);

  return referenceSize / (visibleTiles * TILE_SIZE);
}
