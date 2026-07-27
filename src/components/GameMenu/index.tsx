import { useState } from "react";
import { isMuted, toggleMute } from "../../entities/audio/soundEngine";
import styles from "./GameMenu.module.scss";

type Props = {
  inventoryLabel: string;
  statusLabel: string;
  onOpenInventory: () => void;
  onOpenStatus: () => void;
};

// Um botão só ("☰ Menu") que abre uma lista pequena com tudo que antes
// eram botões separados lado a lado (Inventário, Status, Mudo) — evita o
// problema de layout de empilhar botão do lado de botão conforme mais
// abas forem entrando. Mudo não abre painel nenhum: já liga/desliga na
// hora do clique e fecha o menu (é só um toggle, não uma tela).
function GameMenu({ inventoryLabel, statusLabel, onOpenInventory, onOpenStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(() => isMuted());

  const clickAndBlur = (
    e: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    action();
    e.currentTarget.blur();
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggle_button}
        onClick={(e) => clickAndBlur(e, () => setOpen((v) => !v))}
        type="button"
      >
        {open ? "✕ Fechar" : "☰ Menu"}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <button
            className={styles.item}
            onClick={(e) => clickAndBlur(e, () => { setOpen(false); onOpenInventory(); })}
            type="button"
          >
            🎒 {inventoryLabel}
          </button>
          <button
            className={styles.item}
            onClick={(e) => clickAndBlur(e, () => { setOpen(false); onOpenStatus(); })}
            type="button"
          >
            📊 {statusLabel}
          </button>
          <button
            className={styles.item}
            onClick={(e) => clickAndBlur(e, () => { setMuted(toggleMute()); setOpen(false); })}
            type="button"
          >
            {muted ? "🔇 Ativar som" : "🔊 Desativar som"}
          </button>
        </div>
      )}
    </div>
  );
}

export default GameMenu;
