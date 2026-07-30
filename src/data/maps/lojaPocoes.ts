import type { MapDefinition } from "./types";
import { TILE } from "../tiles";

// Loja de Poções — sala vazia por enquanto (sem comerciante/economia
// ainda — só faz sentido quando existir crafting de poção de verdade).
// Mesmo template da Guilda/Forja: só a navegação de verdade existe.
export const LOJA_POCOES: MapDefinition = {
  id: "loja_pocoes",
  name: "Loja de Poções",
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
    // Porta de saída — devolve exatamente na frente da porta da Loja na cidade
    { tx: 3, ty: 5, targetMapId: "cidade", targetTx: 10, targetTy: 15 },
  ],
};
