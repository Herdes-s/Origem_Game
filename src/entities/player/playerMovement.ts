import type { GameKeys, Position } from "../../types/game";
import { wouldCollide } from "../../utils/collision";
import { PLAYER_CONFIG } from "./player";

export function updatePlayerMovement(pos: Position, keys: GameKeys) {
  let dx = 0;
  let dy = 0;

  if (keys["ArrowUp"] || keys["w"]) dy -= 1;
  if (keys["ArrowDown"] || keys["s"]) dy += 1;
  if (keys["ArrowLeft"] || keys["a"]) dx -= 1;
  if (keys["ArrowRight"] || keys["d"]) dx += 1;

  if (dx !== 0 && dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx = dx / len;
    dy = dy / len;
  }

  const nextX = pos.x + dx * PLAYER_CONFIG.speed;
  const nextY = pos.y + dy * PLAYER_CONFIG.speed;

  if (!wouldCollide(nextX, pos.y)) pos.x = nextX;
  if (!wouldCollide(pos.x, nextY)) pos.y = nextY;
}
