import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("static demo supports the four-step workflow and export", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Impact Reporter" })).toBeVisible();
  await expect(page.getByText("Safe pilot: synthetic data only")).toBeVisible();
  await expect(page.getByRole("link", { name: "Guide" })).toHaveAttribute(
    "href",
    "/guide",
  );

  await page.getByRole("button", { name: /Step 2 Evidence ledger/ }).click();
  await expect(page.getByRole("heading", { name: "Evidence ledger" })).toBeVisible();
  await expect(page.getByText("E8: Unsupported impact claim")).toBeVisible();

  await page.getByRole("button", { name: /Step 3 Coverage and draft/ }).click();
  await expect(page.getByRole("heading", { name: "Coverage and draft" })).toBeVisible();
  await expect(page.getByText("C6 / R3")).toBeVisible();
  await expect(page.getByText("blocked").first()).toBeVisible();

  await page.getByRole("button", { name: /Step 4 Review and export/ }).click();
  await expect(page.getByRole("heading", { name: "Review and export" })).toBeVisible();
  await expect(
    page.getByText("1 blocked claim excluded from clean export"),
  ).toBeVisible();

  await page.getByRole("button", { name: /Generate Markdown export/ }).click();
  await expect(page.getByText("Winter Learning Lab Progress Update")).toBeVisible();
  await expect(page.locator("pre")).toContainText("Blocked claim excluded");

  await expect(
    page.getByLabel("Generated Markdown export"),
  ).toContainText("Blocked claim excluded");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(seriousOrCritical).toEqual([]);
});

test("optional live routes are safe without a server-side key", async ({
  request,
}) => {
  const extract = await request.post("/api/extract", {
    data: {
      sourceArtifactId: "source-nll-note",
      note: "Synthetic note text",
    },
  });
  expect(extract.ok()).toBe(true);
  await expect(extract.json()).resolves.toMatchObject({
    mode: "static",
    status: "live_disabled",
  });

  const draft = await request.post("/api/draft", {
    data: {
      sourceArtifactId: "draft-input",
      note: "Accepted synthetic evidence only",
    },
  });
  expect(draft.ok()).toBe(true);
  await expect(draft.json()).resolves.toMatchObject({
    mode: "static",
    status: "live_disabled",
  });
});

test("homepage has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(seriousOrCritical).toEqual([]);
});

test("guide page explains the pilot boundary and next MVP slice", async ({
  page,
}) => {
  await page.goto("/guide");

  await expect(
    page.getByRole("heading", {
      name: "Use Impact Reporter as a safe reporting pilot",
    }),
  ).toBeVisible();
  await expect(page.getByText("No real participant")).toBeVisible();
  await expect(
    page.getByText("bring-your-own sample evidence workflow"),
  ).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(seriousOrCritical).toEqual([]);
});

test("user can analyze a safe sample evidence packet", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Sample evidence packet").fill(`Program: Library STEM Night
Organization: East Branch Friends
Period: 2026-05-01 through 2026-05-31
Funder: Community Skills Fund

Requirement: Describe activities delivered.
Requirement: Summarize participation.
18 youth attended at least one STEM night; 3 sessions were delivered.
Participants completed robotics stations and reading reflection cards.
7 of 9 survey respondents said they could name one engineering design step.
The program will raise school science grades.
Next cycle, add a pre/post design vocabulary check.`);

  await page.getByRole("button", { name: "Analyze sample packet" }).click();

  await expect(page.getByRole("heading", { name: "Evidence ledger" })).toBeVisible();
  await expect(page.getByText("Using pasted sample", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /S1: Participation or delivery note/ }),
  ).toBeVisible();
  await expect(page.getByText("Unsupported impact claim")).toBeVisible();

  await page.getByRole("button", { name: /Step 3 Coverage and draft/ }).click();
  await expect(page.getByText(/SC1 \/ R[12]/)).toBeVisible();
  await expect(page.getByText("blocked").first()).toBeVisible();

  await page.getByRole("button", { name: /Step 4 Review and export/ }).click();
  await page.getByRole("button", { name: /Generate Markdown export/ }).click();

  await expect(page.getByLabel("Generated Markdown export")).toContainText(
    "Library STEM Night Progress Update",
  );
  await expect(page.getByLabel("Generated Markdown export")).toContainText(
    "blocked claim excluded",
  );
});
