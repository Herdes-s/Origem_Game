import { FaPlay } from "react-icons/fa";
import styles from "./HomePage.module.scss"
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();
    return(
        <section className={styles.home_page}>
            <h1 className={styles.title}>ORIGEM</h1>
            <p className={styles.sub_title}>O JOGO DAS HABILIDADES</p>
            <button className={styles.btn} onClick={() => navigate("/game")}><FaPlay /> Começar</button>
        </section>
    )
}

export default HomePage;