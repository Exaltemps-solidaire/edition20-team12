import { describe, expect, it } from "vitest";
import { determineAlert, router } from "./routes.ts";

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
});

describe("determineAlert", () => {
  it("signale rouge quand le poste n'est pas couvert ce mois", () => {
    expect(determineAlert(0, 0).color).toBe("red");
  });

  it("signale orange quand la date de falaise est à moins de 6 mois", () => {
    expect(determineAlert(100, 2).color).toBe("orange");
  });

  it("signale vert quand le poste est couvert sans falaise proche", () => {
    expect(determineAlert(100, null).color).toBe("green");
  });
});
