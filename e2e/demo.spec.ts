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

  await test.step("Je clique sur le poste de Lyon et je vois le financement orphelin", async () => {
    await page.getByRole("row", { name: /Lyon/ }).click();
    await expect(page.getByRole("heading", { name: /Lyon/ })).toBeVisible();
    await expect(page.getByText("financement orphelin")).toBeVisible();
  });
});
