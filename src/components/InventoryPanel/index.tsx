import { useRef, useState } from "react";
import type { Inventory } from "../../entities/items/itemTypes";
import { getItemDefinition, ITEM_DEFINITIONS } from "../../entities/items/itemRegistry";
import styles from "./InventoryPanel.module.scss";

type Props = {
  inventory: Inventory;
  currentWeight: number;
  carryCapacity: number;
  onAddTestItem: (itemId: string) => void;
  onMoveItem: (from: number, to: number) => void;
  onConfirmDiscard: (slotIndex: number) => void;
};

type DragState = {
  index: number;
  itemId: string;
  x: number; // clientX atual do ponteiro (tela, não mundo)
  y: number; // clientY atual do ponteiro
} | null;

type DropTarget = number | "trash" | null;

// Acha o que está embaixo do ponteiro AGORA (elemento real do DOM), em
// vez de calcular retângulos de cada slot manualmente — mais robusto a
// mudanças de layout/zoom/scroll, e funciona igual pra mouse e toque
// (Pointer Events unificam os dois).
function resolveDropTarget(clientX: number, clientY: number): DropTarget {
  const el = document.elementFromPoint(clientX, clientY);
  if (!el) return null;

  if (el.closest('[data-trash="true"]')) return "trash";

  const slotEl = el.closest("[data-slot-index]");
  if (slotEl) return Number(slotEl.getAttribute("data-slot-index"));

  return null;
}

// Painel de inventário: 10 slots (item igual empilha, item diferente
// ocupa slot próprio), barra de peso/capacidade (capacidade escala com
// FOR — ver entities/items/weight.ts), arrastar pra mover/trocar/empilhar
// entre slots, uma lixeira (com confirmação) que devolve o item pro
// mundo, e uma fileira de botões de TESTE (temporária) pra popular o
// inventário com itens que a coleta de verdade ainda não dropa.
function InventoryPanel({
  inventory,
  currentWeight,
  carryCapacity,
  onAddTestItem,
  onMoveItem,
  onConfirmDiscard,
}: Props) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverTarget, setHoverTarget] = useState<DropTarget>(null);
  const [pendingDiscard, setPendingDiscard] = useState<number | null>(null);

  // Espelho síncrono do `drag` — o listener de pointerup é criado uma vez
  // no pointerdown e precisa ler o valor MAIS RECENTE, não o que estava
  // em vigor quando ele foi criado (closure presa no state antigo).
  const dragRef = useRef<DragState>(null);

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

  const handleSlotPointerDown = (e: React.PointerEvent, index: number) => {
    const slot = inventory[index];
    if (!slot) return;
    e.preventDefault();

    const next: DragState = { index, itemId: slot.itemId, x: e.clientX, y: e.clientY };
    dragRef.current = next;
    setDrag(next);

    const handleMove = (ev: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const updated = { ...current, x: ev.clientX, y: ev.clientY };
      dragRef.current = updated;
      setDrag(updated);
      setHoverTarget(resolveDropTarget(ev.clientX, ev.clientY));
    };

    const handleUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);

      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHoverTarget(null);
      if (!current) return;

      const target = resolveDropTarget(ev.clientX, ev.clientY);

      if (target === "trash") {
        setPendingDiscard(current.index);
      } else if (typeof target === "number" && target !== current.index) {
        onMoveItem(current.index, target);
      }
      // solto em qualquer outro lugar (fora de um slot/lixeira) → não faz nada
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const pendingSlot = pendingDiscard !== null ? inventory[pendingDiscard] : null;
  const pendingDef = pendingSlot ? getItemDefinition(pendingSlot.itemId) : undefined;

  return (
    <>
      <button
        className={styles.toggle_button}
        onClick={(e) => clickAndBlur(e, () => setOpen((v) => !v))}
        type="button"
      >
        {open ? "✕ Fechar" : `🎒 (${usedSlots}/${inventory.length})`}
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
              const isDragSource = drag?.index === i;
              const isHovered = hoverTarget === i && !isDragSource;

              return (
                <div
                  key={i}
                  data-slot-index={i}
                  className={[
                    styles.slot,
                    isHovered ? styles.slot_hover : "",
                    isDragSource ? styles.slot_dragging : "",
                  ].join(" ")}
                  onPointerDown={(e) => handleSlotPointerDown(e, i)}
                  title={def ? def.name : "Vazio"}
                >
                  {def && slot && !isDragSource && (
                    <>
                      {def.iconSrc ? (
                        <img
                          src={def.iconSrc}
                          alt={def.name}
                          draggable={false}
                          className={styles.icon_img}
                        />
                      ) : (
                        <span className={styles.icon} style={{ background: def.color }}>
                          {def.name.charAt(0)}
                        </span>
                      )}
                      {slot.quantity > 1 && <span className={styles.qty}>{slot.quantity}</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div
            data-trash="true"
            className={[styles.trash, hoverTarget === "trash" ? styles.trash_hover : ""].join(" ")}
          >
            🗑 Arraste um item aqui pra descartar
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

      {/* Ícone fantasma seguindo o dedo/cursor durante o arrasto */}
      {drag && (() => {
        const dragDef = getItemDefinition(drag.itemId);
        return (
          <div className={styles.drag_ghost} style={{ left: drag.x, top: drag.y }}>
            {dragDef?.iconSrc ? (
              <img src={dragDef.iconSrc} alt={dragDef.name} draggable={false} className={styles.drag_ghost_img} />
            ) : (
              <span className={styles.drag_ghost_fallback} style={{ background: dragDef?.color }}>
                {dragDef?.name.charAt(0)}
              </span>
            )}
          </div>
        );
      })()}

      {/* Confirmação de descarte — evita perder item por soltar sem querer na lixeira */}
      {pendingDiscard !== null && pendingSlot && (
        <div className={styles.confirm_overlay}>
          <div className={styles.confirm_box}>
            <p>
              Descartar {pendingSlot.quantity}x {pendingDef?.name ?? "item"}?
            </p>
            <div className={styles.confirm_buttons}>
              <button
                type="button"
                className={styles.confirm_button_discard}
                onClick={() => {
                  onConfirmDiscard(pendingDiscard);
                  setPendingDiscard(null);
                }}
              >
                Descartar
              </button>
              <button
                type="button"
                className={styles.confirm_button_cancel}
                onClick={() => setPendingDiscard(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InventoryPanel;
