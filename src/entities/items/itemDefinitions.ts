import type { ItemDefinition } from "./itemTypes";

// Itens de TESTE — servem só pra validar slot/stack/peso funcionando
// antes de existir coleta de verdade (drop de inimigo, planta no mapa,
// minério em parede etc.). Cobrem categorias diferentes de propósito
// (material, minério, planta, arma) pra exercitar tanto o empilhamento
// (maxStack > 1) quanto item único por slot (maxStack 1) e pesos bem
// diferentes entre si. Trocar/expandir quando a coleta real chegar.
export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  pedra: {
    id: "pedra",
    name: "Pedra",
    category: "material",
    weight: 1,
    maxStack: 30,
    color: "#94a3b8",
  },
  minerio_ferro: {
    id: "minerio_ferro",
    name: "Minério de Ferro",
    category: "minerio",
    weight: 3,
    maxStack: 20,
    color: "#b45309",
  },
  erva: {
    id: "erva",
    name: "Erva Medicinal",
    category: "planta",
    weight: 0.5,
    maxStack: 15,
    color: "#22c55e",
  },
  espada_enferrujada: {
    id: "espada_enferrujada",
    name: "Espada Enferrujada",
    category: "arma",
    weight: 6,
    maxStack: 1,
    color: "#64748b",
  },
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DEFINITIONS[itemId];
}
