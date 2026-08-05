import { describe, expect, it } from "vitest";
import {
  buildMarkdownExportFromDataset,
  buildSampleWorkflow,
  samplePacketText,
} from "./sample-workflow";

describe("sample evidence workflow", () => {
  it("turns a safe sample packet into evidence, claims, and export text", () => {
    const dataset = buildSampleWorkflow(samplePacketText);

    expect(dataset.projectBrief.programName).toBe(
      "Community Garden Learning Day",
    );
    expect(dataset.evidence.length).toBeGreaterThan(0);
    expect(dataset.claims.some((claim) => claim.status === "blocked")).toBe(
      true,
    );
    expect(
      dataset.evidence.some((item) => item.provenance.includes("not stored")),
    ).toBe(true);
    expect(
      dataset.claims.some((claim) => claim.requirementId === "R2"),
    ).toBe(true);

    const exportText = buildMarkdownExportFromDataset(dataset);

    expect(exportText).toContain("Community Garden Learning Day Progress Update");
    expect(exportText).toContain("blocked claim excluded");
    expect(exportText).toContain("Evidence Appendix");
  });
});
