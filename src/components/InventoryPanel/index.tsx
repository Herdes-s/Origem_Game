import { useRef, useState } from "react";
import type { Inventory } from "../../entities/items/itemTypes";
import { getItemDefinition, ITEM_DEFINITIONS } from "../../entities/items/itemRegistry";
import styles from "./InventoryPanel.module.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  inventory: Inventory;
  currentWeight: number;
  carryCapacity: number;
  onAddTestItem: (itemId: string) => void;
  onMoveItem: (from: number, to: number) => void;
  onConfirmDiscard: (slotIndex: number) => void;
  onUseItem: (slotIndex: number) => void;
};

type DragState = {
  index: number;
  itemId: string;
  x: number; // clientX atual do ponteiro (tela, não mundo)
  y: number; // clientY atual do ponteiro
  startX: number; // posição onde o toque começou — mede se foi arrasto ou só um toque
  startY: number;
} | null;

// Abaixo disso, em pixels, o pointerdown+up conta como TOQUE (seleciona
// o slot), não arrasto (mover/trocar/lixeira). Generoso o bastante pra
// não confundir um toque tremido no celular com início de arrasto.
const TAP_THRESHOLD = 8;

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
  open,
  onClose,
  inventory,
  currentWeight,
  carryCapacity,
  onAddTestItem,
  onMoveItem,
  onConfirmDiscard,
  onUseItem,
}: Props) {
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverTarget, setHoverTarget] = useState<DropTarget>(null);
  const [pendingDiscard, setPendingDiscard] = useState<number | null>(null);
  // Toque simples (sem arrastar) num slot com item seleciona ele — mostra
  // o botão "Usar" se for consumível. Arrastar continua servendo pra
  // mover/trocar/lixeira, sem conflito (ver TAP_THRESHOLD abaixo).
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Fecha e já limpa a seleção — sem isso, ela ficaria presa pra próxima
  // vez que abrir (o componente não desmonta ao "fechar", só retorna
  // null aqui embaixo). Usado nos dois gestos de fechar que o próprio
  // componente controla (fundo escurecido e botão ✕).
  const handleClose = () => {
    setSelectedSlot(null);
    onClose();
  };

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

  const handleSlotPointerDown = (e: React.PointerEvent, index: number) => {
    const slot = inventory[index];
    if (!slot) return;
    e.preventDefault();

    const next: DragState = {
      index,
      itemId: slot.itemId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    };
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

      const moved = Math.hypot(ev.clientX - current.startX, ev.clientY - current.startY);

      if (moved < TAP_THRESHOLD) {
        // toque simples, sem arrastar de verdade — seleciona/deseleciona
        setSelectedSlot((prev) => (prev === current.index ? null : current.index));
        return;
      }

      setSelectedSlot(null); // qualquer arrasto de verdade cancela a seleção

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

  if (!open) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <button className={styles.close_button} onClick={handleClose} type="button" aria-label="Fechar">
            ✕
          </button>

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
              const isSelected = selectedSlot === i;

              return (
                <div
                  key={i}
                  data-slot-index={i}
                  className={[
                    styles.slot,
                    isHovered ? styles.slot_hover : "",
                    isDragSource ? styles.slot_dragging : "",
                    isSelected ? styles.slot_selected : "",
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

          {(() => {
            const selected = selectedSlot !== null ? inventory[selectedSlot] : null;
            const selectedDef = selected ? getItemDefinition(selected.itemId) : undefined;
            if (!selected || !selectedDef) return null;

            return (
              <div className={styles.action_bar}>
                <span>{selectedDef.name}</span>
                {selectedDef.effect && (
                  <button
                    type="button"
                    className={styles.use_button}
                    onClick={() => {
                      onUseItem(selectedSlot as number);
                      setSelectedSlot(null);
                    }}
                  >
                    Usar
                  </button>
                )}
              </div>
            );
          })()}

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
      </div>

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
