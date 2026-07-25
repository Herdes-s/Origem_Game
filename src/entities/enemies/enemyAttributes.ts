import {
  computeDerivedCombatStats,
  type CombatBase,
  type DerivedCombatStats,
  type PrimaryAttributes,
  type SecondaryAttributes,
} from "../combat/attributeFormulas";
import {
  rollPrimaryAttributesForLevel,
  type AttributeWeights,
} from "./enemyLeveling";

export type EnemyAttributes = {
  primary: PrimaryAttributes;
  secondary: SecondaryAttributes;
};

// Precisão fica fixa por enquanto (mesmo baseline inicial do player) —
// diferente dos primários, não recebe pontos de level. Fácil de deixar
// escalar por tier futuramente (um `precisaoBonus` no EnemyTierConfig),
// mas não precisou disso ainda pra sentir a diferença entre tiers.
const BASE_PRECISAO = 5;

// Sorteia os atributos de um inimigo pro level dado, com a "personalidade"
// (AttributeWeights) da raça dele — ver enemyLeveling.ts pro sorteio em si.
export function rollEnemyAttributesForLevel(
  weights: AttributeWeights,
  level: number,
): EnemyAttributes {
  return {
    primary: rollPrimaryAttributesForLevel(weights, level),
    secondary: { precisao: BASE_PRECISAO },
  };
}

// Inimigos não têm uma "base" fixa como o player (PLAYER_CONFIG) — tudo
// vem dos atributos sorteados. Base zerada = mesma fórmula, sem bônus fixo.
const ENEMY_BASE: CombatBase = {
  hpMax: 0,
  speed: 0,
  damage: 0,
  attackCooldown: 0,
  knockbackForce: 0,
};

export function computeEnemyStats(
  attributes: EnemyAttributes,
): DerivedCombatStats {
  return computeDerivedCombatStats(
    ENEMY_BASE,
    attributes.primary,
    attributes.secondary,
  );
}
