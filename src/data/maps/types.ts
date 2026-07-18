import type { TileMap } from "../../types/game";

export type EnemyRace = "slime" | "goblin";

// Inimigos fracos que nascem em posições aleatórias nesse mapa
export type WeakSpawnConfig = {
  race: EnemyRace;
  count: number;
};

// Inimigos fortes com patrulha fixa — [tileX, tileY, patrolToTileX, patrolToTileY]
export type StrongPatrolConfig = {
  race: EnemyRace;
  patrol: [number, number, number, number];
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

export type MapDefinition = {
  id: string;
  name: string;
  tiles: TileMap;
  startTx: number; // onde o player aparece nesse mapa numa partida nova
  startTy: number;
  weakSpawns: WeakSpawnConfig[];
  strongPatrols: StrongPatrolConfig[];
  portals: Portal[];
};
