"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Alert = { color: "red" | "orange" | "green" | "purple"; label: string };

type Position = {
  id: string;
  title: string;
  branch: string;
  referenceCoverage: number;
  horizonCoverage: number;
  cliffDate: string | null;
  monthsBeforeCliff: number | null;
  alert: Alert;
};

export default function Home() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/positions")
      .then((response) => {
        if (!response.ok) throw new Error(`response ${response.status}`);
        return response.json();
      })
      .then(setPositions)
      .catch(() => setError("Impossible de charger les postes."));
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Financement des postes</h1>

      <nav className={styles.tabNav}>
        <button type="button" className={styles.tabBtn} disabled>📊 Vue d&apos;ensemble</button>
        <button type="button" className={`${styles.tabBtn} ${styles.tabBtnActive}`}>📋 Postes</button>
        <button type="button" className={styles.tabBtn} disabled>🔍 Détail d&apos;un poste</button>
        <button type="button" className={styles.tabBtn} disabled>📄 Tableau de bord Direction</button>
      </nav>

      {error && <p className={styles.error}>{error}</p>}
      {!positions && !error && <p>Chargement…</p>}

      {positions && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Alerte</th>
                <th>ID</th>
                <th>Poste</th>
                <th>Antenne</th>
                <th>Couverture mois réf.</th>
                <th>Couverture horizon</th>
                <th>Date de falaise</th>
                <th>Mois avant falaise</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr
                  key={position.id}
                  onClick={() => router.push(`/postes/${position.id}`)}
                  className={styles.row}
                >
                  <td>
                    <span className={`${styles.pastille} ${styles[`pastille-${position.alert.color}`]}`}>
                      <span className={`${styles.dot} ${styles[position.alert.color]}`} />
                      {position.alert.label}
                    </span>
                  </td>
                  <td>{position.id}</td>
                  <td>{position.title}</td>
                  <td>{position.branch}</td>
                  <td>{coverageBar(position.referenceCoverage, styles)}</td>
                  <td>{coverageBar(position.horizonCoverage, styles)}</td>
                  <td>{position.cliffDate ?? "Couvert jusqu'à fin d'horizon"}</td>
                  <td>{position.monthsBeforeCliff ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.tableNote}>
            Falaise = dernier jour financé à 100 % à partir de la date de référence. Cliquer sur un poste pour en voir le détail.
          </p>
        </div>
      )}
    </main>
  );
}

function coverageBar(pct: number, styles: { [key: string]: string }) {
  return (
    <div className={styles.barWrap}>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${pct === 100 ? styles.barFull : styles.barPartial}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={styles.barPct}>{pct}%</span>
    </div>
  );
}
