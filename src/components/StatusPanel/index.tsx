import { useState } from "react";
import type {
  PlayerAttributes,
  PrimaryAttributes,
} from "../../entities/player/playerAttributes";
import { computeDerivedStats } from "../../entities/player/playerAttributes";
import type { PlayerProgress } from "../../entities/player/playerProgress";
import styles from "./StatusPanel.module.scss";

type Props = {
  attributes: PlayerAttributes;
  progress: PlayerProgress;
  onAllocate: (key: keyof PrimaryAttributes) => void;
};

type Tab = "primary" | "secondary";

type PrimaryRow = {
  key: keyof PrimaryAttributes;
  label: string;
  detail: string;
};

// Painel de status do player: level/XP no topo, aba "Atributos" (FOR/DES/
// CON/RES, primários — com botão de alocar ponto quando houver pontos
// sobrando) e aba "Secundários" (Precisão — separada, funcional, mas não
// recebe ponto de level up).
function StatusPanel({ attributes, progress, onAllocate }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("primary");

  const stats = computeDerivedStats(attributes);
  const xpPercent = Math.min(100, (progress.xp / progress.xpToNextLevel) * 100);

  const primaryRows: PrimaryRow[] = [
    {
      key: "for",
      label: "Força (FOR)",
      detail: `${Math.round(stats.damage)} dano do soco · ${stats.knockbackForce.toFixed(1)} força de knockback`,
    },
    {
      key: "des",
      label: "Destreza (DES)",
      detail: `${stats.speed.toFixed(2)} px/frame · ${Math.round(stats.attackCooldown)} frames de cooldown`,
    },
    {
      key: "con",
      label: "Constituição (CON)",
      detail: `${Math.round(stats.hpMax)} HP máximo`,
    },
    {
      key: "res",
      label: "Resistência (RES)",
      detail: `${stats.defense.toFixed(1)} de redução de dano recebido`,
    },
  ];

  return (
    <>
      <button
        className={styles.toggle_button}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "✕ Fechar" : `☰ Status ${progress.unallocatedPoints > 0 ? `(${progress.unallocatedPoints})` : ""}`}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.level_row}>
            <span className={styles.level_label}>Level {progress.level}</span>
            {progress.unallocatedPoints > 0 && (
              <span className={styles.points_badge}>
                {progress.unallocatedPoints} pontos pra alocar
              </span>
            )}
          </div>

          <div className={styles.xp_bar}>
            <div
              className={styles.xp_bar_fill}
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className={styles.xp_label}>
            {progress.xp} / {progress.xpToNextLevel} XP
          </div>

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
              {primaryRows.map((row) => (
                <li key={row.key}>
                  <div className={styles.stat_header}>
                    <span>{row.label}</span>
                    {progress.unallocatedPoints > 0 && (
                      <button
                        className={styles.allocate_button}
                        onClick={() => onAllocate(row.key)}
                        type="button"
                        aria-label={`Alocar ponto em ${row.label}`}
                      >
                        +
                      </button>
                    )}
                  </div>
                  <strong>{attributes.primary[row.key]}</strong>
                  <small>{row.detail}</small>
                </li>
              ))}
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
