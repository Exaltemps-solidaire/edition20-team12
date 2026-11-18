"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import pageStyles from "../../page.module.css";
import styles from "./position-detail.module.css";

type Alert = { color: "red" | "orange" | "green" | "purple"; label: string };

type Funding = { funder: string; amount: number; startDate: string; endDate: string | null };

type Position = {
  id: string;
  title: string;
  branch: string;
  referenceCoverage: number;
  horizonCoverage: number;
  cliffDate: string | null;
  monthsBeforeCliff: number | null;
  fundings: Funding[];
  alert: Alert;
};

export default function PositionDetail({ id }: { id: string }) {
  const [position, setPosition] = useState<Position | null | undefined>(undefined);
  const [funder, setFunder] = useState("");
  const [amount, setAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/positions/${id}`)
      .then((response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`response ${response.status}`);
        return response.json();
      })
      .then(setPosition)
      .catch(() => setPosition(null));
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch(`/api/v1/positions/${id}/financements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funder,
        amount: amount === "" ? undefined : Number(amount),
        endDate: endDate === "" ? null : endDate,
      }),
    });
    if (!response.ok) {
      setError("Financeur et montant sont requis.");
      return;
    }
    setPosition(await response.json());
    setFunder("");
    setAmount("");
    setEndDate("");
  }

  return (
    <main className={pageStyles.page}>
      <p><Link href="/">&larr; Retour au tableau des postes</Link></p>

      {position === undefined && <p>Chargement…</p>}
      {position === null && <p className={pageStyles.error}>Poste introuvable.</p>}

      {position && (
        <>
          <h1>{position.title} — {position.branch}</h1>

          <dl className={styles.kpis}>
            <div>
              <dt>Couverture mois réf.</dt>
              <dd>{position.referenceCoverage}%</dd>
            </div>
            <div>
              <dt>Date de falaise</dt>
              <dd>{position.cliffDate ?? "Non couvert"}</dd>
            </div>
            <div>
              <dt>Alerte</dt>
              <dd>
                <span className={`${pageStyles.dot} ${pageStyles[position.alert.color]}`} />
                {position.alert.label}
              </dd>
            </div>
          </dl>

          <h2>Financements</h2>
          {position.fundings.length === 0 && <p>Aucun financement saisi.</p>}
          {position.fundings.length > 0 && (
            <ul>
              {position.fundings.map((funding, index) => {
                const orphaned = funding.endDate !== null && position.referenceCoverage === 0;
                return (
                  <li key={index}>
                    {funding.funder} : {funding.amount} € — {funding.startDate} → {funding.endDate ?? "en cours"}
                    {orphaned && <strong className={styles.orphaned}> (financement orphelin — poste vacant)</strong>}
                  </li>
                );
              })}
            </ul>
          )}

          <h2>Ajouter un financement</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              Financeur
              <input value={funder} onChange={(e) => setFunder(e.target.value)} />
            </label>
            <label>
              Montant (€)
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label>
              Date de fin (optionnelle)
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <button type="submit">Ajouter</button>
            {error && <p className={pageStyles.error}>{error}</p>}
          </form>
        </>
      )}
    </main>
  );
}
