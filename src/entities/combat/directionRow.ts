import type { Direction } from "../../types/game";

// Toda spritesheet direcional (player, goblin, slime) segue a mesma
// ordem de linha — como agora cada arquivo (walk/attack/death) só tem 4
// linhas (uma por direção), não precisa mais de offset "+4 pro ataque":
// é só o mesmo índice de linha, num arquivo diferente.
export const DIRECTION_ROW: Record<Direction, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3,
};
