"use client";

import { useRouter } from "next/navigation";
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
  overlapMonths: number;
  fundings: Funding[];
  alert: Alert;
};

type PositionSummary = { id: string; title: string; branch: string };

export default function PositionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [position, setPosition] = useState<Position | null | undefined>(undefined);
  const [allPositions, setAllPositions] = useState<PositionSummary[]>([]);
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

  useEffect(() => {
    fetch("/api/v1/positions")
      .then((response) => (response.ok ? response.json() : []))
      .then(setAllPositions)
      .catch(() => setAllPositions([]));
  }, []);

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

  const orphanedFunding = position?.fundings.find((f) => f.endDate !== null && position.referenceCoverage === 0);

  return (
    <main className={pageStyles.page}>
      <h1 className={pageStyles.pageTitle}>Financement des postes</h1>

      <nav className={pageStyles.tabNav}>
        <button type="button" className={pageStyles.tabBtn} disabled>📊 Vue d&apos;ensemble</button>
        <button type="button" className={pageStyles.tabBtn} onClick={() => router.push("/")}>📋 Postes</button>
        <button type="button" className={`${pageStyles.tabBtn} ${pageStyles.tabBtnActive}`}>🔍 Détail d&apos;un poste</button>
        <button type="button" className={pageStyles.tabBtn} disabled>📄 Tableau de bord Direction</button>
      </nav>

      <div className={styles.selectWrap}>
        <label htmlFor="poste-select">Poste</label>
        <select id="poste-select" value={id} onChange={(e) => router.push(`/postes/${e.target.value}`)}>
          {allPositions.map((p) => (
            <option key={p.id} value={p.id}>{p.id} – {p.title} ({p.branch})</option>
          ))}
        </select>
      </div>

      {position === undefined && <p>Chargement…</p>}
      {position === null && <p className={pageStyles.error}>Poste introuvable.</p>}

      {position && (
        <>
          <dl className={styles.kpis}>
            <div className={styles.kpiCard}>
              <dt>Couverture mois réf.</dt>
              <dd>{position.referenceCoverage}%</dd>
            </div>
            <div className={styles.kpiCard}>
              <dt>Date de falaise</dt>
              <dd>{position.cliffDate ?? "Non couvert"}</dd>
            </div>
            <div className={styles.kpiCard}>
              <dt>Mois en doublon</dt>
              <dd>{position.overlapMonths}</dd>
            </div>
            <div className={styles.kpiCard}>
              <dt>Alerte</dt>
              <dd>
                <span className={`${pageStyles.dot} ${styles.alertDot} ${pageStyles[position.alert.color]}`} />
                {position.alert.label}
              </dd>
            </div>
          </dl>

          {orphanedFunding && (
            <p className={styles.orphanBanner}>
              ⚠ Financement orphelin : {orphanedFunding.funder} verse {orphanedFunding.amount} € pour une personne qui n&apos;occupe plus le poste.
            </p>
          )}

          <h2>Financements</h2>
          {position.fundings.length === 0 && <p>Aucun financement saisi.</p>}
          {position.fundings.length > 0 && (
            <ul>
              {position.fundings.map((funding, index) => (
                <li key={index}>
                  {funding.funder} : {funding.amount} € — {funding.startDate} → {funding.endDate ?? "en cours"}
                </li>
              ))}
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
