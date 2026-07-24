import type { PlayerAttributes } from "../player/playerAttributes";
import type { PlayerProgress } from "../player/playerProgress";
import type { Position } from "../../types/game";
import type { Inventory } from "../items/itemTypes";

const SAVE_KEY = "origem-save-v1";

export type SaveData = {
  attributes: PlayerAttributes;
  progress: PlayerProgress;
  position: Position;
  hp: number;
  score: number;
  mapId: string;
  // Opcional: saves de antes do inventário existir não têm esse campo —
  // GamePage já trata isso com `savedGame?.inventory ?? createEmptyInventory()`.
  inventory?: Inventory;
};

// localStorage pode falhar (modo privado, quota cheia, navegador exótico)
// — em qualquer erro, salvar/carregar falha silenciosamente e o jogo
// continua funcionando normalmente, só sem persistência.
export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // ignora — perder o save é melhor que quebrar o jogo
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // validação mínima de forma — um save corrompido ou de uma versão
    // incompatível vira "sem save" em vez de quebrar o jogo
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.attributes?.primary ||
      !parsed.progress ||
      !parsed.position
    ) {
      return null;
    }

    return parsed as SaveData;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignora
  }
}
