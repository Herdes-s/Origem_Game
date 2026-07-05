import { PLAYER_CONFIG } from "./player";

// ── ATRIBUTOS PRIMÁRIOS ──────────────────────────────────────────────────
// Recebem pontos de distribuição (level up, futuramente) e afetam stats
// centrais do jogo diretamente.
export type PrimaryAttributes = {
  for: number; // Força — dano do soco, força do knockback aplicado
  des: number; // Destreza — velocidade de movimento, cooldown de ataque
  con: number; // Constituição — vida máxima
};

// ── ATRIBUTOS SECUNDÁRIOS ────────────────────────────────────────────────
// Ficam numa aba separada na UI. Por enquanto só Precisão existe, e não
// recebe pontos de level up diretamente — mas já funciona no jogo (crítico)
// e é armazenada normalmente junto do resto dos atributos.
export type SecondaryAttributes = {
  precisao: number; // Precisão — chance de acerto crítico
};

export type PlayerAttributes = {
  primary: PrimaryAttributes;
  secondary: SecondaryAttributes;
};

export const DEFAULT_ATTRIBUTES: PlayerAttributes = {
  primary: { for: 5, des: 5, con: 5 },
  secondary: { precisao: 5 },
};

// ── ESCALAS ───────────────────────────────────────────────────────────────
// Quanto cada ponto de atributo vale em stat de jogo. É só aqui que mexe
// pra recalibrar balanceamento — nada disso está espalhado pelo código.
const SCALING = {
  damagePerFor: 1.5, // dano do soco por ponto de FOR
  knockbackPerFor: 0.3, // força de knockback por ponto de FOR

  speedPerDes: 0.15, // px/frame de velocidade por ponto de DES
  cooldownReductionPerDes: 0.4, // frames de cooldown a menos por ponto de DES

  hpPerCon: 8, // HP máximo por ponto de CON

  critChancePerPrecisao: 0.02, // +2% de chance de crítico por ponto
  critDamageMultiplier: 1.5, // dano crítico = dano normal x1.5
};

// Piso de cooldown — evita que DES alto vire metralhadora
const MIN_ATTACK_COOLDOWN = 8;

export type DerivedPlayerStats = {
  hpMax: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  knockbackForce: number;
  critChance: number; // 0 a 1
  critDamageMultiplier: number;
};

// Combina a base fixa (player.ts) com os bônus dos atributos atuais.
// Barato o bastante pra rodar a cada frame do game loop — não precisa
// memoizar, só recalcular quando os atributos mudarem de fato (level up).
export function computeDerivedStats(
  attributes: PlayerAttributes,
): DerivedPlayerStats {
  const { for: forc, des, con } = attributes.primary;
  const { precisao } = attributes.secondary;

  return {
    hpMax: PLAYER_CONFIG.hpMax + con * SCALING.hpPerCon,
    speed: PLAYER_CONFIG.speed + des * SCALING.speedPerDes,
    damage: PLAYER_CONFIG.damage + forc * SCALING.damagePerFor,
    attackCooldown: Math.max(
      MIN_ATTACK_COOLDOWN,
      PLAYER_CONFIG.attackCooldown - des * SCALING.cooldownReductionPerDes,
    ),
    knockbackForce: PLAYER_CONFIG.knockbackForce + forc * SCALING.knockbackPerFor,
    critChance: Math.min(1, precisao * SCALING.critChancePerPrecisao),
    critDamageMultiplier: SCALING.critDamageMultiplier,
  };
}
