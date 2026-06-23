import type { HudState, Position } from "../../types/game";
import { wouldCollide } from "../../utils/cillision";
import type { Enemy } from "./enemyTypes";


function dist(ax: number, ay: number, bx: number, by: number): number {
    return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

function normalize(dx: number, dy: number): [number, number] {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return [0, 0];
    return [dx / len, dy / len];
}

function moveEnemy(enemy: Enemy, dx: number, dy:number) {
    const [ndx, ndy] = normalize(dx, dy);
    const nextX = enemy.x + ndx * enemy.speed;
    const nextY = enemy.y + ndy * enemy.speed;

    if (!wouldCollide(nextX, enemy.y)) enemy.x = nextX;
    if (!wouldCollide(enemy.x, nextY)) enemy.y = nextY;
}

// COMPORTAMENTOS
function chase(enemy: Enemy, player: Position) {
    moveEnemy(enemy, player.x - enemy.x, player.y - enemy.y);
}

function patrol(enemy: Enemy) {
    if(!enemy.patrolA || !enemy.patrolB || !enemy.patrolTarget) return;

    const target = enemy.patrolTarget === "A" ? enemy.patrolA : enemy.patrolB;
    const d = dist(enemy.x, enemy.y, target.x, target.y);

    if (d < 4) {
        enemy.patrolTarget = enemy.patrolTarget === "A" ? "B" : "A";
        return;
    }

    moveEnemy(enemy, target.x - enemy.x, target.y - enemy.y);
}

function wander(enemy: Enemy) {
    if (
        enemy.wanderDx === undefined ||
        enemy.wanderDy === undefined || 
        enemy.wanderTimer === undefined
    ) return;

    if (enemy.wanderTimer <= 0) {
        enemy.wanderDx = Math.random() * 2 - 1;
        enemy.wanderDy = Math.random() * 2 - 1;
        enemy.wanderTimer = 60 + Math.round(Math.random() * 120);
    }

    enemy.wanderTimer--;
    moveEnemy(enemy, enemy.wanderDx, enemy.wanderDy);
}

function tryDamagePlayer(enemy: Enemy, player: Position, hud: HudState) {
    if (enemy.damageCooldownTimer > 0) {
        enemy.damageCooldownTimer--;
        return;
    }

    if (dist(enemy.x, enemy.y, player.x, player.y) <= enemy.contactRadius) {
        hud.hp = Math.max(0, hud.hp - enemy.damage);
        enemy.damageCooldownTimer = enemy.damageCooldown;
    }
}

// FUNÇÂO PRINCIPAL

export function updateEnemies(
    enemies: Enemy[],
    player: Position,
    hud: HudState,
) {
    for (const enemy of enemies) {
        const d = dist(enemy.x, enemy.y, player.x, player.y);

        if (d <= enemy.visionRadius) {
            enemy.behavior = "chase";
        } else {
            enemy.behavior = enemy.variant === "strong" ? "patrol" : "wander";
        }

        switch (enemy.behavior) {
            case "chase": chase(enemy, player); break;
            case "patrol": patrol(enemy); break;
            case "wander": wander(enemy); break;
        }

        tryDamagePlayer(enemy, player, hud);
    }
}