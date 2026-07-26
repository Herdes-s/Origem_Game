import type { Position } from "../../types/game";
import { wouldCollide } from "../../utils/collision";

// Estado mínimo de knockback — tanto o player (via AttackState) quanto o
// Enemy já carregam esses dois campos.
export type KnockbackState = {
  knockbackX: number;
  knockbackY: number;
};

// Move `pos` pela velocidade residual de `state`, respeitando colisão
// (zera o eixo que bateu, igual ao movimento normal), e decai a
// velocidade uma taxa por frame — decaimento é proporcional ao tempo
// real decorrido (dt), não um valor fixo, senão o knockback dura mais ou
// menos dependendo do frame rate. Usado tanto pelo player (playerMovement.ts)
// quanto pelo inimigo (enemyAI.ts) — antes cada um tinha a própria cópia
// dessa lógica.
export function applyKnockback(
  pos: Position,
  state: KnockbackState,
  dt: number,
  decayPerFrame: number,
) {
  if (Math.abs(state.knockbackX) < 0.1) state.knockbackX = 0;
  if (Math.abs(state.knockbackY) < 0.1) state.knockbackY = 0;
  if (state.knockbackX === 0 && state.knockbackY === 0) return;

  const nextX = pos.x + state.knockbackX * dt;
  const nextY = pos.y + state.knockbackY * dt;

  if (!wouldCollide(nextX, pos.y)) pos.x = nextX;
  else state.knockbackX = 0;

  if (!wouldCollide(pos.x, nextY)) pos.y = nextY;
  else state.knockbackY = 0;

  const decay = Math.pow(decayPerFrame, dt);
  state.knockbackX *= decay;
  state.knockbackY *= decay;
}

// Reduz a força de um knockback RECEBIDO: RES do alvo (via `defense`, que
// já é RES*escala — ver attributeFormulas.ts) tira uma fatia PARCIAL da
// força (fator abaixo — "reduz um pouco", não anula), e o peso carregado
// (nêmese de tudo que é movimento) multiplica o resto. Piso em 0 — um
// alvo tanque + sobrecarregado pode chegar a não ser empurrado quase nada.
const INCOMING_KNOCKBACK_DEFENSE_FACTOR = 0.3;

export function computeIncomingKnockback(
  rawForce: number,
  defense: number,
  weightMultiplier: number,
): number {
  const afterDefense = Math.max(0, rawForce - defense * INCOMING_KNOCKBACK_DEFENSE_FACTOR);
  return afterDefense * weightMultiplier;
}
