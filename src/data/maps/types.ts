import type { TileMap } from "../../types/game";
import type { LevelRange } from "../../entities/enemies/enemyLeveling";
import type { NpcConfig } from "../../entities/npc/npcTypes";
import type { ResourceNodeConfig } from "../../entities/items/world/resourceNode";

export type EnemyRace = "slime" | "goblin";

// Inimigos que nascem em posições ALEATÓRIAS nesse mapa — o comportamento
// (vagar solto) vem do próprio tier (ver entities/enemies/enemyTypes.ts),
// não é mais escolhido aqui. Cada instância sorteia o próprio level
// dentro de `levelRange` (entities/enemies/enemyLeveling.ts).
export type WanderSpawnConfig = {
  race: EnemyRace;
  tier: string; // chave do tier dentro da raça (ex: "slime", "goblin")
  count: number;
  levelRange: LevelRange;
};

// Inimigos com patrulha FIXA — [tileX, tileY, patrolToTileX, patrolToTileY].
// O comportamento (patrulhar) também vem do tier, não é escolhido aqui.
export type PatrolSpawnConfig = {
  race: EnemyRace;
  tier: string; // ex: "slimeHeroi", "bossSlime"
  patrol: [number, number, number, number];
  levelRange: LevelRange;
};

// Um portal é um tile (TILE.PORTAL) que teleporta o player pra outro
// mapa quando ele pisa nele.
export type Portal = {
  tx: number;
  ty: number;
  targetMapId: string;
  targetTx: number;
  targetTy: number;
};

// Um prédio é uma IMAGEM desenhada por cima do grid de tiles — a
// colisão de verdade continua vindo do grid (HOUSE_WALL sólido, DOOR
// andável/portal), a sprite só cobre visualmente esse retângulo. Cada
// prédio pode ter um tamanho diferente (não precisa ser quadrado nem
// igual entre si — um ferreiro pequeno e uma guilda grande convivem sem
// problema).
export type BuildingConfig = {
  spriteSrc: string; // public/assets/buildings/...
  tileX: number; // canto superior-esquerdo do footprint, em tiles
  tileY: number;
  tilesW: number; // largura do footprint em tiles — a imagem já vem pronta nesse múltiplo de 64px
  tilesH: number;
};

export type MapDefinition = {
  id: string;
  name: string;
  tiles: TileMap;
  startTx: number; // onde o player aparece nesse mapa numa partida nova
  startTy: number;
  wanderSpawns: WanderSpawnConfig[];
  patrolSpawns: PatrolSpawnConfig[];
  portals: Portal[];
  buildings: BuildingConfig[];
  npcs: NpcConfig[];
  resourceNodes: ResourceNodeConfig[];
};
