export type Direction = "up" | "down" | "left" | "right";

export type Position = {
  x: number;
  y: number;
};

export type GameKeys = {
  [key: string]: boolean;
};

export type TileType = number;

export type TileMap = TileType[][];

export type HudState = {
  hp: number;
  hpMax: number;
  score: number;
};

export type AttackState = {
  active: boolean; // hitbox ativa agora?
  cooldown: number; // frames até poder atacar de novo
  duration: number; // frames que a hitbox ainda fica ativa
  direction: Direction; // direção do ataque
  hitFlash: number; // flash vermelho ao receber dano
  hitEnemyIds?: Set<number>;
};

export type GameState = "playing" | "dead";

export type DamageNumber = {
  id: number;
  x: number;
  y: number;
  value: number;
  timer: number;
  maxTimer: number;
  isCrit: boolean;
}
