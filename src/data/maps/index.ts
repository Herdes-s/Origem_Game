import type { MapDefinition } from "./types";
import { CAVERNA } from "./caverna";
import { FLORESTA } from "./floresta";

export type { MapDefinition, Portal, WeakSpawnConfig, StrongPatrolConfig, EnemyRace } from "./types";

export const MAPS: Record<string, MapDefinition> = {
  caverna: CAVERNA,
  floresta: FLORESTA,
};

export const DEFAULT_MAP_ID = "caverna";

// "Mapa atual" — estado simples em memória, trocado via setCurrentMapId()
// quando o player entra num portal. Não é React state de propósito: a
// única coisa que realmente precisa saber qual é o mapa atual são o loop
// de update e o de desenho, e os dois já leem tudo via ref/imperativo a
// cada frame — não precisa de re-render pra isso.
let currentMapId = DEFAULT_MAP_ID;

export function getCurrentMapId(): string {
  return currentMapId;
}

export function setCurrentMapId(id: string): void {
  if (!MAPS[id]) return; // id inválido — ignora, mantém o mapa atual
  currentMapId = id;
}

export function getCurrentMap(): MapDefinition {
  return MAPS[currentMapId] ?? MAPS[DEFAULT_MAP_ID];
}

export function getMapById(id: string): MapDefinition {
  return MAPS[id] ?? MAPS[DEFAULT_MAP_ID];
}
