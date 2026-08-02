import type { MapDefinition } from "./types";
import { TILE } from "../tiles";

// Forja — sala vazia por enquanto (sem ferreiro/crafting ainda). Mesmo
// template da Guilda: só a navegação de verdade existe.
export const FORJA: MapDefinition = {
  id: "forja",
  name: "Forja",
  startTx: 3,
  startTy: 2, // não usado — chegada sempre vem de um portal (cidade → aqui)

  tiles: [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,TILE.DOOR,1,1,1],
  ],

  wanderSpawns: [],
  patrolSpawns: [],

  buildings: [],
  npcs: [],
  resourceNodes: [],
  portals: [
    // Porta de saída — devolve exatamente na frente da porta da Forja na cidade
    { tx: 3, ty: 5, targetMapId: "cidade", targetTx: 15, targetTy: 6 },
  ],
};
