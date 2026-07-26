import type { ItemDefinition } from "../itemTypes";

export const PLANTAS: Record<string, ItemDefinition> = {
  erva: {
    id: "erva",
    name: "Erva Medicinal",
    category: "planta",
    weight: 0.5,
    maxStack: 15,
    color: "#22c55e",
  },
};
