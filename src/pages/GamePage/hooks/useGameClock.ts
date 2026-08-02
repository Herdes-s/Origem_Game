import { useEffect, useRef, useState } from "react";
import { TIME_SCALE } from "../../../entities/time/gameTime";

// Acumula tempo de JOGO (não real) — 24h de jogo em 6h reais (ver
// TIME_SCALE em entities/time/gameTime.ts). Só soma enquanto a aba está
// VISÍVEL, e só existe enquanto o GamePage está montado (sair da tela =
// desmontar = parar de contar). Não usa o `dt` normalizado do resto do
// jogo (que representa "quadros de 60fps", não milissegundos reais) —
// aqui precisão de relógio de parede importa mais que suavidade visual,
// e não precisa rodar no loop de 60fps pra isso.
export function useGameClock(initialMs: number) {
  const [totalPlayedMs, setTotalPlayedMs] = useState(initialMs);

  // Ref-espelho: quem precisa do valor MAIS recente sem esperar o
  // próximo tick de 1s (ex: buildSnapshot no momento exato do save) lê
  // daqui, igual outros refs de alta frequência no resto do jogo.
  const totalRef = useRef(initialMs);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;

      const now = performance.now();
      if (lastTickRef.current !== null) {
        totalRef.current += (now - lastTickRef.current) * TIME_SCALE;
        setTotalPlayedMs(totalRef.current);
      }
      lastTickRef.current = now;
    };

    // Ao esconder a aba, zera a referência — assim, quando ela voltar a
    // ficar visível, o próximo tick não soma o tempo inteiro que ficou
    // escondida (só o que passou DEPOIS de voltar).
    const handleVisibilityChange = () => {
      lastTickRef.current =
        document.visibilityState === "visible" ? performance.now() : null;
    };

    lastTickRef.current =
      document.visibilityState === "visible" ? performance.now() : null;

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { totalPlayedMs, totalPlayedMsRef: totalRef };
}
