// NPC — bem mais simples que Enemy: não luta, não anda, não tem level.
// Só fica parado num ponto do mapa até o player chegar perto.
//
// `role` decide o que a proximidade abre (hoje só "pocoes" existe — abre
// o CraftPanel). Adicionar um NPC de outro papel (guilda, forja) é só
// somar um valor novo nesse union e um `case` a mais em quem trata a
// interação (GamePage), sem mexer em nada de renderização/detecção.
export type NpcRole = "pocoes";

export type NpcConfig = {
  id: string;
  name: string;
  spriteSrc: string;
  tileX: number; // posição no mapa, em tiles (mesma convenção de BuildingConfig)
  tileY: number;
  role: NpcRole;
  interactionRadius: number; // em px — alcance pra abrir a interação sozinho
};
