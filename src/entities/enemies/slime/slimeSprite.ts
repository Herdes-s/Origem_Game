export const SLIME_SPRITE = {
  weak: {
    src: "/assets/sprites/enemies/slime/slime_weak.png",
    frameW: 64, // 32px original × escala 2
    frameH: 64,
    frameCount: 4,
  },
  strong: {
    src: "/assets/sprites/enemies/slime/slime_strong.png",
    frameW: 64,
    frameH: 64,
    frameCount: 4,
  },
};

export const SLIME_FRAME_SPEED: Record<string, number> = {
  idle: 20,
  move: 14,
  attack: 6,
  death: 18,
}

export const SLIME_ANIMATION_ROW: Record<string, number> = {
  idle: 0,
  move: 1,
  attack: 2,
  death: 3,
};
