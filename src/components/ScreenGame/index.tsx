import { MdOutlineFace2 } from "react-icons/md";
import styles from "./ScreenGame.module.scss"

import type { Position } from "../../types/game";

type Props = { pos: Position}

function ScreenGame({pos }: Props) {

    return(
        <section className={styles.screen_game}>
            <div className={styles.screen_base}>
                <MdOutlineFace2 className={styles.face} style={{position: "absolute", left: pos.x, top: pos.y}}/>
            </div>
        </section>
    )
}

export default ScreenGame;