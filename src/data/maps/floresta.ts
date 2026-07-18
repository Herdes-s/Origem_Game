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
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
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

  weakSpawns: [
    { race: "goblin", count: 5 }, // floresta favorece goblin (mais ágil, combina com o tema)
    { race: "slime", count: 2 },
  ],

  strongPatrols: [
    { race: "goblin", patrol: [4, 7, 4, 10] },
    { race: "slime", patrol: [18, 7, 18, 10] },
  ],

  portals: [
    // perto de onde o player chega vindo da caverna
    { tx: 2, ty: 2, targetMapId: "caverna", targetTx: 25, targetTy: 2 },
  ],
};
