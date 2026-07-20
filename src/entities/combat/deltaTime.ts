// Converte o tempo real decorrido entre frames num fator de escala: 1.0
// significa "passou exatamente 1/60s" (o ritmo que toda constante do jogo
// — velocidade, cooldown, timer — já foi calibrada pensando), 2.0
// significa "o dobro disso" (o frame atrasou). Multiplicar movimento por
// esse fator, e decrementar cooldowns por ele em vez de por 1, faz a
// velocidade do jogo parar de depender de quantos quadros por segundo o
// dispositivo consegue manter — sem precisar recalibrar nenhum número
// já ajustado (eles continuam corretos exatamente a 60fps).
const REFERENCE_FRAME_MS = 1000 / 60;

// Trava o salto máximo — evita que a aba voltar do segundo plano (onde o
// navegador pausa o RAF por segundos) cause um "teleporte" de uma vez só.
const MAX_DELTA_SCALE = 3;

export function computeDeltaScale(
  timestamp: number,
  lastTimeRef: { current: number | null },
): number {
  if (lastTimeRef.current === null) {
    lastTimeRef.current = timestamp;
    return 1; // primeiro frame — assume ritmo normal
  }

  const deltaMs = timestamp - lastTimeRef.current;
  lastTimeRef.current = timestamp;

  const scale = deltaMs / REFERENCE_FRAME_MS;
  return Math.max(0, Math.min(MAX_DELTA_SCALE, scale));
}
