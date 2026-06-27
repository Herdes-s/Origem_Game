export const PLAYER_CONFIG = {
  hpMax: 100,
  speed: 3,
  damage: 15, // dano base do ataque

  // Ataque
  attackDuration: 8, // frames que a hitbox fica ativa
  attackCooldown: 25, // frames entre ataques (~0.4s a 60fps)

  // Hitbox de ataque
  hitboxOffset: 12, // distância da frente do player
  hitboxW: 52, // largura da hitbox
  hitboxH: 44, // altura da hitbox

  // Knockback fixo aplicado ao inimigo ao ser atingido
  knockbackForce: 5, // velocidade inicial do knockback
  knockbackDecay: 0.8, // multiplicador por frame (desacelera suavemente)

  // Flash vermelho ao receber dano
  hitFlashDuration: 10, // frames de flash
};

export const PLAYER_START = {
  x: 0,
  y: 0,
};
