// Categorias de item — cobre o que já foi decidido pra v0.3. Nenhuma
// lógica de inventário depende do valor específico da categoria, é só
// classificação/exibição — adicionar uma nova é só mais uma entrada no
// union e na definição do item (mesmo princípio config-driven da v0.2).
export type ItemCategory =
  | "arma"
  | "armadura"
  | "acessorio"
  | "ingrediente"
  | "material"
  | "minerio"
  | "planta";

export type ItemDefinition = {
  id: string;
  name: string;
  category: ItemCategory;
  weight: number; // peso por unidade — usado no cálculo de carga (entities/items/weight.ts)
  maxStack: number; // quantos cabem no mesmo slot (1 = não empilha)
  color: string; // cor de fallback do ícone — placeholder até termos sprite de item de verdade
  description?: string;
};

export const INVENTORY_SIZE = 10;

// Um slot vazio é `null`. Um slot ocupado guarda só o id da definição (não
// o objeto inteiro) + quantidade — mesmo princípio de Enemy.race guardar
// só o nome da raça e resolver a config via lookup (raceConfigs.ts).
export type InventorySlot = {
  itemId: string;
  quantity: number;
} | null;

export type Inventory = InventorySlot[];
