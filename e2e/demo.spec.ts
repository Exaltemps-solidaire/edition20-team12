import { expect, test } from "@playwright/test";

// Démo du cas passant, de bout en bout. Chaque itération ajoute ses étapes (test.step).
test("Démo : le cas passant", async ({ page }) => {
  await test.step("J'ouvre l'application", async () => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  await test.step("Je vois le tableau des postes avec leurs alertes", async () => {
    await expect(page.getByRole("heading", { name: "Financement des postes" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Non couvert")).toBeVisible();
  });

  await test.step("Je vois la date de falaise recalculée pour un poste bientôt à découvert", async () => {
    await expect(page.getByRole("row", { name: /P01/ })).toContainText("Falaise < 6 mois");
    await expect(page.getByRole("row", { name: /P01/ })).toContainText("2026-12-31");
  });

  await test.step("Je clique sur le poste de Lyon et je vois le financement orphelin", async () => {
    await page.getByRole("row", { name: /Lyon/ }).click();
    await expect(page.getByRole("heading", { name: /Lyon/ })).toBeVisible();
    await expect(page.getByText("financement orphelin")).toBeVisible();
  });

  await test.step("J'ajoute un financement et je le vois apparaître", async () => {
    await page.getByLabel("Financeur").fill("Fondation Démo");
    await page.getByLabel("Montant (€)").fill("20000");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText(/Fondation Démo : 20000/)).toBeVisible();
  });

  await test.step("La couverture du mois de référence se met à jour avec le nouveau financement", async () => {
    const couverture = page.locator("xpath=//dt[text()='Couverture mois réf.']/following-sibling::dd[1]");
    await expect(couverture).not.toHaveText("0%");
  });
});
