import type { ItemDefinition } from "./itemTypes";
import { MATERIAIS } from "./definitions/materiais";
import { MINERIOS } from "./definitions/minerios";
import { PLANTAS } from "./definitions/plantas";
import { ARMAS } from "./definitions/armas";
import { INGREDIENTES } from "./definitions/ingredientes";
import { ARMADURAS } from "./definitions/armaduras";
import { ACESSORIOS } from "./definitions/acessorios";
import { POCOES } from "./definitions/pocoes";

// Registro central — junta todas as categorias (definitions/*.ts) num
// Record<id, ItemDefinition> só. O resto do código NUNCA importa um
// arquivo de definitions/ direto, sempre passa por getItemDefinition()
// aqui — mesmo desacoplamento que raceConfigs.ts já garante pros
// inimigos. Item novo numa categoria que já existe é só editar o arquivo
// dela; categoria nova é criar o arquivo em definitions/ e somar aqui.
export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  ...MATERIAIS,
  ...MINERIOS,
  ...PLANTAS,
  ...ARMAS,
  ...INGREDIENTES,
  ...ARMADURAS,
  ...ACESSORIOS,
  ...POCOES,
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DEFINITIONS[itemId];
}
