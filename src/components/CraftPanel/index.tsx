import type { Inventory } from "../../entities/items/itemTypes";
import { getItemDefinition } from "../../entities/items/itemRegistry";
import { countItem } from "../../entities/items/inventory";
import { canCraft } from "../../entities/items/crafting/craftItem";
import { RECIPES } from "../../entities/items/crafting/recipes";
import styles from "./CraftPanel.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  inventory: Inventory;
  onCraft: (recipeId: string) => void;
};

// Painel de craft — só existe dentro da Loja de Poções (abre sozinho ao
// entrar lá, ver GamePage/index.tsx). Toda receita em RECIPES já é
// "conhecida" de cara, não tem sistema de aprender receita ainda.
function CraftPanel({ open, onClose, inventory, onCraft }: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close_button} onClick={onClose} type="button" aria-label="Fechar">
          ✕
        </button>

        <h2 className={styles.title}>🧪 Alquimia</h2>

        <ul className={styles.recipe_list}>
          {RECIPES.map((recipe) => {
            const resultDef = getItemDefinition(recipe.resultItemId);
            const craftable = canCraft(inventory, recipe);

            return (
              <li key={recipe.id} className={styles.recipe}>
                <div className={styles.recipe_header}>
                  {resultDef?.iconSrc ? (
                    <img src={resultDef.iconSrc} alt={resultDef.name} className={styles.recipe_icon_img} />
                  ) : (
                    <span className={styles.recipe_icon} style={{ background: resultDef?.color }}>
                      {resultDef?.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <strong>{resultDef?.name ?? recipe.resultItemId}</strong>
                    {resultDef?.description && <p className={styles.recipe_desc}>{resultDef.description}</p>}
                  </div>
                </div>

                <ul className={styles.ingredient_list}>
                  {recipe.ingredients.map((ing) => {
                    const def = getItemDefinition(ing.itemId);
                    const have = countItem(inventory, ing.itemId);
                    const enough = have >= ing.quantity;

                    return (
                      <li
                        key={ing.itemId}
                        className={enough ? styles.ingredient_ok : styles.ingredient_missing}
                      >
                        {def?.name ?? ing.itemId}: {have} / {ing.quantity}
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  className={styles.craft_button}
                  disabled={!craftable}
                  onClick={() => onCraft(recipe.id)}
                >
                  Craftar
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default CraftPanel;
