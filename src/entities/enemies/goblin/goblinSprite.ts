// Mesma estrutura do playerSprite.ts — 4 frames x 8 linhas de 64px:
// linhas 0-3 = walk down/up/left/right, linhas 4-7 = attack (garra)
// down/up/left/right. Diferente do slime, o goblin tem visão de verdade
// por direção, então usa exatamente o mesmo esquema do player.

export const GOBLIN_SPRITE = {
  src: "/assets/sprites/enemies/goblin/goblin.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
  frameSpeed: 8,
};

export const GOBLIN_DIRECTION_ROW: Record<string, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3,
};

export const GOBLIN_ATTACK_ROW: Record<string, number> = {
  down: 4,
  up: 5,
  left: 6,
  right: 7,
};

export const GOBLIN_ATTACK_FRAME_SPEED = 5;

// Usado pelo updateAnimation genérico do enemyAI.ts — idle/move reusam a
// mesma velocidade (não tem arte de idle separada) e "death" também,
// já que a morte é só o frame de walk atual com fade, não uma animação
// própria.
export const GOBLIN_FRAME_SPEED: Record<string, number> = {
  idle: 8,
  move: 8,
  attack: 5,
  death: 8,
};

// Não existe linha de morte dedicada (mesma folha do player, que também
// não tem) — a morte é só o frame de walk atual congelado com fade de
// alpha, sem precisar de arte extra.
