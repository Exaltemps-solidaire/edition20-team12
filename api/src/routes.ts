// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).

export type Reponse = { statut: number; corps?: unknown };

export type Funding = { funder: string; amount: number; startDate: string; endDate: string | null };

export type Position = {
  id: string;
  title: string;
  branch: string;
  monthlyCost: number;
  fundings: Funding[];
};

// Date de référence et horizon d'analyse du tableau de bord (Écran 1 de la
// passation : référence 01/11/2026, horizon 01/2026-12/2027). L'horizon reste
// fixe (non saisissable) pour cette itération.
const REFERENCE_DATE = "2026-11-01";
const HORIZON_START_MONTH = "2026-01";
const HORIZON_END_MONTH = "2027-12";

function isActive(f: Funding, referenceMonth: string): boolean {
  return f.startDate.slice(0, 7) <= referenceMonth && (f.endDate === null || f.endDate.slice(0, 7) >= referenceMonth);
}

// Somme des financements actifs à la date de référence, rapportée au coût mensuel
// du poste (cadrage/3-solution.md : "le tableur croise automatiquement les deux").
// Comparaison au mois près (YYYY-MM) : la couverture est une notion mensuelle, et un
// financement saisi en cours de mois doit couvrir tout le mois de référence.
export function computeCoverage(fundings: Funding[], monthlyCost: number, referenceDate: string): number {
  if (monthlyCost <= 0) return 0;
  const referenceMonth = referenceDate.slice(0, 7);
  const total = fundings.filter((f) => isActive(f, referenceMonth)).reduce((sum, f) => sum + f.amount, 0);
  return Math.min(100, Math.round((total / monthlyCost) * 100));
}

// Date de falaise : fin la plus proche parmi les financements actifs au mois de
// référence (un financement déjà expiré ne menace plus rien, il est déjà compté
// dans la couverture à 0). Pas de date de fin parmi les actifs → pas de falaise prévisible.
export function computeCliff(fundings: Funding[], referenceDate: string): { cliffDate: string | null; monthsBeforeCliff: number | null } {
  const referenceMonth = referenceDate.slice(0, 7);
  const endings = fundings
    .filter((f) => isActive(f, referenceMonth) && f.endDate !== null)
    .map((f) => f.endDate as string)
    .sort();
  if (endings.length === 0) return { cliffDate: null, monthsBeforeCliff: null };
  const cliffDate = endings[0];
  const [refYear, refMonth] = referenceMonth.split("-").map(Number);
  const [cliffYear, cliffMonth] = cliffDate.slice(0, 7).split("-").map(Number);
  const monthsBeforeCliff = (cliffYear - refYear) * 12 + (cliffMonth - refMonth);
  return { cliffDate, monthsBeforeCliff };
}

function monthsInRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  let [year, month] = startMonth.split("-").map(Number);
  const [endYear, endMonth2] = endMonth.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth2)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return months;
}

// Couverture horizon : moyenne de la couverture mensuelle (même règle que
// computeCoverage) sur tous les mois de l'horizon d'analyse (Écran 1).
export function computeHorizonCoverage(fundings: Funding[], monthlyCost: number, horizonStartMonth: string, horizonEndMonth: string): number {
  const months = monthsInRange(horizonStartMonth, horizonEndMonth);
  const total = months.reduce((sum, month) => sum + computeCoverage(fundings, monthlyCost, `${month}-01`), 0);
  return Math.round(total / months.length);
}

export type Alert = { color: "red" | "orange" | "green" | "purple"; label: string };

// Doublon : plus d'un financement actif au mois de référence (chevauchement
// entre deux conventions). Les trous entre financements consécutifs restent
// hors périmètre (voir ITERATIONS.md, Itération 7).
export function hasOverlap(fundings: Funding[], referenceMonth: string): boolean {
  return fundings.filter((f) => isActive(f, referenceMonth)).length > 1;
}

// Rule from screen 2 (sketch): not covered this month = red; overlap = purple;
// cliff within 6 months = orange; otherwise green.
export function determineAlert(referenceCoverage: number, monthsBeforeCliff: number | null, overlap = false): Alert {
  if (referenceCoverage === 0) {
    return { color: "red", label: "Non couvert" };
  }
  if (overlap) {
    return { color: "purple", label: "Doublon" };
  }
  if (monthsBeforeCliff !== null && monthsBeforeCliff < 6) {
    return { color: "orange", label: "Falaise < 6 mois" };
  }
  return { color: "green", label: "OK" };
}

