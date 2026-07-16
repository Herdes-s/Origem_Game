// Slime agora é direcional também (frente/costas/lados), igual player e
// goblin — deixou de ser "visão única". Walk/attack/death são 3 arquivos
// separados por variante (fraco e forte têm cor e tamanho diferentes,
// então cada um tem seu próprio conjunto de 3 arquivos).

export const SLIME_WEAK_WALK_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_weak_walk.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};
export const SLIME_WEAK_ATTACK_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_weak_attack.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};
export const SLIME_WEAK_DEATH_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_weak_death.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};

// ---

export const SLIME_STRONG_WALK_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_strong_walk.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};
export const SLIME_STRONG_ATTACK_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_strong_attack.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};
export const SLIME_STRONG_DEATH_SPRITE = {
  src: "/assets/sprites/enemies/slime/slime_strong_death.png",
  frameW: 64,
  frameH: 64,
  frameCount: 4,
};

// ---

export const SLIME_FRAME_SPEED: Record<string, number> = {
  idle: 14,
  move: 14,
  attack: 6,
  death: 12,
};
