import type { ItemDefinition } from "../itemTypes";

// Ferramentas — só precisa POSSUIR no inventário pra usar (não equipa,
// não gasta/quebra ainda). Usadas como `requiredTool` em
// entities/items/world/resourceNode.ts.
export const FERRAMENTAS: Record<string, ItemDefinition> = {
  machado: {
    id: "machado",
    name: "Machado",
    category: "ferramenta",
    weight: 4,
    maxStack: 1,
    color: "#a16207",
    description: "Necessário para cortar árvores e conseguir madeira.",
  },
  picareta: {
    id: "picareta",
    name: "Picareta",
    category: "ferramenta",
    weight: 4,
    maxStack: 1,
    color: "#71717a",
    description: "Necessária para minerar pedras sólidas.",
  },
};
