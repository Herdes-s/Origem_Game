import { FaArrowLeft, FaTiktok, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./SupportPage.module.scss";

const LINKS = {
  tiktok: "https://www.tiktok.com/@mizum.dev",
  instagram: "https://www.instagram.com/mizum.dev/",
  youtube: "https://www.youtube.com/@Mizum-i2h",
  facebook: "https://www.facebook.com/profile.php?id=61590699144392",
};

function SupportPage() {
  const navigate = useNavigate();

  return (
    <section className={styles.support_page}>
      <button className={styles.back_btn} onClick={() => navigate("/")}>
        <FaArrowLeft /> Voltar
      </button>

      <h1 className={styles.title}>REDES SOCIAIS</h1>
      <p className={styles.sub_title}>
        Me segue pra acompanhar o desenvolvimento do jogo
      </p>

      <div className={styles.social_group}>
        <a
          className={styles.social_icon}
          href={LINKS.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
        >
          <FaTiktok />
        </a>
        <a
          className={styles.social_icon}
          href={LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          className={styles.social_icon}
          href={LINKS.youtube}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>
        <a
          className={styles.social_icon}
          href={LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook />
        </a>
      </div>
    </section>
  );
}

export default SupportPage;
