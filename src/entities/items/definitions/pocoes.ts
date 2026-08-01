import type { ItemDefinition } from "../itemTypes";

// Poções — cada "qualidade" é o próprio item, com id/slot/pilha
// separados (uma fraca e uma forte nunca ocupam o mesmo slot). Por
// enquanto só a de cura, nível inferior, existe — as próximas entram
// aqui do mesmo jeito, sem mudar mais nada no sistema de craft/uso.
export const POCOES: Record<string, ItemDefinition> = {
  pocao_cura_fraca: {
    id: "pocao_cura_fraca",
    name: "Poção de Cura Fraca",
    category: "pocao",
    weight: 0.5,
    maxStack: 10,
    color: "#ef4444",
    description: "Cura 25 de HP ao consumir.",
    effect: { type: "heal", amount: 25 },
  },
};
