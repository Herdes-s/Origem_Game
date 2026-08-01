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
  | "planta"
  | "pocao";

// O que acontece ao CONSUMIR o item (botão "Usar" no inventário). Só
// itens com esse campo preenchido mostram o botão — union type porque
// puramente "heal" não vai bastar pra sempre (veneno, buff temporário
// etc.), mas só "heal" existe de verdade por enquanto.
export type ItemEffect = {
  type: "heal";
  amount: number;
};

export type ItemDefinition = {
  id: string;
  name: string;
  category: ItemCategory;
  weight: number; // peso por unidade — usado no cálculo de carga (entities/items/weight.ts)
  maxStack: number; // quantos cabem no mesmo slot (1 = não empilha)
  color: string; // cor de fallback do ícone — usada enquanto iconSrc não existe/não carregou
  iconSrc?: string; // caminho pra imagem do item (public/assets/items/...) — opcional, sem isso cai no placeholder de cor+letra
  description?: string;
  effect?: ItemEffect;
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
