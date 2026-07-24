import { useState } from "react";
import type { Inventory } from "../../entities/items/itemTypes";
import { getItemDefinition } from "../../entities/items/itemDefinitions";
import { ITEM_DEFINITIONS } from "../../entities/items/itemDefinitions";
import styles from "./InventoryPanel.module.scss";

type Props = {
  inventory: Inventory;
  currentWeight: number;
  carryCapacity: number;
  onAddTestItem: (itemId: string) => void;
  onDiscard: (slotIndex: number) => void;
};

// Painel de inventário: 10 slots (item igual empilha, item diferente
// ocupa slot próprio), barra de peso/capacidade (capacidade escala com
// FOR — ver entities/items/weight.ts) e, por enquanto, uma fileira de
// botões de TESTE pra popular o inventário — ainda não existe coleta de
// verdade (drop de inimigo, planta no mapa etc.), então é assim que dá
// pra validar stack/slot/peso até essa parte chegar.
function InventoryPanel({
  inventory,
  currentWeight,
  carryCapacity,
  onAddTestItem,
  onDiscard,
}: Props) {
  const [open, setOpen] = useState(false);

  const clickAndBlur = (
    e: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    action();
    e.currentTarget.blur();
  };

  const weightPercent = Math.min(100, (currentWeight / carryCapacity) * 100);
  const isFull = currentWeight >= carryCapacity;
  const usedSlots = inventory.filter((s) => s !== null).length;

  return (
    <>
      <button
        className={styles.toggle_button}
        onClick={(e) => clickAndBlur(e, () => setOpen((v) => !v))}
        type="button"
      >
        {open ? "✕ Fechar" : `🎒 Inventário (${usedSlots}/${inventory.length})`}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.weight_row}>
            <span>
              Carga: {currentWeight.toFixed(1)} / {carryCapacity.toFixed(1)}
            </span>
            {isFull && <span className={styles.full_badge}>CHEIO</span>}
          </div>
          <div className={styles.weight_bar}>
            <div
              className={isFull ? styles.weight_bar_fill_full : styles.weight_bar_fill}
              style={{ width: `${weightPercent}%` }}
            />
          </div>

          <div className={styles.grid}>
            {inventory.map((slot, i) => {
              const def = slot ? getItemDefinition(slot.itemId) : undefined;

              return (
                <button
                  key={i}
                  type="button"
                  className={styles.slot}
                  disabled={!slot}
                  title={def ? `${def.name} — clique pra descartar 1` : "Vazio"}
                  onClick={(e) => clickAndBlur(e, () => onDiscard(i))}
                >
                  {def && slot && (
                    <>
                      <span
                        className={styles.icon}
                        style={{ background: def.color }}
                      >
                        {def.name.charAt(0)}
                      </span>
                      {slot.quantity > 1 && (
                        <span className={styles.qty}>{slot.quantity}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.test_row}>
            <small className={styles.test_label}>Itens de teste (temporário):</small>
            <div className={styles.test_buttons}>
              {Object.values(ITEM_DEFINITIONS).map((def) => (
                <button
                  key={def.id}
                  type="button"
                  className={styles.test_button}
                  onClick={(e) => clickAndBlur(e, () => onAddTestItem(def.id))}
                >
                  +1 {def.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InventoryPanel;
