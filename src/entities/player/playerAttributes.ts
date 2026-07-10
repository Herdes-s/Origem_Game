import { PLAYER_CONFIG } from "./player";
import {
  computeDerivedCombatStats,
  type CombatBase,
  type DerivedCombatStats,
  type PrimaryAttributes as SharedPrimaryAttributes,
  type SecondaryAttributes as SharedSecondaryAttributes,
} from "../combat/attributeFormulas";

// ── ATRIBUTOS PRIMÁRIOS ──────────────────────────────────────────────────
// Recebem pontos de distribuição (level up). A fórmula que converte
// atributo em stat vive em entities/combat/attributeFormulas.ts — é a
// MESMA usada pelos inimigos (entities/enemies/enemyAttributes.ts).
export type PrimaryAttributes = SharedPrimaryAttributes;

// ── ATRIBUTOS SECUNDÁRIOS ────────────────────────────────────────────────
// Ficam numa aba separada na UI. Por enquanto só Precisão existe, e não
// recebe pontos de level up diretamente — mas já funciona no jogo (crítico)
// e é armazenada normalmente junto do resto dos atributos.
export type SecondaryAttributes = SharedSecondaryAttributes;

export type PlayerAttributes = {
  primary: PrimaryAttributes;
  secondary: SecondaryAttributes;
};

export const DEFAULT_ATTRIBUTES: PlayerAttributes = {
  primary: { for: 5, des: 5, con: 5, res: 5 },
  secondary: { precisao: 5 },
};

export type DerivedPlayerStats = DerivedCombatStats;

const PLAYER_BASE: CombatBase = {
  hpMax: PLAYER_CONFIG.hpMax,
  speed: PLAYER_CONFIG.speed,
  damage: PLAYER_CONFIG.damage,
  attackCooldown: PLAYER_CONFIG.attackCooldown,
  knockbackForce: PLAYER_CONFIG.knockbackForce,
};

// Combina a base fixa (player.ts) com os bônus dos atributos atuais.
export function computeDerivedStats(
  attributes: PlayerAttributes,
): DerivedPlayerStats {
  return computeDerivedCombatStats(PLAYER_BASE, attributes.primary, attributes.secondary);
}

// Gasta 1 ponto de level up num atributo primário — retorna um objeto novo
// (não muta), pra combinar direto com setAttributes(prev => ...).
export function allocatePoint(
  attributes: PlayerAttributes,
  key: keyof PrimaryAttributes,
): PlayerAttributes {
  return {
    ...attributes,
    primary: {
      ...attributes.primary,
      [key]: attributes.primary[key] + 1,
    },
  };
}
