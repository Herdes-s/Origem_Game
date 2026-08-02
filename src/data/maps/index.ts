import type { MapDefinition } from "./types";
import { CAVERNA } from "./caverna";
import { FLORESTA } from "./floresta";
import { CIDADE } from "./cidade";
import { GUILDA } from "./guilda";
import { FORJA } from "./forja";
import { LOJA_POCOES } from "./lojaPocoes";
import type { ResourceNodeConfig } from "../../entities/items/world/resourceNode";

export type {
  MapDefinition,
  Portal,
  WanderSpawnConfig,
  PatrolSpawnConfig,
  EnemyRace,
  BuildingConfig,
} from "./types";
export type { NpcConfig, NpcRole } from "../../entities/npc/npcTypes";

export const MAPS: Record<string, MapDefinition> = {
  caverna: CAVERNA,
  floresta: FLORESTA,
  cidade: CIDADE,
  guilda: GUILDA,
  forja: FORJA,
  loja_pocoes: LOJA_POCOES,
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

// Todo spriteSrc único usado por algum prédio, em qualquer mapa
// registrado — mesmo papel que listTileTextures() já tem pros tiles.
// useBuildingSprites.ts pré-carrega essa lista uma vez só, e o render de
// cada mapa resolve pelo spriteSrc do seu próprio `buildings`.
export function listBuildingSprites(): string[] {
  const seen = new Set<string>();
  for (const map of Object.values(MAPS)) {
    for (const building of map.buildings) {
      seen.add(building.spriteSrc);
    }
  }
  return Array.from(seen);
}

// Mesma ideia, pros sprites de NPC.
export function listNpcSprites(): string[] {
  const seen = new Set<string>();
  for (const map of Object.values(MAPS)) {
    for (const npc of map.npcs) {
      seen.add(npc.spriteSrc);
    }
  }
  return Array.from(seen);
}

// Todo spriteSrc de nó de recurso que tiver imagem própria (macieira) —
// pedra não tem (cai no ícone do item), então não aparece aqui.
export function listResourceNodeSprites(): string[] {
  const seen = new Set<string>();
  for (const map of Object.values(MAPS)) {
    for (const node of map.resourceNodes) {
      if (node.spriteSrc) seen.add(node.spriteSrc);
    }
  }
  return Array.from(seen);
}

// TODOS os nós de recurso de TODOS os mapas, cada um já com o mapId
// marcado — usado pra montar o estado global em GamePage (o estado de
// cada nó precisa sobreviver a trocar de mapa, diferente de
// inimigo/pickup, porque "recarregar em X horas de jogo" só faz sentido
// contando o tempo mesmo enquanto o player está em outro lugar).
export function listAllResourceNodes(): (ResourceNodeConfig & {
  mapId: string;
})[] {
  const all: (ResourceNodeConfig & { mapId: string })[] = [];
  for (const map of Object.values(MAPS)) {
    for (const node of map.resourceNodes) {
      all.push({ ...node, mapId: map.id });
    }
  }
  return all;
}
