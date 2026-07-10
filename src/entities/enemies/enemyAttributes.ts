import {
  computeDerivedCombatStats,
  type CombatBase,
  type DerivedCombatStats,
  type PrimaryAttributes,
  type SecondaryAttributes,
} from "../combat/attributeFormulas";

export type EnemyAttributes = {
  primary: PrimaryAttributes;
  secondary: SecondaryAttributes;
};

export type AttributeRange = { min: number; max: number };

// Range de cada atributo pra uma raça/variante — cada inimigo que nasce
// sorteia um valor dentro desse intervalo, então dois slimes fracos não
// saem idênticos.
export type EnemyAttributeRanges = {
  for: AttributeRange;
  des: AttributeRange;
  con: AttributeRange;
  res: AttributeRange;
  precisao: AttributeRange;
};

function rollInRange(range: AttributeRange): number {
  return Math.round(range.min + Math.random() * (range.max - range.min));
}

// Sorteia os atributos de um inimigo dentro dos ranges da raça/variante.
export function rollEnemyAttributes(ranges: EnemyAttributeRanges): EnemyAttributes {
  return {
    primary: {
      for: rollInRange(ranges.for),
      des: rollInRange(ranges.des),
      con: rollInRange(ranges.con),
      res: rollInRange(ranges.res),
    },
    secondary: {
      precisao: rollInRange(ranges.precisao),
    },
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

export function computeEnemyStats(attributes: EnemyAttributes): DerivedCombatStats {
  return computeDerivedCombatStats(ENEMY_BASE, attributes.primary, attributes.secondary);
}
