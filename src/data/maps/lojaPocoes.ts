import type { MapDefinition } from "./types";
import { TILE } from "../tiles";

// Loja de Poções — a vendedora fica perto de onde o player chega
// (entrando pela porta, de baixo pra cima). Chegar perto dela abre o
// CraftPanel sozinho (ver useGameLoop.ts + GamePage/index.tsx) — sem
// botão, sem precisar "falar" explicitamente.
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
  npcs: [
    {
      id: "vendedora_pocoes",
      name: "Vendedora de Poções",
      spriteSrc: "/assets/npcs/vendedora_pocoes.png",
      tileX: 3,
      tileY: 1,
      role: "pocoes",
      interactionRadius: 90,
    },
  ],
  resourceNodes: [],
  portals: [
    // Porta de saída — devolve exatamente na frente da porta da Loja na cidade
    { tx: 3, ty: 5, targetMapId: "cidade", targetTx: 10, targetTy: 15 },
  ],
};
