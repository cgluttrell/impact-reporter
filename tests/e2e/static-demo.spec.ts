import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("static demo supports the four-step workflow and export", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Impact Reporter" })).toBeVisible();
  await expect(page.getByText("Demo uses sample data only")).toBeVisible();
  await expect(
    page.getByText("Turn program notes into a funder-ready draft"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Guide", exact: true }),
  ).toHaveAttribute("href", "/guide");
  await expect(
    page.getByRole("button", { name: "Start preloaded walkthrough" }),
  ).toBeVisible();
  await expect(page.getByLabel("Optional sample evidence packet")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Analyze pasted packet" }),
  ).toBeDisabled();

  await page.getByRole("button", { name: /Step 2 Evidence ledger/ }).click();
  await expect(page.getByRole("heading", { name: "Evidence ledger" })).toBeVisible();
  await expect(page.getByText("E8: Unsupported impact claim")).toBeVisible();

  await page.getByRole("button", { name: /Step 3 Coverage and draft/ }).click();
  await expect(page.getByRole("heading", { name: "Coverage and draft" })).toBeVisible();
  await expect(page.getByText("C6 / R3")).toBeVisible();
  await expect(page.getByText("blocked").first()).toBeVisible();
  await page.getByRole("button", { name: /C3 \/ R3/ }).click();
  await expect(page.getByRole("heading", { name: "E3: Matched reading check" })).toBeVisible();
  await page.getByRole("button", { name: /C6 \/ R3/ }).click();
  await expect(page.getByRole("heading", { name: "E8: Unsupported impact claim" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "E3: Matched reading check" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: /Step 4 Review and export/ }).click();
  await expect(page.getByRole("heading", { name: "Review and export" })).toBeVisible();
  await expect(
    page.getByText("1 blocked claim excluded from export"),
  ).toBeVisible();
  await expect(page.getByText("Supported claims", { exact: true })).toBeVisible();
  await expect(page.getByText("Caveated claims", { exact: true })).toBeVisible();
  await expect(page.getByText("Blocked claim", { exact: true })).toBeVisible();
  await expect(page.getByText("Export locked")).toBeVisible();
  await expect(
    page.getByText("Clean export requires recorded human review."),
  ).toBeVisible();
  await expect(page.getByText(/Human review completed/)).toHaveCount(0);

  const exportButton = page.getByRole("button", {
    name: /Generate Markdown export/,
  });
  await expect(exportButton).toBeDisabled();

  await page
    .getByLabel("I reviewed this report's claims and confirm the sample export is ready.")
    .check();
  await expect(exportButton).toBeEnabled();
  await expect(page.getByText("Ready to export")).toBeVisible();

  await exportButton.click();
  await expect(page.getByText("Winter Learning Lab Progress Update")).toBeVisible();
  await expect(page.locator("pre")).toContainText("Blocked claim excluded");
  await expect(page.getByText("Markdown report preview")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Markdown" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download .md" })).toBeVisible();

  await expect(
    page.getByLabel("Generated Markdown export"),
  ).toContainText("Blocked claim excluded");
  await expect(page.getByLabel("Generated Markdown export")).toContainText(
    "not proof of causal impact",
  );
  await expect(page.getByLabel("Generated Markdown export")).not.toContainText(
    "The program increased students' confidence and will improve grades.",
  );
  await page
    .getByLabel("I reviewed this report's claims and confirm the sample export is ready.")
    .uncheck();
  await expect(page.getByText("Markdown report preview")).toHaveCount(0);
  await expect(exportButton).toBeDisabled();

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

test("guide page explains the user workflow without roadmap language", async ({
  page,
}) => {
  await page.goto("/guide");

  await expect(
    page.getByRole("heading", {
      name: "Use Impact Reporter to check a progress report before it leaves the team",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("You start with a safe sample reporting packet"),
  ).toBeVisible();
  await expect(page.getByText("What the app produces")).toBeVisible();
  await expect(
    page.getByText("A blocked-claim check that keeps unsupported confidence"),
  ).toBeVisible();
  await expect(page.getByText("Use synthetic or non-confidential")).toBeVisible();
  await expect(page.getByText("What comes next")).toHaveCount(0);
  await expect(page.getByText(/next MVP/i)).toHaveCount(0);
  await expect(page.getByText(/user accounts/i)).toHaveCount(0);

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

  await page.getByRole("button", { name: "Analyze pasted packet" }).click();

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
  await expect(
    page.getByText("Clean export requires recorded human review."),
  ).toBeVisible();
  await page
    .getByLabel("I reviewed this report's claims and confirm the sample export is ready.")
    .check();
  await page.getByRole("button", { name: /Generate Markdown export/ }).click();

  await expect(page.getByLabel("Generated Markdown export")).toContainText(
    "Library STEM Night Progress Update",
  );
  await expect(page.getByLabel("Generated Markdown export")).toContainText(
    "blocked claim excluded",
  );
});
