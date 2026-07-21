import type { GameKeys } from "../../types/game";
import styles from "./ControlGame.module.scss";

type Props = {
  keysRef: React.RefObject<GameKeys>;
};

const DIRECTIONS: { label: string; key: string }[] = [
  { label: "▲", key: "ArrowUp" },
  { label: "◀", key: "ArrowLeft" },
  { label: "▼", key: "ArrowDown" },
  { label: "▶", key: "ArrowRight" },
];

// Tecla que o teclado usa pra atacar (ver playerMovement.ts) — o botão
// mobile aciona a MESMA tecla via keysRef em vez de mexer no attackRef
// direto, assim os dois caminhos passam pela mesma lógica (respeitando o
// cooldown derivado de DES) em vez de duplicar valores fixos aqui.
const ATTACK_KEY = " ";

function ControlGame({ keysRef }: Props) {
  const handlePress = (key: string) => {
    keysRef.current[key] = true;
  };
  const handleRelease = (key: string) => {
    keysRef.current[key] = false;
  };

  // Reforço via JS pro bloqueio do menu de contexto nativo — o CSS
  // (-webkit-touch-callout etc.) já cobre a maioria dos casos, isso é
  // rede de segurança pros navegadores que ainda deixam passar.
  const preventContextMenu = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div className={styles.controls_wrapper}>
      {/* Cruz direcional — esquerda */}
      <div className={styles.dpad}>
        {DIRECTIONS.map(({ label, key }) => (
          <button
            key={key}
            className={styles.btn}
            onPointerDown={() => handlePress(key)}
            onPointerUp={() => handleRelease(key)}
            onPointerLeave={() => handleRelease(key)}
            onContextMenu={preventContextMenu}
            >
            {label}
          </button>
        ))}
      </div>

      {/* Botão de ataque — direita */}
      <div className={styles.action_buttons}>
        <button
          className={styles.attack_btn}
          onPointerDown={() => handlePress(ATTACK_KEY)}
          onPointerUp={() => handleRelease(ATTACK_KEY)}
          onPointerLeave={() => handleRelease(ATTACK_KEY)}
          onContextMenu={preventContextMenu}
        >
          👊
        </button>
      </div>
    </div>
  );
}

export default ControlGame;
