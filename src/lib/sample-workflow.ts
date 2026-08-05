import { Claim, EvidenceItem, Requirement, projectBrief } from "./demo-data";

export type ReportDataset = {
  projectBrief: typeof projectBrief;
  requirements: Requirement[];
  evidence: EvidenceItem[];
  claims: Claim[];
  exportTitle: string;
};

export const samplePacketText = `Program: Community Garden Learning Day
Organization: Riverbend Neighborhood Center
Period: 2026-04-01 through 2026-04-30
Funder: Neighborhood Skills Fund

Requirement: Describe activities delivered.
Requirement: Summarize participation.
Requirement: Describe observed learning or skill progress.
Requirement: Name one improvement for the next cycle.

12 residents attended at least one workshop; 4 workshops were delivered; average attendance was 9 residents per workshop.
Participants completed seed-starting, soil testing, and container-garden planning activities.
8 of 10 survey respondents said they could identify two soil-health practices after the workshop.
"I learned how to test the soil before planting."
The program will improve household food security across the neighborhood.
Next cycle, add a follow-up check-in and collect before/after gardening confidence ratings.`;

function classifyEvidence(line: string): Pick<
  EvidenceItem,
  "kind" | "supportClass" | "status" | "warning" | "requirementIds"
> {
  if (/will improve|will increase|will raise|school .*grades|caused|guarantee|prove/i.test(line)) {
    return {
      kind: "unsupported_observation",
      supportClass: "unsupported",
      status: "flagged",
      requirementIds: ["R3"],
      warning:
        "Blocked: future, causal, or broad impact language needs stronger supporting evidence.",
    };
  }

  if (/next cycle|next period|improve|follow-up|collect/i.test(line)) {
    return {
      kind: "improvement_note",
      supportClass: "observation",
      status: "accepted",
      requirementIds: ["R4"],
    };
  }

  if (/^".+"$/.test(line.trim())) {
    return {
      kind: "approved_quote",
      supportClass: "quote",
      status: "accepted_as_observation",
      requirementIds: ["R4"],
      warning: "Quote needs human consent review before real-world use.",
    };
  }

  if (/%|pre|post|survey|score|respondents|increased|decreased/i.test(line)) {
    return {
      kind: "outcome_metric",
      supportClass: "outcome",
      status: "accepted",
      requirementIds: ["R3"],
      warning: "Descriptive progress only; this does not establish causation.",
    };
  }

  if (/attend|resident|student|participant|workshop|session|delivered/i.test(line)) {
    return {
      kind: "attendance_metric",
      supportClass: "output",
      status: "accepted",
      requirementIds: /activity|completed|delivered/i.test(line) ? ["R1"] : ["R2"],
    };
  }

  return {
    kind: "facilitator_note",
    supportClass: "observation",
    status: "accepted_as_observation",
    requirementIds: ["R4"],
    warning: "Observation only. Human review decides whether it belongs in a report.",
  };
}

function labelFor(item: EvidenceItem) {
  if (item.kind === "attendance_metric") return "Participation or delivery note";
  if (item.kind === "outcome_metric") return "Descriptive progress note";
  if (item.kind === "approved_quote") return "Quote needing consent review";
  if (item.kind === "unsupported_observation") return "Unsupported impact claim";
  if (item.kind === "improvement_note") return "Next-cycle improvement";
  return "Observation";
}

function extractBrief(lines: string[]) {
  const brief = { ...projectBrief };

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    if (rest.length === 0) continue;
    const value = rest.join(":").trim();
    if (!value) continue;

    const key = rawKey.trim().toLowerCase();
    if (key === "program") brief.programName = value;
    if (key === "organization") brief.organizationName = value;
    if (key === "period") brief.reportingPeriod = value;
    if (key === "funder") brief.funderName = value;
  }

  brief.reportTitle = `${brief.programName} Progress Update`;
  return brief;
}

