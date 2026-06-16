import { MdOutlineFace2 } from "react-icons/md";
import styles from "./ScreenGame.module.scss"

function ScreenGame() {
    return(
        <section className={styles.screen_game}>
            <div className={styles.screen_base}>
                <MdOutlineFace2 className={styles.face}/>
            </div>
        </section>
    )
}

export default ScreenGame;