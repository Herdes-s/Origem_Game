import type { ItemDefinition } from "../itemTypes";

// Poções — cada "qualidade" é o próprio item, com id/slot/pilha
// separados (uma fraca e uma forte nunca ocupam o mesmo slot). Por
// enquanto só a de cura, nível inferior, existe — as próximas entram
// aqui do mesmo jeito, sem mudar mais nada no sistema de craft/uso.
//
// Nota: o sprite da Poção de Mana já está salvo em
// public/assets/items/pocao_de_mana.png, mas o item em si ainda não
// existe aqui — não tem sistema de mana no jogo ainda. Quando existir,
// é só somar a entrada (mesmo formato da pocao_cura_fraca).
export const POCOES: Record<string, ItemDefinition> = {
  pocao_cura_fraca: {
    id: "pocao_cura_fraca",
    name: "Poção de Cura Fraca",
    category: "pocao",
    weight: 0.5,
    maxStack: 10,
    color: "#ef4444",
    iconSrc: "/assets/items/pocao_cura_fraca.png",
    description: "Cura 25 de HP ao consumir.",
    effect: { type: "heal", amount: 25 },
  },
};
