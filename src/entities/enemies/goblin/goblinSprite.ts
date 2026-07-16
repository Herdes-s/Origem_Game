// Walk, attack e death agora são 3 arquivos separados (256x256 cada, 4
// linhas — uma por direção), em vez de uma folha só. Compartilhado pelas
// duas variantes (fraco/forte) — só os atributos diferem entre elas.

export const GOBLIN_WALK_SPRITE = {
  src: "/assets/sprites/enemies/goblin/goblin_walk.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};

export const GOBLIN_ATTACK_SPRITE = {
  src: "/assets/sprites/enemies/goblin/goblin_attack.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};

export const GOBLIN_DEATH_SPRITE = {
  src: "/assets/sprites/enemies/goblin/goblin_death.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};

// idle/move reusam a mesma velocidade (não tem arte de idle separada)
export const GOBLIN_FRAME_SPEED: Record<string, number> = {
  idle: 8,
  move: 8,
  attack: 5,
  death: 10,
};
