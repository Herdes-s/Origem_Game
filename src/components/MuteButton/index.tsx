import { useState } from "react";
import { isMuted, toggleMute } from "../../entities/audio/soundEngine";
import styles from "./MuteButton.module.scss";

// Botão de mudo, ao lado do "☰ Status". Preferência persistida pelo
// próprio soundEngine (localStorage separado do save de progresso — é
// preferência de UI, não estado de partida).
function MuteButton() {
  const [muted, setMuted] = useState(() => isMuted());

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMuted(toggleMute());
    e.currentTarget.blur();
  };

  return (
    <button
      className={styles.mute_button}
      onClick={handleClick}
      type="button"
      aria-label={muted ? "Ativar som" : "Desativar som"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

export default MuteButton;
