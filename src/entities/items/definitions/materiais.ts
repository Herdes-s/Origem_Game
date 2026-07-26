import type { ItemDefinition } from "../itemTypes";

export const MATERIAIS: Record<string, ItemDefinition> = {
  pedra: {
    id: "pedra",
    name: "Pedra",
    category: "material",
    weight: 1,
    maxStack: 30,
    color: "#94a3b8",
  },
};
