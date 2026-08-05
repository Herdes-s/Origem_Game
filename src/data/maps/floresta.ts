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
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1],
    [1, 3, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1],
    [1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1],
    [1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  wanderSpawns: [
    {
      race: "goblin",
      tier: "goblin",
      count: 5,
      levelRange: { min: 5, max: 10 },
    }, // floresta favorece goblin (mais ágil, combina com o tema)
    { race: "slime", tier: "slime", count: 2, levelRange: { min: 5, max: 10 } },
  ],

  patrolSpawns: [
    {
      race: "goblin",
      tier: "goblinHeroi",
      patrol: [4, 7, 4, 10],
      levelRange: { min: 8, max: 15 },
    },
    {
      race: "slime",
      tier: "slimeHeroi",
      patrol: [18, 7, 18, 10],
      levelRange: { min: 8, max: 15 },
    },
  ],

  buildings: [],
  npcs: [],
  resourceNodes: [
    // Macieira: colhe maçã sem ferramenta (recarrega em 6h de tempo de
    // JOGO — com TIME_SCALE=4, ~1h30 reais). Depois de colher, vira
    // "sem fruto" (spriteSrcDepleted) e fica cortável a machado por
    // madeira UMA vez, até as maçãs voltarem — ver secondary.
    {
      id: "macieira_floresta_1", tileX: 7, tileY: 5, interactionRadius: 56,
      regrowGameMs: 6 * 60 * 60 * 1000,
      primary: { itemId: "maca", quantityMin: 2, quantityMax: 4, actionLabel: "🍎 Colher" },
      secondary: { itemId: "madeira", quantityMin: 1, quantityMax: 2, requiredTool: "machado", actionLabel: "🪓 Cortar" },
      spriteSrc: "/assets/nature/macieira.png",
      spriteSrcDepleted: "/assets/nature/arvore_sem_fruto.png",
      size: 96,
    },
    {
      id: "macieira_floresta_2", tileX: 16, tileY: 10, interactionRadius: 56,
      regrowGameMs: 6 * 60 * 60 * 1000,
      primary: { itemId: "maca", quantityMin: 2, quantityMax: 4, actionLabel: "🍎 Colher" },
      secondary: { itemId: "madeira", quantityMin: 1, quantityMax: 2, requiredTool: "machado", actionLabel: "🪓 Cortar" },
      spriteSrc: "/assets/nature/macieira.png",
      spriteSrcDepleted: "/assets/nature/arvore_sem_fruto.png",
      size: 96,
    },
    {
      id: "macieira_floresta_3", tileX: 10, tileY: 15, interactionRadius: 56,
      regrowGameMs: 6 * 60 * 60 * 1000,
      primary: { itemId: "maca", quantityMin: 2, quantityMax: 4, actionLabel: "🍎 Colher" },
      secondary: { itemId: "madeira", quantityMin: 1, quantityMax: 2, requiredTool: "machado", actionLabel: "🪓 Cortar" },
      spriteSrc: "/assets/nature/macieira.png",
      spriteSrcDepleted: "/assets/nature/arvore_sem_fruto.png",
      size: 96,
    },
    // Árvore de madeira — nunca teve fruto, sempre precisou de machado.
    // Recarrega em 12h de jogo (o dobro da macieira — dá mais madeira
    // de uma vez, então demora mais). Mesma sprite "sem fruto" da
    // macieira colhida — já é literalmente uma árvore pelada.
    {
      id: "arvore_madeira_floresta_1", tileX: 19, tileY: 4, interactionRadius: 56,
      regrowGameMs: 12 * 60 * 60 * 1000,
      primary: { itemId: "madeira", quantityMin: 2, quantityMax: 4, requiredTool: "machado", actionLabel: "🪓 Cortar" },
      spriteSrc: "/assets/nature/arvore_sem_fruto.png",
      size: 96,
    },
    {
      id: "arvore_madeira_floresta_2", tileX: 5, tileY: 11, interactionRadius: 56,
      regrowGameMs: 12 * 60 * 60 * 1000,
      primary: { itemId: "madeira", quantityMin: 2, quantityMax: 4, requiredTool: "machado", actionLabel: "🪓 Cortar" },
      spriteSrc: "/assets/nature/arvore_sem_fruto.png",
      size: 96,
    },
    // Galho solto — pega com a mão, recarrega rápido (2h de jogo, ~30min
    // reais) já que é só um graveto caindo de novo, não uma árvore
    // inteira crescendo. Sem sprite própria, cai no ícone/cor do item.
    { id: "galho_floresta_1", tileX: 14, tileY: 1, interactionRadius: 40, regrowGameMs: 2 * 60 * 60 * 1000,
      primary: { itemId: "galho", quantityMin: 1, quantityMax: 2, actionLabel: "🪵 Pegar galho" } },
    { id: "galho_floresta_2", tileX: 8, tileY: 16, interactionRadius: 40, regrowGameMs: 2 * 60 * 60 * 1000,
      primary: { itemId: "galho", quantityMin: 1, quantityMax: 2, actionLabel: "🪵 Pegar galho" } },
    { id: "galho_floresta_3", tileX: 21, tileY: 11, interactionRadius: 40, regrowGameMs: 2 * 60 * 60 * 1000,
      primary: { itemId: "galho", quantityMin: 1, quantityMax: 2, actionLabel: "🪵 Pegar galho" } },
  ],
  portals: [
    // perto de onde o player chega vindo da caverna
    { tx: 2, ty: 2, targetMapId: "caverna", targetTx: 25, targetTy: 2 },
    // canto superior direito → chegada na cidade perto da saída de lá
    { tx: 22, ty: 1, targetMapId: "cidade", targetTx: 10, targetTy: 2 },
  ],
};
