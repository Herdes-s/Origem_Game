import {
  FaAngleDoubleUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
} from "react-icons/fa";
import { FaArrowsSpin } from "react-icons/fa6";

import styles from "./ControlGame.module.scss";

function ControlGame() {
  return (
    <section className={styles.control_game}>
      <div className={styles.control_base}>
        <div className={styles.contro_move}>
          <div className={styles.control_top}>
            <FaArrowUp className={styles.control_btn} />
          </div>
          <div className={styles.control_mid}>
            <FaArrowLeft className={styles.control_btn} />
            <FaArrowsSpin className={styles.control_btn} />
            <FaArrowRight className={styles.control_btn} />
          </div>
          <div className={styles.control_down}>
            <FaArrowDown className={styles.control_btn} />
          </div>
        </div>
        <div className={styles.control_jump}>
          <FaAngleDoubleUp className={styles.control_btn}/>
        </div>
      </div>
    </section>
  );
}

export default ControlGame;
