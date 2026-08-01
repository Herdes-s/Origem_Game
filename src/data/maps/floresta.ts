import { TILE } from "../tiles";
import type { MapDefinition } from "./types";

export const FLORESTA: MapDefinition = {
  id: "floresta",
  name: "Floresta",
  startTx: 7,
  startTy: 3, // usado só se o player entrar aqui como mapa inicial (não é o caso hoje)

  // Tiles: 3=grama (chão), 2=água (bloqueia), 1=parede/árvore, 4=covil,
  // 5=portal de volta pra caverna. Mapa mais fechado/orgânico que a
  // caverna — dá pra sentir que é outra fase.
  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,TILE.PORTAL,1],
    [1,3,TILE.PORTAL,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,1,1,3,3,3,3,3,3,1,1,3,3,3,3,3,1,1,3,3,3,1],
    [1,3,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,2,2,2,2,2,2,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,3,3,1],
    [1,3,3,1,3,3,3,3,3,3,3,1,1,3,3,3,3,3,3,1,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  wanderSpawns: [
    { race: "goblin", tier: "goblin", count: 5, levelRange: { min: 5, max: 10 } }, // floresta favorece goblin (mais ágil, combina com o tema)
    { race: "slime", tier: "slime", count: 2, levelRange: { min: 5, max: 10 } },
  ],

  patrolSpawns: [
    { race: "goblin", tier: "goblinHeroi", patrol: [4, 7, 4, 10], levelRange: { min: 8, max: 15 } },
    { race: "slime", tier: "slimeHeroi", patrol: [18, 7, 18, 10], levelRange: { min: 8, max: 15 } },
  ],

  buildings: [],
  npcs: [],
  portals: [
    // perto de onde o player chega vindo da caverna
    { tx: 2, ty: 2, targetMapId: "caverna", targetTx: 25, targetTy: 2 },
    // canto superior direito → chegada na cidade perto da saída de lá
    { tx: 22, ty: 1, targetMapId: "cidade", targetTx: 10, targetTy: 2 },
  ],
};
