import type { Position } from "../../types/game";
import type { Enemy, EnemyRaceConfig, EnemyVariant } from "./enemyTypes";


let nextId = 1;

function randBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function createEnemy(
    config: EnemyRaceConfig,
    variant: EnemyVariant,
    x: number,
    y: number,
    patrolA?: Position,
    patrolB?: Position,
): Enemy {
    const hp = Math.round(randBetween(...config.hpRange));
    const damage = Math.round(randBetween(...config.damageRange));
    const speed = Math.round(randBetween(...config.speedRange));

    const isStrong = variant === "strong" && patrolA && patrolB;
    const behavior = isStrong ? "patrol" : "wander";

    return {

        id: nextId++,
        race: config.race,
        variant,

        x,
        y,

        hp,
        hpMax: hp,
        damage,
        speed,

        visionRadius: config.visionRadius,
        contactRadius: config.contactRadius,
        damageCooldown: config.damageCooldown,
        damageCooldownTimer: 0,

        behavior,
        color: config.color,

        patrolA: isStrong ? patrolA : undefined,
        patrolB: isStrong ? patrolB : undefined,
        patrolTarget: isStrong ? "B" : undefined,

        wanderDx: behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
        wanderDy: behavior === "wander" ? (Math.random() * 2 - 1) : undefined,
        wanderTimer: behavior === "wander" ? Math.round(randBetween(60, 180)) : undefined

    };
}