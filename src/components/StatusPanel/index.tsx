import { useState } from "react";
import type { PlayerAttributes } from "../../entities/player/playerAttributes";
import { computeDerivedStats } from "../../entities/player/playerAttributes";
import styles from "./StatusPanel.module.scss";

type Props = {
  attributes: PlayerAttributes;
};

type Tab = "primary" | "secondary";

// Painel de status do player: aba "Atributos" (FOR/DES/CON, primários) e
// aba "Secundários" (Precisão — separada, como pedido, mas já funcional).
// Recebe attributes como valor (state do GamePage), não como ref — ler
// ref.current durante o render não é seguro (e o lint acusa isso), então
// quem precisa mostrar o dado na tela sempre recebe o valor já resolvido.
function StatusPanel({ attributes }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("primary");

  const stats = computeDerivedStats(attributes);

  return (
    <>
      <button
        className={styles.toggle_button}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "✕ Fechar" : "☰ Status"}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.tabs}>
            <button
              className={tab === "primary" ? styles.tab_active : styles.tab}
              onClick={() => setTab("primary")}
              type="button"
            >
              Atributos
            </button>
            <button
              className={tab === "secondary" ? styles.tab_active : styles.tab}
              onClick={() => setTab("secondary")}
              type="button"
            >
              Secundários
            </button>
          </div>

          {tab === "primary" && (
            <ul className={styles.stat_list}>
              <li>
                <span>Força (FOR)</span>
                <strong>{attributes.primary.for}</strong>
                <small>
                  {Math.round(stats.damage)} dano do soco · {stats.knockbackForce.toFixed(1)} força de knockback
                </small>
              </li>
              <li>
                <span>Destreza (DES)</span>
                <strong>{attributes.primary.des}</strong>
                <small>
                  {stats.speed.toFixed(2)} px/frame · {Math.round(stats.attackCooldown)} frames de cooldown
                </small>
              </li>
              <li>
                <span>Constituição (CON)</span>
                <strong>{attributes.primary.con}</strong>
                <small>{Math.round(stats.hpMax)} HP máximo</small>
              </li>
            </ul>
          )}

          {tab === "secondary" && (
            <ul className={styles.stat_list}>
              <li>
                <span>Precisão</span>
                <strong>{attributes.secondary.precisao}</strong>
                <small>
                  {Math.round(stats.critChance * 100)}% chance de crítico · x{stats.critDamageMultiplier} de dano
                </small>
              </li>
            </ul>
          )}
        </div>
      )}
    </>
  );
}

export default StatusPanel;
