import type { GameKeys, AttackState } from "../../types/game";
import styles from "./ControlGame.module.scss";

type Props = {
  keysRef:      React.RefObject<GameKeys>;
  attackRef:    React.RefObject<AttackState>;
  directionRef: React.RefObject<string>;
};

const DIRECTIONS: { label: string; key: string }[] = [
  { label: "▲", key: "ArrowUp" },
  { label: "◀", key: "ArrowLeft" },
  { label: "▼", key: "ArrowDown" },
  { label: "▶", key: "ArrowRight" },
];

function ControlGame({ keysRef, attackRef, directionRef }: Props) {
  const handlePress   = (key: string) => { keysRef.current[key] = true; };
  const handleRelease = (key: string) => { keysRef.current[key] = false; };

  // Botão de ataque — aciona diretamente o attackRef
  const handleAttackPress = () => {
    const attack = attackRef.current;
    if (attack.cooldown <= 0 && !attack.active) {
      attack.active    = true;
      attack.duration  = 8;
      attack.cooldown  = 25;
      attack.direction = directionRef.current as AttackState["direction"];
      attack.hitEnemyIds = new Set();
    }
  };

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
          >
            {label}
          </button>
        ))}
      </div>

      {/* Botão de ataque — direita */}
      <div className={styles.action_buttons}>
        <button
          className={styles.attack_btn}
          onPointerDown={handleAttackPress}
          onPointerUp={() => {}}
        >
          ⚔️
        </button>
      </div>
    </div>
  );
}

export default ControlGame;