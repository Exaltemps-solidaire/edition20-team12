"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Alert = { color: "red" | "orange" | "green"; label: string };

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
      <h1>Financement des postes</h1>

      {error && <p className={styles.error}>{error}</p>}
      {!positions && !error && <p>Chargement…</p>}

      {positions && (
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
                  <span className={`${styles.dot} ${styles[position.alert.color]}`} />
                  {position.alert.label}
                </td>
                <td>{position.id}</td>
                <td>{position.title}</td>
                <td>{position.branch}</td>
                <td>{position.referenceCoverage}%</td>
                <td>{position.horizonCoverage}%</td>
                <td>{position.cliffDate ?? "Couvert jusqu'à fin d'horizon"}</td>
                <td>{position.monthsBeforeCliff ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
