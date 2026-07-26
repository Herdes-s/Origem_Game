import type { ItemDefinition } from "../itemTypes";

// Ingredientes de alquimia — matéria-prima pra poções (crafting ainda não
// existe, mas o item já entra no jogo via drop de inimigo). Descrição
// genérica de propósito ("ingrediente para alquimia") até a receita real
// que consome cada um existir.
export const INGREDIENTES: Record<string, ItemDefinition> = {
  pedaco_slime: {
    id: "pedaco_slime",
    name: "Pedaço de Slime",
    category: "ingrediente",
    weight: 0.5,
    maxStack: 30,
    color: "#4ade80",
    description: "Ingrediente para alquimia. Usado no preparo de poções.",
  },
};
