import type { MapDefinition } from "./types";
import { TILE } from "../tiles";

export const CAVERNA: MapDefinition = {
  id: "caverna",
  name: "Caverna",
  startTx: 15,
  startTy: 11, // centro do mapa (mesmo ponto que já era o START antigo)

  tiles: [
    [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ],
    [
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      TILE.PORTAL,
      0,
      0,
      0,
      1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 0, 0, 0, 1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1,
      0,
      0,
      0,
      0,
      TILE.SPAWN_CAVE,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      TILE.SPAWN_CAVE,
      0,
      0,
      0,
      0,
      1,
    ],
    [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1,
    ],
    [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ],
  ],

  wanderSpawns: [
    { race: "slime", tier: "slime", count: 6, levelRange: { min: 1, max: 5 } },
  ],

  patrolSpawns: [
    {
      race: "slime",
      tier: "slimeHeroi",
      patrol: [8, 3, 19, 3],
      levelRange: { min: 5, max: 10 },
    },
    {
      race: "slime",
      tier: "slimeHeroi",
      patrol: [7, 8, 26, 8],
      levelRange: { min: 5, max: 10 },
    },
    {
      race: "slime",
      tier: "slimeHeroi",
      patrol: [9, 13, 9, 17],
      levelRange: { min: 5, max: 10 },
    },
  ],

  buildings: [],
  npcs: [],
  resourceNodes: [
    // Pedra: pega com a mão, nunca recarrega nessa sessão (regrowGameMs
    // null) — diferente da macieira, não é uma coisa viva que volta a dar.
    {
      id: "pedra_caverna_1",
      itemId: "pedra",
      quantityMin: 1,
      quantityMax: 2,
      tileX: 12,
      tileY: 10,
      interactionRadius: 48,
      regrowGameMs: null,
    },
    {
      id: "pedra_caverna_2",
      itemId: "pedra",
      quantityMin: 1,
      quantityMax: 2,
      tileX: 20,
      tileY: 6,
      interactionRadius: 48,
      regrowGameMs: null,
    },
    {
      id: "pedra_caverna_3",
      itemId: "pedra",
      quantityMin: 1,
      quantityMax: 2,
      tileX: 6,
      tileY: 16,
      interactionRadius: 48,
      regrowGameMs: null,
    },
  ],
  portals: [
    // canto superior direito → chegada na floresta perto do portal de lá
    { tx: 25, ty: 1, targetMapId: "floresta", targetTx: 2, targetTy: 1 },
  ],
};
