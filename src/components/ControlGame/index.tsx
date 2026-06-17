import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
} from "react-icons/fa";
import { FaArrowsSpin } from "react-icons/fa6";

import styles from "./ControlGame.module.scss";

import type { Direction } from "../../types/game";
import { GiPunch } from "react-icons/gi";

type Props = { onMove: (dir: Direction) => void }

function ControlGame({onMove}: Props) {
  return (
    <section className={styles.control_game}>
      <div className={styles.control_base}>
        <div className={styles.contro_move}>
          <div className={styles.control_top}>
            <FaArrowUp className={styles.control_btn} onClick={() => onMove("up")} />
          </div>
          <div className={styles.control_mid}>
            <FaArrowLeft className={styles.control_btn} onClick={() => onMove("left")}/>
            <FaArrowsSpin className={styles.control_btn} />
            <FaArrowRight className={styles.control_btn} onClick={() => onMove("right")}/>
          </div>
          <div className={styles.control_down}>
            <FaArrowDown className={styles.control_btn} onClick={() => onMove("down")} />
          </div>
        </div>
        <div className={styles.control_jump}>
          <GiPunch className={styles.control_btn}/>
        </div>
      </div>
    </section>
  );
}

export default ControlGame;
