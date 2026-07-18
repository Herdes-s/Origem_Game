import type { TileMap } from "../types/game";

// IDs dos tiles — adicionar um tipo novo de bloco é só adicionar uma
// entrada aqui e uma em TILE_DEFINITIONS. O MAP continua sendo uma matriz
// de números (fácil de editar à mão), só que agora cada número pode
// significar muito mais que "chão" ou "parede".
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  WATER: 2,
  GRASS: 3,
  SPAWN_CAVE: 4,
  PORTAL: 5,
} as const;

export type TileDefinition = {
  id: number;
  name: string;
  color: string; // placeholder até existir textura de verdade
  textureSrc?: string; // caminho pra imagem 64×64 do tile — opcional
  solid: boolean; // bloqueia movimento (colisão)?
  spawnPoint?: boolean; // marca um covil de spawn de inimigos
};

export const TILE_DEFINITIONS: Record<number, TileDefinition> = {
  [TILE.FLOOR]: {
    id: TILE.FLOOR,
    name: "Chão",
    color: "#1e293b",
    textureSrc: "/assets/tiles/floor.png",
    solid: false,
  },
  [TILE.WALL]: {
    id: TILE.WALL,
    name: "Parede",
    color: "#475569",
    textureSrc: "/assets/tiles/wall.png",
    solid: true,
  },
  [TILE.WATER]: {
    id: TILE.WATER,
    name: "Água",
    color: "#1e40af",
    textureSrc: "/assets/tiles/water.png",
    solid: true, // por enquanto água bloqueia — pode virar "lento" depois
  },
  [TILE.GRASS]: {
    id: TILE.GRASS,
    name: "Grama",
    color: "#166534",
    textureSrc: "/assets/tiles/grass.png",
    solid: false,
  },
  [TILE.SPAWN_CAVE]: {
    id: TILE.SPAWN_CAVE,
    name: "Covil",
    color: "#7c2d12",
    textureSrc: "/assets/tiles/spawn_cave.png",
    solid: false,
    spawnPoint: true,
  },
  [TILE.PORTAL]: {
    id: TILE.PORTAL,
    name: "Portal",
    color: "#a855f7",
    textureSrc: "/assets/tiles/portal.png",
    solid: false,
  }
};

const FALLBACK_DEFINITION: TileDefinition = {
  id: -1,
  name: "Desconhecido",
  color: "#000000",
  solid: true, // tile não mapeado ou fora do mapa = trata como parede (seguro)
};

export function getTileDefinition(tileId: number | undefined): TileDefinition {
  if (tileId === undefined) return FALLBACK_DEFINITION;
  return TILE_DEFINITIONS[tileId] ?? FALLBACK_DEFINITION;
}

export function isTileSolid(tileId: number | undefined): boolean {
  return getTileDefinition(tileId).solid;
}

// Tamanho nativo das texturas dos tiles — bate com TILE_SIZE (data/map.ts)
export const TILE_TEXTURE_SIZE = 64;

// Lista {id, src} de todo tile que tem textura — usado pelo loader
// (useTileTextures) pra saber o que carregar, sem precisar repetir a
// lista na mão em outro arquivo.
export function listTileTextures(): { id: number; src: string }[] {
  return Object.values(TILE_DEFINITIONS)
    .filter(
      (def): def is TileDefinition & { textureSrc: string } => !!def.textureSrc,
    )
    .map((def) => ({ id: def.id, src: def.textureSrc }));
}

// Acha todos os tiles de um certo tipo no mapa — usado hoje pra achar
// covis de spawn (TILE.SPAWN_CAVE), mas serve pra qualquer marcador futuro.
export function findTileCoords(
  map: TileMap,
  tileId: number,
): { tx: number; ty: number }[] {
  const coords: { tx: number; ty: number }[] = [];

  for (let ty = 0; ty < map.length; ty++) {
    for (let tx = 0; tx < map[ty].length; tx++) {
      if (map[ty][tx] === tileId) coords.push({ tx, ty });
    }
  }

  return coords;
}
