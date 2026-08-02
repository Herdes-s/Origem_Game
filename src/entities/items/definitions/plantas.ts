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
  maca: {
    id: "maca",
    name: "Maçã",
    category: "planta",
    weight: 0.3,
    maxStack: 20,
    color: "#dc2626",
    description: "Fruta colhida de macieiras. Alimento simples — nenhum efeito ainda.",
  },
};
