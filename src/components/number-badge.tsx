import styles from "./number-badge.module.css";

export function NumberBadge({ number, label = "", compact = false }: { number: number; label?: string; compact?: boolean }) {
  return <span role="img" className={`${styles.badge} ${compact ? styles.compact : ""}`} aria-label={`${label || "Number"} ${number}`}>
    {label && <span className={styles.label} aria-hidden="true">{label}</span>}
    <span className={styles.digits} aria-hidden="true">{String(number).padStart(2, "0")}</span>
  </span>;
}
