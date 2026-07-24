import { getItemDefinition } from "./itemDefinitions";
import { INVENTORY_SIZE, type Inventory, type InventorySlot } from "./itemTypes";
import { isOverCapacity } from "./weight";

export function createEmptyInventory(): Inventory {
  return Array<InventorySlot>(INVENTORY_SIZE).fill(null);
}

// Soma peso*quantidade de todo slot ocupado. Barato o bastante pra rodar
// toda vez que precisar (não é hot-path de 60fps, só muda quando o
// inventário muda) — mesmo raciocínio de computeDerivedStats.
export function computeInventoryWeight(inventory: Inventory): number {
  let total = 0;

  for (const slot of inventory) {
    if (!slot) continue;
    const def = getItemDefinition(slot.itemId);
    if (!def) continue; // item de save antigo/inválido — ignora em vez de quebrar
    total += def.weight * slot.quantity;
  }

  return total;
}

export type AddItemResult = {
  inventory: Inventory;
  added: number; // quanto realmente entrou (pode ser menor que o pedido)
};

// Adiciona `quantity` unidades de `itemId` ao inventário — não muta,
// devolve um array novo (mesmo princípio de playerAttributes/
// playerProgress, pra combinar direto com setInventory(prev => ...)).
//
// Prioridade: primeiro empilha em slots existentes do mesmo item até o
// maxStack, depois usa slots vazios. Para no que couber pelo peso
// (capacidade de carga restante) OU pelos slots disponíveis, o que vier
// primeiro — nunca estoura nem o inventário nem a capacidade de carga.
export function addItem(
  inventory: Inventory,
  itemId: string,
  quantity: number,
  currentWeight: number,
  carryCapacity: number,
): AddItemResult {
  const def = getItemDefinition(itemId);
  if (!def || quantity <= 0) return { inventory, added: 0 };

  if (isOverCapacity(currentWeight, carryCapacity)) {
    return { inventory, added: 0 };
  }

  const weightLeft = Math.max(0, carryCapacity - currentWeight);
  const maxByWeight =
    def.weight > 0 ? Math.floor(weightLeft / def.weight) : quantity;

  let remaining = Math.min(quantity, maxByWeight);
  if (remaining <= 0) return { inventory, added: 0 };

  const requested = remaining;
  const next = inventory.map((slot) => (slot ? { ...slot } : null));

  // 1) empilha em slots existentes do mesmo item
  for (let i = 0; i < next.length && remaining > 0; i++) {
    const slot = next[i];
    if (slot && slot.itemId === itemId && slot.quantity < def.maxStack) {
      const space = def.maxStack - slot.quantity;
      const take = Math.min(space, remaining);
      slot.quantity += take;
      remaining -= take;
    }
  }

  // 2) usa slots vazios pro que sobrar
  for (let i = 0; i < next.length && remaining > 0; i++) {
    if (next[i] === null) {
      const take = Math.min(def.maxStack, remaining);
      next[i] = { itemId, quantity: take };
      remaining -= take;
    }
  }

  return { inventory: next, added: requested - remaining };
}

// Remove `quantity` de um slot específico (por índice) — usado ao
// consumir/descartar item. Zera o slot (volta a null) se a quantidade
// chegar a 0. Não muta, devolve array novo.
export function removeItem(
  inventory: Inventory,
  slotIndex: number,
  quantity: number,
): Inventory {
  const slot = inventory[slotIndex];
  if (!slot || quantity <= 0) return inventory;

  const next = inventory.map((s) => (s ? { ...s } : null));
  const target = next[slotIndex];
  if (!target) return inventory;

  target.quantity -= quantity;
  if (target.quantity <= 0) next[slotIndex] = null;

  return next;
}
