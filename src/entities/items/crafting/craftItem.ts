import type { Inventory } from "../itemTypes";
import { addItem, computeInventoryWeight, countItem, removeItemById } from "../inventory";
import type { Recipe } from "./recipes";

export type CraftResult = {
  inventory: Inventory;
  success: boolean;
  reason?: "missing_ingredients" | "no_room";
};

// Verifica se o inventário tem TODOS os ingredientes na quantidade
// pedida — usado tanto pra decidir se o botão "Craftar" fica habilitado
// quanto dentro do craftItem em si (defesa contra chamada indevida).
export function canCraft(inventory: Inventory, recipe: Recipe): boolean {
  return recipe.ingredients.every(
    (ing) => countItem(inventory, ing.itemId) >= ing.quantity,
  );
}

// Craft puro: gasta os ingredientes (todos de uma vez, nunca "meio
// craft") e adiciona o resultado — respeitando peso/capacidade de carga
// como qualquer outra entrada de item no inventário (addItem já cuida
// disso). Se não couber o resultado (peso no limite), os ingredientes
// NÃO são gastos — falha limpa, sem perder material à toa.
export function craftItem(
  inventory: Inventory,
  recipe: Recipe,
  carryCapacity: number,
): CraftResult {
  if (!canCraft(inventory, recipe)) {
    return { inventory, success: false, reason: "missing_ingredients" };
  }

  let afterIngredients = inventory;
  for (const ing of recipe.ingredients) {
    afterIngredients = removeItemById(afterIngredients, ing.itemId, ing.quantity);
  }

  // Recalcula o peso já SEM os ingredientes gastos — abre espaço pra
  // poção entrar mesmo perto do limite de carga (gastar 5 pedaços de
  // slime pesa menos que a poção sozinha, por exemplo).
  const weightAfterIngredients = computeInventoryWeight(afterIngredients);

  const result = addItem(
    afterIngredients,
    recipe.resultItemId,
    recipe.resultQuantity,
    weightAfterIngredients,
    carryCapacity,
  );

  if (result.added < recipe.resultQuantity) {
    // não coube o resultado — desfaz tudo (devolve o inventário original,
    // não o com ingrediente já gasto)
    return { inventory, success: false, reason: "no_room" };
  }

  return { inventory: result.inventory, success: true };
}
