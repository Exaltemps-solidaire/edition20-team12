// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).

export type Reponse = { statut: number; corps?: unknown };

export type Funding = { funder: string; amount: number; startDate: string; endDate: string | null };

export type Position = {
  id: string;
  title: string;
  branch: string;
  referenceCoverage: number;
  horizonCoverage: number;
  cliffDate: string | null;
  monthsBeforeCliff: number | null;
  fundings: Funding[];
};

export type Alert = { color: "red" | "orange" | "green"; label: string };

// Rule from screen 2 (sketch): not covered this month = red; cliff within 6
// months = orange; otherwise green. Overlap (purple) isn't detected yet: it
// requires cross-referencing funding agreements, out of scope for this iteration.
export function determineAlert(referenceCoverage: number, monthsBeforeCliff: number | null): Alert {
  if (referenceCoverage === 0) {
    return { color: "red", label: "Non couvert" };
  }
  if (monthsBeforeCliff !== null && monthsBeforeCliff < 6) {
    return { color: "orange", label: "Falaise < 6 mois" };
  }
  return { color: "green", label: "OK" };
}

// Hardcoded data taken from the screen 2 sketch, until agreement/position entry
// is wired up (see ITERATIONS.md, "À venir").
const POSITIONS: Position[] = [
  { id: "P01", title: "Délégué·e générale", branch: "Siège", referenceCoverage: 100, horizonCoverage: 75, cliffDate: "2026-12-31", monthsBeforeCliff: 2, fundings: [] },
  { id: "P02", title: "Resp. administratif·ve et financier·e", branch: "Siège", referenceCoverage: 100, horizonCoverage: 100, cliffDate: null, monthsBeforeCliff: null, fundings: [] },
  { id: "P03", title: "Directrice développement & partenariats", branch: "Siège", referenceCoverage: 100, horizonCoverage: 81.25, cliffDate: "2027-03-31", monthsBeforeCliff: 5, fundings: [] },
  { id: "P04", title: "Responsable d'antenne", branch: "Paris", referenceCoverage: 100, horizonCoverage: 77.38, cliffDate: "2026-12-31", monthsBeforeCliff: 2, fundings: [] },
  // Case from the passation sketch (screen 3): Salarié·e E left 2026-06-30, Salarié·e F
  // arrives 2026-09-01, the Lululemon funding ended with the departure and is now orphaned.
  { id: "P05", title: "Responsable d'antenne", branch: "Lyon", referenceCoverage: 0, horizonCoverage: 27.87, cliffDate: null, monthsBeforeCliff: 0, fundings: [{ funder: "Lululemon", startDate: "2026-01-01", endDate: "2026-06-30" }] },
  { id: "P06", title: "Chargé·e de projet alimentation", branch: "Paris", referenceCoverage: 100, horizonCoverage: 81.25, cliffDate: "2027-03-31", monthsBeforeCliff: 5, fundings: [] },
  { id: "P07", title: "Animateur·rice Le Carillon", branch: "Bordeaux", referenceCoverage: 100, horizonCoverage: 50, cliffDate: "2026-12-31", monthsBeforeCliff: 2, fundings: [] },
  { id: "P08", title: "Chargé·e de formation", branch: "Lille", referenceCoverage: 100, horizonCoverage: 100, cliffDate: null, monthsBeforeCliff: null, fundings: [] },
];

function listPositions(): (Position & { alert: Alert })[] {
  return POSITIONS.map((p) => ({ ...p, alert: determineAlert(p.referenceCoverage, p.monthsBeforeCliff) }));
}

function findPosition(id: string): (Position & { alert: Alert }) | undefined {
  const position = POSITIONS.find((p) => p.id === id);
  if (!position) return undefined;
  return { ...position, alert: determineAlert(position.referenceCoverage, position.monthsBeforeCliff) };
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
    return { statut: 201, corps: { ...position, alert: determineAlert(position.referenceCoverage, position.monthsBeforeCliff) } };
  }
  return { statut: 404 };
}
