import { useRef, useEffect } from "react";
import { MdOutlineFace2 } from "react-icons/md";
import type { Position } from "../../types/game";
import styles from "./ScreenGame.module.scss";

type Props = {
  posRef: React.RefObject<Position>;
  width: number;
  height: number;
};

function ScreenGame({ posRef, width, height }: Props) {
  const characterRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {

    const loop = () => {
      const pos = posRef.current;
      const el = characterRef.current;

      if (pos && el) {
        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [posRef]);

  return (
    <section className={styles.screen_game}>
      <div
        className={styles.screen_base}
        style={{ width, height }}
      >
        {/* Personagem posicionado via transform pelo loop acima */}
        <div ref={characterRef} className={styles.container_face}>
          <MdOutlineFace2 className={styles.face}/>
        </div>
      </div>
    </section>
  );
}

export default ScreenGame;