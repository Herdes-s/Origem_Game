import type { ItemDefinition } from "../itemTypes";

export const MATERIAIS: Record<string, ItemDefinition> = {
  pedra: {
    id: "pedra",
    name: "Pedra",
    category: "material",
    weight: 1,
    maxStack: 30,
    color: "#94a3b8",
    iconSrc: "/assets/items/pedra.png",
    description: "Pedra comum, encontrada em cavernas.",
  },
  madeira: {
    id: "madeira",
    name: "Madeira",
    category: "material",
    weight: 2,
    maxStack: 20,
    color: "#a16207",
    iconSrc: "/assets/items/galho.png",
    description: "Madeira cortada de uma arvore, encontrada em florestas.",
  },
  galho: {
    id: "galho",
    name: "Galho",
    category: "material",
    weight: 0.3,
    maxStack: 25,
    color: "#78350f",
    iconSrc: "/assets/items/galho.png",
    description: "Galho solto",
  },
};
