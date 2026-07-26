import type { Direction, Position } from "../../types/game";
import type { EnemyAttributes } from "./enemyAttributes";
import type { EnemyRace } from "../../data/maps/types";

export type EnemyBehavior = "patrol" | "wander" | "chase";

export type EnemyAnimState = "idle" | "move" | "attack" | "death";

// "omni" = uma visão só, igual pra qualquer direção (caso do slime — é um
// blob, não tem "lado"). "directional" = sprite com frente/costas/lados
// de verdade, como o goblin (e o player). Hoje as duas raças já são
// directional — campo mantido pro caso de uma raça "omni" futura.
export type EnemySpriteStyle = "omni" | "directional";

// Um TIER é a posição de um inimigo na hierarquia da própria raça (ex:
// slime → slimeHeroi → bossSlime). Substitui o antigo fraco/forte: em vez
// de só 2 variantes com range de atributo fixo, uma raça pode ter quantos
// tiers quiser, e quem decide QUEM nasce e em que level é o MAPA (ver
// data/maps/types.ts) — o tier só define características fixas do
// "cargo" (comportamento, aparência, XP/pontuação). Os atributos em si
// vêm do level (sorteados via AttributeWeights da raça, enemyLeveling.ts),
// não do tier.
export type EnemyTierConfig = {
  tier: string; // chave única dentro da raça (ex: "slimeHeroi")
  race: EnemyRace;
  label: string; // nome de exibição acima do inimigo
  spriteStyle: EnemySpriteStyle;
  spriteKey: string; // qual sheet do registro (useGameSprites.ts) reaproveitar
  sizeScale: number; // multiplicador de tamanho de desenho (1 = 64px normal)

  // Comportamento é decidido pelo TIER, não calculado a partir do level:
  // tiers baixos vagam soltos (wander, spawn aleatório no mapa), tiers
  // altos patrulham um caminho fixo (patrol, posição fixa no mapa).
  behavior: "wander" | "patrol";

  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  color: string;
  xpReward: number;
  scoreReward: number;
};

export type Enemy = {
  id: number;
  race: string;
  tier: string;
  tierLabel: string;
  level: number;

  x: number;
  y: number;

  hp: number;
  hpMax: number;
  damage: number;
  speed: number;
  knockbackForce: number; // força do empurrão que esse inimigo APLICA no player ao acertar (vem do FOR dele)
  defense: number; // reduz o dano recebido do player (vem de RES)
  critChance: number; // 0 a 1 — chance de crítico ao atacar o player
  critDamageMultiplier: number;

  // Atributos que geraram os stats acima — guardado pra referência/debug
  attributes: EnemyAttributes;

  sizeScale: number;
  spriteKey: string;
  visionRadius: number;
  contactRadius: number;
  damageCooldown: number;
  damageCooldownTimer: number;

  // Comportamento ATUAL (pode virar "chase" temporariamente); ao perder o
  // player de vista, volta pro baseBehavior definido pelo tier — mais
  // barato que resolver o tier de novo a cada frame.
  behavior: EnemyBehavior;
  baseBehavior: EnemyBehavior;

  color: string;
  xpReward: number;
  scoreReward: number;

  // ANIMAÇÂO
  animState: EnemyAnimState;
  frameIndex: number;
  frameTimer: number;

  // Direção que o inimigo está encarando — só importa pra raças com
  // spriteStyle "directional" (slime ignora, ele é "omni")
  direction: Direction;

  // Flash vermelho ao receber dano
  hitFlashTimer: number;

  //Knockback - velocidade residual após ser empurrado
  knockbackX: number;
  knockbackY: number;

  deathAnimDone: boolean;

  // Patrulha (tiers com behavior "patrol")
  patrolA?: Position;
  patrolB?: Position;
  patrolTarget?: "A" | "B";

  // Wander (tiers com behavior "wander")
  wanderDx?: number;
  wanderDy?: number;
  wanderTimer?: number;

  // Covil de spawn — se esse inimigo nasceu de um covil (TILE.SPAWN_CAVE),
  // guarda o id do covil pra ele saber quando pode nascer outro no lugar.
  denId?: number;
};
