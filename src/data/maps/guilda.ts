import type { MapDefinition } from "./types";
import { TILE } from "../tiles";

// Guilda dos Aventureiros — sala vazia por enquanto (sem NPC, sem
// quadro de missão ainda). Só a navegação de verdade existe: entrar
// pela porta da cidade te traz pra cá, e a porta daqui te devolve pra
// cidade exatamente onde você saiu.
export const GUILDA: MapDefinition = {
  id: "guilda",
  name: "Guilda dos Aventureiros",
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
  portals: [
    // Porta de saída — devolve exatamente na frente da porta da Guilda na cidade
    { tx: 3, ty: 5, targetMapId: "cidade", targetTx: 5, targetTy: 7 },
  ],
};
