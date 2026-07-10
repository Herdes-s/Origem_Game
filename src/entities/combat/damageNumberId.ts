// Contador compartilhado de ID pra DamageNumber — tanto o dano que o
// player causa (playerMovement.ts) quanto o dano que ele recebe
// (enemyAI.ts) empurram pro mesmo array, então precisam de uma única
// fonte de IDs pra nunca colidir.
let nextId = 0;

export function nextDamageNumberId(): number {
  return nextId++;
}
