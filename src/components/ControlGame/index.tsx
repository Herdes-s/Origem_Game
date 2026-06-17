import styles from "./ControlGame.module.scss";

import type { GameKeys } from "../../types/game";
import type { RefObject } from "react";

type Props = { keysRef: RefObject<GameKeys> };

const BUTTONS: { label: string; key: string }[] = [
  { label: "▲", key: "ArrowUp" },
  { label: "◀", key: "ArrowLeft" },
  { label: "▼", key: "ArrowDown" },
  { label: "▶", key: "ArrowRight" },
];

function ControlGame({ keysRef }: Props) {
  const handlePress = (key: string) => {
    keysRef.current[key] = true;
  };

  const handleRelease = (key: string) => {
    keysRef.current[key] = false;
  };

  return (
      <div className={styles.controls}>
        {BUTTONS.map(({ label, key }) => (
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
  );
}

export default ControlGame;