// Hardcoded data taken from the screen 2 sketch, until agreement/position entry
// is wired up (see ITERATIONS.md, "À venir"). monthlyCost and fundings are
// invented (iteration 4 backfill) to reproduce the reference-coverage percentages
// the sketch showed ; funding end dates (iteration 5 backfill) reproduce the
// cliff dates the sketch showed, now that both are computed instead of stored —
// see ITERATIONS.md, Itérations 4 et 5, for why and what replaces them later.
const POSITIONS: Position[] = [
  { id: "P01", title: "Délégué·e générale", branch: "Siège", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2026-12-31" }] },
  { id: "P02", title: "Resp. administratif·ve et financier·e", branch: "Siège", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: null }] },
  { id: "P03", title: "Directrice développement & partenariats", branch: "Siège", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2027-03-31" }] },
  { id: "P04", title: "Responsable d'antenne", branch: "Paris", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2026-12-31" }] },
  // Case from the passation sketch (screen 3): Salarié·e E left 2026-06-30, Salarié·e F
  // arrives 2026-09-01, the Lululemon funding ended with the departure and is now orphaned.
  { id: "P05", title: "Responsable d'antenne", branch: "Lyon", monthlyCost: 4000, fundings: [{ funder: "Lululemon", amount: 4000, startDate: "2026-01-01", endDate: "2026-06-30" }] },
  { id: "P06", title: "Chargé·e de projet alimentation", branch: "Paris", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2027-03-31" }] },
  { id: "P07", title: "Animateur·rice Le Carillon", branch: "Bordeaux", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2026-12-31" }] },
  // Cas de démonstration de l'Itération 7 : deux financements actifs en même temps (doublon).
  { id: "P08", title: "Chargé·e de formation", branch: "Lille", monthlyCost: 4000, fundings: [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: null }, { funder: "Fondation complémentaire", amount: 1000, startDate: "2026-01-01", endDate: null }] },
];

function withComputed(position: Position): Position & { referenceCoverage: number; cliffDate: string | null; monthsBeforeCliff: number | null; horizonCoverage: number; alert: Alert } {
  const referenceCoverage = computeCoverage(position.fundings, position.monthlyCost, REFERENCE_DATE);
  const { cliffDate, monthsBeforeCliff } = computeCliff(position.fundings, REFERENCE_DATE);
  const horizonCoverage = computeHorizonCoverage(position.fundings, position.monthlyCost, HORIZON_START_MONTH, HORIZON_END_MONTH);
  const overlap = hasOverlap(position.fundings, REFERENCE_DATE.slice(0, 7));
  return { ...position, referenceCoverage, cliffDate, monthsBeforeCliff, horizonCoverage, alert: determineAlert(referenceCoverage, monthsBeforeCliff, overlap) };
}

function listPositions() {
  return POSITIONS.map(withComputed);
}

function findPosition(id: string) {
  const position = POSITIONS.find((p) => p.id === id);
  return position ? withComputed(position) : undefined;
}

// Validates the body of POST /api/v1/positions/:id/financements. Only funder
// and amount are required (DoD iteration 3, critère 2) ; startDate defaults to
// today since the form (iteration 3) doesn't ask for it.
export function parseFundingInput(body: unknown): Funding | null {
  if (typeof body !== "object" || body === null) return null;
  const { funder, amount, endDate } = body as Record<string, unknown>;
  if (typeof funder !== "string" || funder.trim() === "") return null;
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  return {
    funder: funder.trim(),
    amount,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: typeof endDate === "string" && endDate.trim() !== "" ? endDate : null,
  };
}

export function router(methode: string, url: string, body?: unknown): Reponse {
  const chemin = new URL(url, "http://api").pathname;
  if (methode === "GET" && (chemin === "/health" || chemin === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }
  if (methode === "GET" && chemin === "/api/v1/positions") {
    return { statut: 200, corps: listPositions() };
  }
  const detailMatch = chemin.match(/^\/api\/v1\/positions\/([^/]+)$/);
  if (methode === "GET" && detailMatch) {
    const position = findPosition(detailMatch[1]);
    return position ? { statut: 200, corps: position } : { statut: 404 };
  }
  const fundingMatch = chemin.match(/^\/api\/v1\/positions\/([^/]+)\/financements$/);
  if (methode === "POST" && fundingMatch) {
    const position = POSITIONS.find((p) => p.id === fundingMatch[1]);
    if (!position) return { statut: 404 };
    const funding = parseFundingInput(body);
    if (!funding) return { statut: 400, corps: { erreur: "financeur et montant requis" } };
    position.fundings.push(funding);
    return { statut: 201, corps: withComputed(position) };
  }
  return { statut: 404 };
}
