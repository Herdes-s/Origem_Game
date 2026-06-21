export type Direction = "up" | "down" | "left" | "right";
 
export type Position = {
  x: number;
  y: number;
};
 
export type GameKeys = {
  [key: string]: boolean;
};

export type TileType = 0 | 1;

export type TileMap = TileType[][];

export type HudState = {
  hp: number;
  hpMax: number;
  score: number;
}