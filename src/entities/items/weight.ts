// Peso é o "nêmese" da velocidade: quanto mais perto da capacidade de
// carga (que escala com FOR — quem é forte carrega mais) o player está,
// mais lento ele fica, até travar a coleta ao chegar no limite. A mesma
// carga pesada também reduz a força de knockback do golpe (o soco de
// alguém sobrecarregado sai mais fraco). Único lugar que mexe pra
// recalibrar esse balanceamento — mesmo princípio do SCALING em
// entities/combat/attributeFormulas.ts.
export const WEIGHT_SCALING = {
  baseCarryCapacity: 10, // capacidade de referência com FOR = 0
  carryCapacityPerFor: 4, // cada ponto de FOR = +4 de capacidade de carga

  // Abaixo desse % da capacidade, peso não penaliza nada — só perto do
  // limite que começa a doer.
  penaltyStartRatio: 0.6,

  // Multiplicadores mínimos, atingidos em 100% da capacidade (e travados
  // nesse piso mesmo que o peso de alguma forma passe disso).
  minSpeedMultiplier: 0.4,
  minKnockbackMultiplier: 0.5,
};

// FOR 5 (valor inicial) → 10 + 5*4 = 30 de capacidade.
export function computeCarryCapacity(forAttribute: number): number {
  return (
    WEIGHT_SCALING.baseCarryCapacity +
    forAttribute * WEIGHT_SCALING.carryCapacityPerFor
  );
}

// Interpola de 1.0 (sem penalidade) até `minMultiplier` conforme o peso
// atual se aproxima da capacidade, começando em `penaltyStartRatio`. Fica
// travado em `minMultiplier` a partir de 100% da capacidade.
function computeWeightMultiplier(
  currentWeight: number,
  capacity: number,
  minMultiplier: number,
): number {
  if (capacity <= 0) return minMultiplier;

  const ratio = Math.min(1, currentWeight / capacity);
  const { penaltyStartRatio } = WEIGHT_SCALING;

  if (ratio <= penaltyStartRatio) return 1;

  const t = (ratio - penaltyStartRatio) / (1 - penaltyStartRatio);
  return 1 - t * (1 - minMultiplier);
}

export function computeSpeedMultiplier(
  currentWeight: number,
  capacity: number,
): number {
  return computeWeightMultiplier(
    currentWeight,
    capacity,
    WEIGHT_SCALING.minSpeedMultiplier,
  );
}

export function computeKnockbackMultiplier(
  currentWeight: number,
  capacity: number,
): number {
  return computeWeightMultiplier(
    currentWeight,
    capacity,
    WEIGHT_SCALING.minKnockbackMultiplier,
  );
}

// Capacidade cheia = trava a coleta (não entra mais peso no inventário).
export function isOverCapacity(currentWeight: number, capacity: number): boolean {
  return currentWeight >= capacity;
}