export function buildSampleWorkflow(input: string): ReportDataset {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const brief = extractBrief(lines);
  const evidenceLines = lines.filter(
    (line) =>
      !/^(program|organization|period|funder|requirement):/i.test(line),
  );

  const evidence = evidenceLines.slice(0, 8).map<EvidenceItem>((line, index) => {
    const classification = classifyEvidence(line);
    const id = `S${index + 1}`;
    const item: EvidenceItem = {
      id,
      content: line.replace(/^"(.+)"$/, "$1"),
      label: "",
      provenance: "User-provided safe sample packet; not stored",
      details: {
        Source: "Pasted sample text",
        Review: "Human review required before real-world use",
      },
      ...classification,
    };
    return { ...item, label: labelFor(item) };
  });

  const evidenceFor = (requirementId: string) =>
    evidence.filter((item) => item.requirementIds.includes(requirementId));

  const requirements: Requirement[] = [
    {
      id: "R1",
      label: "Activities delivered",
      prompt: "What activities were delivered during the reporting period?",
      limit: "Maximum 80 words",
      evidenceIds: evidenceFor("R1").map((item) => item.id),
      status: evidenceFor("R1").length ? "supported" : "partial_requires_review",
      summary: evidenceFor("R1").length
        ? "Activity evidence is present for a draft section."
        : "No activity evidence was detected in the sample packet.",
    },
    {
      id: "R2",
      label: "Participation and attendance",
      prompt: "Who participated, and what was attendance?",
      limit: "Maximum 70 words",
      evidenceIds: evidenceFor("R2").map((item) => item.id),
      status: evidenceFor("R2").length ? "supported" : "partial_requires_review",
      summary: evidenceFor("R2").length
        ? "Participation evidence is present for a draft section."
        : "No participation evidence was detected in the sample packet.",
    },
    {
      id: "R3",
      label: "Measured progress",
      prompt: "What progress can you demonstrate without overstating impact?",
      limit: "Maximum 110 words",
      evidenceIds: evidenceFor("R3").map((item) => item.id),
      status: evidenceFor("R3").some((item) => item.status === "accepted")
        ? "supported_with_caveat"
        : "partial_requires_review",
      summary: evidenceFor("R3").length
        ? "Progress language requires caveats and unsupported claims stay blocked."
        : "No measured progress evidence was detected in the sample packet.",
    },
    {
      id: "R4",
      label: "Experience and improvement",
      prompt: "What did people report, and what will improve next?",
      limit: "Maximum 100 words",
      evidenceIds: evidenceFor("R4").map((item) => item.id),
      status: "partial_requires_review",
      summary: evidenceFor("R4").length
        ? "Observation, quote, or improvement evidence needs human review."
        : "No experience or improvement evidence was detected in the sample packet.",
    },
  ];

  const claims = evidence.map<Claim>((item, index) => {
    const blocked = item.status === "flagged" || item.status === "rejected";
    const warning = Boolean(item.warning) || item.status === "accepted_as_observation";

    return {
      id: `SC${index + 1}`,
      requirementId: item.requirementIds[0] ?? "R4",
      text: blocked
        ? item.content
        : `${item.content}${item.warning ? " This should be presented with a caveat." : ""}`,
      evidenceIds: [item.id],
      status: blocked ? "blocked" : warning ? "warning" : "verified",
      finding: blocked
        ? "Blocked from clean export until stronger evidence exists."
        : warning
          ? "Needs human review or caveat before export."
          : "Candidate claim is supported by this sample evidence.",
    };
  });

  return {
    projectBrief: brief,
    requirements,
    evidence,
    claims,
    exportTitle: brief.reportTitle,
  };
}

export function buildMarkdownExportFromDataset(dataset: ReportDataset) {
  const exportableClaims = dataset.claims.filter(
    (claim) => claim.status !== "blocked",
  );
  const blockedClaims = dataset.claims.filter(
    (claim) => claim.status === "blocked",
  );

  return `# ${dataset.exportTitle}

## Reviewed Draft

${exportableClaims
  .map((claim) => `${claim.text} [${claim.evidenceIds.join(", ")}]`)
  .join("\n\n")}

## Unresolved Warnings

${dataset.claims
  .filter((claim) => claim.status === "warning")
  .map((claim) => `- ${claim.id}: ${claim.finding}`)
  .join("\n")}
${blockedClaims.length ? `- ${blockedClaims.length} blocked claim excluded from clean export.` : ""}

## Evidence Appendix

${dataset.evidence
  .filter((item) => item.status !== "flagged" && item.status !== "rejected")
  .map((item) => `- ${item.id}: ${item.content}`)
  .join("\n")}
`;
}
