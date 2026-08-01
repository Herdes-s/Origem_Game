import type { MapDefinition } from "./types";

// Cidade: zona segura (wanderSpawns/patrolSpawns vazios). Os 3 prédios
// agora são SPRITE de verdade (não mosaico de tile) — o grid ainda
// carrega a colisão real (HOUSE_WALL sólido, DOOR andável/portal), a
// imagem em `buildings` só desenha por cima, alinhada exatamente com
// esse retângulo (ver renderBuildings.ts). Cada prédio tem um tamanho
// próprio (guilda/loja 7×5, forja 4×4) — não precisam ser iguais.
export const CIDADE: MapDefinition = {
  id: "cidade",
  name: "Cidade",
  startTx: 10, // só usado se a cidade virar mapa inicial (não é o caso hoje)
  startTy: 8,

  tiles: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,6,6,6,6,6,6,6,6,6,5,6,6,6,6,6,6,6,6,1],
    [1,6,7,7,7,7,7,7,7,6,6,6,6,7,7,7,7,6,6,1],
    [1,6,7,7,7,7,7,7,7,6,6,6,6,7,7,7,7,6,6,1],
    [1,6,7,7,7,7,7,7,7,6,6,6,6,7,7,7,7,6,6,1],
    [1,6,7,7,7,7,7,7,7,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,7,7,7,7,7,7,7,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,7,7,7,7,7,7,7,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,7,7,7,7,7,7,7,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,7,7,7,6,7,7,7,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  wanderSpawns: [],
  patrolSpawns: [],

  buildings: [
    { spriteSrc: "/assets/buildings/guild.png", tileX: 2, tileY: 2, tilesW: 7, tilesH: 5 },
    { spriteSrc: "/assets/buildings/forja.png", tileX: 13, tileY: 2, tilesW: 4, tilesH: 4 },
    { spriteSrc: "/assets/buildings/loja_pocoes.png", tileX: 7, tileY: 10, tilesW: 7, tilesH: 5 },
  ],

  npcs: [],

  portals: [
    // Saída norte, de volta pra floresta
    { tx: 10, ty: 1, targetMapId: "floresta", targetTx: 21, targetTy: 1 },
    // Porta da Guilda dos Aventureiros
    { tx: 5, ty: 6, targetMapId: "guilda", targetTx: 3, targetTy: 4 },
    // Porta da Forja
    { tx: 15, ty: 5, targetMapId: "forja", targetTx: 3, targetTy: 4 },
    { tx: 14, ty: 5, targetMapId: "forja", targetTx: 3, targetTy: 4 },
    // Porta da Loja de Poções
    { tx: 10, ty: 14, targetMapId: "loja_pocoes", targetTx: 3, targetTy: 4 },
  ],
};
