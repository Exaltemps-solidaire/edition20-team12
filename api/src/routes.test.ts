import { describe, expect, it } from "vitest";
import { computeCliff, computeCoverage, computeHorizonCoverage, determineAlert, hasOverlap, parseFundingInput, router } from "./routes.ts";

describe("router", () => {
  it("répond 200 sur les deux routes de santé", () => {
    expect(router("GET", "/health").statut).toBe(200);
    expect(router("GET", "/sante?x=1").statut).toBe(200);
  });

  it("répond 404 sur une route inconnue ou une méthode non prévue", () => {
    expect(router("GET", "/api/v1/inconnue").statut).toBe(404);
    expect(router("POST", "/health").statut).toBe(404);
  });

  it("répond 200 sur /api/v1/positions avec la liste des postes alertés", () => {
    const { statut, corps } = router("GET", "/api/v1/positions");
    expect(statut).toBe(200);
    expect(Array.isArray(corps)).toBe(true);
    expect((corps as unknown[]).length).toBeGreaterThanOrEqual(3);
  });

  it("répond 200 sur /api/v1/positions/:id avec le détail d'un poste connu", () => {
    const { statut, corps } = router("GET", "/api/v1/positions/P05");
    expect(statut).toBe(200);
    expect((corps as { id: string }).id).toBe("P05");
    expect((corps as { fundings: unknown[] }).fundings.length).toBeGreaterThan(0);
  });

  it("répond 404 sur /api/v1/positions/:id pour un poste inconnu", () => {
    expect(router("GET", "/api/v1/positions/INCONNU").statut).toBe(404);
  });

  it("ajoute un financement valide à un poste et le renvoie dans la liste", () => {
    const { statut, corps } = router("POST", "/api/v1/positions/P04/financements", {
      funder: "Fondation Test",
      amount: 15000,
    });
    expect(statut).toBe(201);
    const fundings = (corps as { fundings: { funder: string }[] }).fundings;
    expect(fundings.some((f) => f.funder === "Fondation Test")).toBe(true);
  });
});

describe("parseFundingInput", () => {
  it("rejette un financeur manquant ou vide", () => {
    expect(parseFundingInput({ amount: 100 })).toBeNull();
    expect(parseFundingInput({ funder: "  ", amount: 100 })).toBeNull();
  });

  it("accepte un financeur et un montant valides, sans date de fin", () => {
    const funding = parseFundingInput({ funder: "Fondation Test", amount: 5000 });
    expect(funding).not.toBeNull();
    expect(funding?.endDate).toBeNull();
  });
});

describe("computeCoverage", () => {
  const referenceDate = "2026-11-01";

  it("vaut 0 sans financement actif à la date de référence", () => {
    const fundings = [{ funder: "Lululemon", amount: 4000, startDate: "2026-01-01", endDate: "2026-06-30" }];
    expect(computeCoverage(fundings, 4000, referenceDate)).toBe(0);
  });

  it("vaut 100 quand un financement actif couvre tout le coût mensuel", () => {
    const fundings = [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: null }];
    expect(computeCoverage(fundings, 4000, referenceDate)).toBe(100);
  });

  it("compte un financement démarré en cours du mois de référence (comparaison au mois près)", () => {
    const fundings = [{ funder: "Nouveau bailleur", amount: 2000, startDate: "2026-11-18", endDate: null }];
    expect(computeCoverage(fundings, 4000, referenceDate)).toBe(50);
  });
});

describe("computeCliff", () => {
  const referenceDate = "2026-11-01";

  it("retient la fin la plus proche parmi les financements actifs, à moins de 6 mois", () => {
    const fundings = [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: "2026-12-31" }];
    expect(computeCliff(fundings, referenceDate)).toEqual({ cliffDate: "2026-12-31", monthsBeforeCliff: 1 });
  });

  it("vaut null sans date de fin parmi les financements actifs", () => {
    const fundings = [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: null }];
    expect(computeCliff(fundings, referenceDate)).toEqual({ cliffDate: null, monthsBeforeCliff: null });
  });

  it("ignore la date de fin d'un financement déjà expiré au mois de référence", () => {
    const fundings = [{ funder: "Lululemon", amount: 4000, startDate: "2026-01-01", endDate: "2026-06-30" }];
    expect(computeCliff(fundings, referenceDate)).toEqual({ cliffDate: null, monthsBeforeCliff: null });
  });
});

describe("computeHorizonCoverage", () => {
  const horizonStart = "2026-01";
  const horizonEnd = "2027-12";

  it("vaut 100 quand un financement couvre tout l'horizon sans interruption", () => {
    const fundings = [{ funder: "Financement historique", amount: 4000, startDate: "2026-01-01", endDate: null }];
    expect(computeHorizonCoverage(fundings, 4000, horizonStart, horizonEnd)).toBe(100);
  });

  it("vaut la part de l'horizon couverte par un financement qui s'arrête en cours d'horizon", () => {
    const fundings = [{ funder: "Lululemon", amount: 4000, startDate: "2026-01-01", endDate: "2026-06-30" }];
    expect(computeHorizonCoverage(fundings, 4000, horizonStart, horizonEnd)).toBe(25);
  });
});

describe("hasOverlap", () => {
  const referenceMonth = "2026-11";

  it("détecte un doublon quand deux financements sont actifs au mois de référence", () => {
    const fundings = [
      { funder: "A", amount: 4000, startDate: "2026-01-01", endDate: null },
      { funder: "B", amount: 1000, startDate: "2026-01-01", endDate: null },
    ];
    expect(hasOverlap(fundings, referenceMonth)).toBe(true);
  });

  it("ne détecte rien avec un seul financement actif", () => {
    const fundings = [{ funder: "A", amount: 4000, startDate: "2026-01-01", endDate: null }];
    expect(hasOverlap(fundings, referenceMonth)).toBe(false);
  });
});

describe("determineAlert", () => {
  it("signale rouge quand le poste n'est pas couvert ce mois", () => {
    expect(determineAlert(0, 0).color).toBe("red");
  });

  it("signale violet quand il y a un doublon de financement", () => {
    expect(determineAlert(100, null, true).color).toBe("purple");
  });

  it("signale orange quand la date de falaise est à moins de 6 mois", () => {
    expect(determineAlert(100, 2).color).toBe("orange");
  });

  it("signale vert quand le poste est couvert sans falaise proche", () => {
    expect(determineAlert(100, null).color).toBe("green");
  });
});
