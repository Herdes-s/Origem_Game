export type Recipe = {
  id: string;
  resultItemId: string;
  resultQuantity: number;
  ingredients: { itemId: string; quantity: number }[];
};

// Toda receita já é "conhecida" de cara — não existe sistema de
// aprender/desbloquear receita ainda (nem NPC vendendo receita nova).
// Adicionar uma poção nova é só somar uma entrada aqui.
export const RECIPES: Recipe[] = [
  {
    id: "pocao_cura_fraca",
    resultItemId: "pocao_cura_fraca",
    resultQuantity: 1,
    ingredients: [{ itemId: "pedaco_slime", quantity: 5 }],
  },
];
