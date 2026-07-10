// Fórmula única de "atributo → stat de combate", compartilhada entre
// player e inimigos — pedido explícito: inimigos devem escalar com a
// MESMA fórmula/escala do player, só que a partir de uma base diferente
// (o player tem uma base fixa em player.ts; inimigos partem de zero, já
// que tudo neles vem dos atributos sorteados).

export type PrimaryAttributes = {
  for: number; // Força — dano, força de knockback
  des: number; // Destreza — velocidade, cooldown de ataque
  con: number; // Constituição — vida máxima
  res: number; // Resistência — redução do dano recebido
};

export type SecondaryAttributes = {
  precisao: number; // Precisão — chance de acerto crítico
};

// Quanto cada ponto de atributo vale em stat de jogo. Único lugar que
// mexe pra recalibrar balanceamento — player e inimigos usam os mesmos
// números daqui.
export const SCALING = {
  damagePerFor: 1.5,
  knockbackPerFor: 0.6,

  speedPerDes: 0.3,
  cooldownReductionPerDes: 0.4,

  hpPerCon: 8,

  defensePerRes: 0.6,

  critChancePerPrecisao: 0.02,
  critDamageMultiplier: 1.5,
};

// Piso de cooldown — evita que DES alto vire metralhadora
export const MIN_ATTACK_COOLDOWN = 8;

export type CombatBase = {
  hpMax: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  knockbackForce: number;
};

export type DerivedCombatStats = {
  hpMax: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  knockbackForce: number;
  defense: number;
  critChance: number; // 0 a 1
  critDamageMultiplier: number;
};

// Combina uma base (fixa, pode ser zero) com os bônus dos atributos.
// Barato o bastante pra rodar a cada frame — não precisa memoizar.
export function computeDerivedCombatStats(
  base: CombatBase,
  primary: PrimaryAttributes,
  secondary: SecondaryAttributes,
): DerivedCombatStats {
  return {
    hpMax: base.hpMax + primary.con * SCALING.hpPerCon,
    speed: base.speed + primary.des * SCALING.speedPerDes,
    damage: base.damage + primary.for * SCALING.damagePerFor,
    attackCooldown: Math.max(
      MIN_ATTACK_COOLDOWN,
      base.attackCooldown - primary.des * SCALING.cooldownReductionPerDes,
    ),
    knockbackForce: base.knockbackForce + primary.for * SCALING.knockbackPerFor,
    defense: primary.res * SCALING.defensePerRes,
    critChance: Math.min(1, secondary.precisao * SCALING.critChancePerPrecisao),
    critDamageMultiplier: SCALING.critDamageMultiplier,
  };
}
