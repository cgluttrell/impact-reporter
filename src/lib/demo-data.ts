export type EvidenceStatus =
  | "accepted"
  | "accepted_as_observation"
  | "flagged"
  | "rejected";

export type EvidenceKind =
  | "attendance_metric"
  | "outcome_metric"
  | "facilitator_note"
  | "approved_quote"
  | "unsupported_observation"
  | "improvement_note";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  label: string;
  content: string;
  status: EvidenceStatus;
  supportClass: "output" | "outcome" | "observation" | "quote" | "unsupported";
  requirementIds: string[];
  provenance: string;
  warning?: string;
  details?: Record<string, string>;
};

export type Requirement = {
  id: string;
  label: string;
  prompt: string;
  limit: string;
  status: "supported" | "supported_with_caveat" | "partial_requires_review";
  evidenceIds: string[];
  summary: string;
};

export type Claim = {
  id: string;
  requirementId: string;
  text: string;
  evidenceIds: string[];
  status: "verified" | "warning" | "blocked";
  finding: string;
};

export const projectBrief = {
  programName: "Neighborhood Learning Lab",
  organizationName: "Harborlight Community Learning",
  reportTitle: "Winter Learning Lab Progress Update",
  reportingPeriod: "2026-01-12 through 2026-03-06",
  funderName: "Community Learning Catalyst Fund",
};

export const requirements: Requirement[] = [
  {
    id: "R1",
    label: "Activities delivered",
    prompt: "What activities were delivered during the reporting period?",
    limit: "Maximum 80 words",
    status: "supported",
    evidenceIds: ["E2", "E5"],
    summary:
      "Delivered-session count and activity notes support the activities section.",
  },
  {
    id: "R2",
    label: "Participation and attendance",
    prompt: "Who participated, and what was attendance?",
    limit: "Maximum 70 words",
    status: "supported",
    evidenceIds: ["E1"],
    summary:
      "Enrollment, attendance denominator, and participant-session totals are present.",
  },
  {
    id: "R3",
    label: "Measured progress",
    prompt:
      "What progress toward the reading-comprehension target can you demonstrate?",
    limit: "Maximum 110 words",
    status: "supported_with_caveat",
    evidenceIds: ["E3", "E4"],
    summary:
      "Matched pre/post results support descriptive progress, not causal impact.",
  },
  {
    id: "R4",
    label: "Experience and improvement",
    prompt:
      "What did participants or facilitators report, and what will you improve next period?",
    limit: "Maximum 100 words",
    status: "partial_requires_review",
    evidenceIds: ["E6", "E7", "E9"],
    summary:
      "Quote, observation, and improvement action are present, but human review remains required.",
  },
];

export const evidence: EvidenceItem[] = [
  {
    id: "E1",
    kind: "attendance_metric",
    label: "Attendance summary",
    content:
      "22 students enrolled; 20 attended at least once; 15 delivered sessions; 246 participant-session attendances; average attendance was 16.4 participants per delivered session.",
    status: "accepted",
    supportClass: "output",
    requirementIds: ["R2"],
    provenance: "Structured attendance fixture",
    details: {
      Period: projectBrief.reportingPeriod,
      Denominator: "15 delivered sessions",
      Calculation: "246 / 15 = 16.4",
    },
  },
  {
    id: "E2",
    kind: "attendance_metric",
    label: "Sessions delivered",
    content: "15 of 16 scheduled sessions were delivered.",
    status: "accepted",
    supportClass: "output",
    requirementIds: ["R1"],
    provenance: "Session log summary",
    details: {
      Scheduled: "16",
      Delivered: "15",
      Exception: "One fictional weather closure",
    },
  },
  {
    id: "E3",
    kind: "outcome_metric",
    label: "Matched reading check",
    content:
      "Among 18 participants with matched pre/post checks, mean score increased from 61% to 74%, a 13 percentage-point increase against a 10-point target.",
    status: "accepted",
    supportClass: "outcome",
    requirementIds: ["R3"],
    provenance: "Synthetic matched pre/post outcome fixture",
    warning: "Descriptive progress only; this does not establish causation.",
    details: {
      MatchedSample: "18 participants",
      Baseline: "61%",
      FollowUp: "74%",
      Calculation: "74 - 61 = 13 percentage points",
      Target: "10 percentage points",
    },
  },
  {
    id: "E4",
    kind: "outcome_metric",
    label: "Participant-level change summary",
    content:
      "14 of 18 matched participants improved by at least 5 points; 3 were unchanged within tolerance; 1 declined.",
    status: "accepted",
    supportClass: "outcome",
    requirementIds: ["R3"],
    provenance: "Derived synthetic participant-level fixture",
    warning: "Do not generalize to all enrolled students.",
  },
  {
    id: "E5",
    kind: "facilitator_note",
    label: "Activity note",
    content:
      "Facilitators recorded vocabulary sorting and paired read-aloud exercises throughout the delivered sessions.",
    status: "accepted",
    supportClass: "output",
    requirementIds: ["R1"],
    provenance: "Dated synthetic facilitator notes",
  },
  {
    id: "E6",
    kind: "facilitator_note",
    label: "Volunteer observation",
    content:
      "The team observed that several students volunteered answers more readily during the final two sessions. No confidence survey or pre/post participation measure was collected.",
    status: "accepted_as_observation",
    supportClass: "observation",
    requirementIds: ["R4"],
    provenance: "Synthetic facilitator notes",
    warning: "Observation only. Not a measured confidence outcome.",
  },
  {
    id: "E7",
    kind: "approved_quote",
    label: "Approved synthetic quote",
    content: "The reading games made practice feel less intimidating.",
    status: "accepted",
    supportClass: "quote",
    requirementIds: ["R4"],
    provenance: "Synthetic participant quote; consent approved for demo use",
    details: {
      Speaker: "Synthetic participant, age 10",
      Consent: "approved_for_synthetic_demo",
    },
  },
  {
    id: "E8",
    kind: "unsupported_observation",
    label: "Unsupported impact claim",
    content:
      "The program increased students' confidence and will improve their grades at school.",
    status: "flagged",
    supportClass: "unsupported",
    requirementIds: ["R3", "R4"],
    provenance: "Tempting unsupported statement from synthetic packet",
    warning:
      "Blocked: no confidence measure, school-grade data, comparison group, or attribution evidence exists.",
  },
  {
    id: "E9",
    kind: "improvement_note",
    label: "Next-period improvement",
    content:
      "Next period, add a two-question participation check-in at the first and final session and record cancellation reasons in the session log.",
    status: "accepted",
    supportClass: "observation",
    requirementIds: ["R4"],
    provenance: "Synthetic improvement note",
  },
];

export const claims: Claim[] = [
  {
    id: "C1",
    requirementId: "R1",
    text: "15 of 16 scheduled sessions were delivered, using vocabulary sorting and paired read-aloud exercises.",
    evidenceIds: ["E2", "E5"],
    status: "verified",
    finding: "Supported by accepted session and activity evidence.",
  },
  {
    id: "C2",
    requirementId: "R2",
    text: "20 of 22 enrolled students attended at least once, and delivered sessions averaged 16.4 participants.",
    evidenceIds: ["E1"],
    status: "verified",
    finding: "Attendance denominator and average recomputation are present.",
  },
  {
    id: "C3",
    requirementId: "R3",
    text: "The matched sample increased from 61% to 74%, exceeding the 10-point target.",
    evidenceIds: ["E3", "E4"],
    status: "warning",
    finding:
      "Supported as descriptive progress with matched sample caveat; not causal impact.",
  },
  {
    id: "C4",
    requirementId: "R4",
    text: "A participant said the reading games made practice feel less intimidating.",
    evidenceIds: ["E7"],
    status: "verified",
    finding: "Quote text matches accepted quote with synthetic-demo consent.",
  },
  {
    id: "C5",
    requirementId: "R4",
    text: "Facilitators observed more volunteering, but no confidence measure was collected.",
    evidenceIds: ["E6"],
    status: "warning",
    finding: "Observation is allowed only when labeled as observation.",
  },
  {
    id: "C6",
    requirementId: "R3",
    text: "The program increased students' confidence and will improve grades.",
    evidenceIds: ["E8"],
    status: "blocked",
    finding:
      "Blocked from clean export: unsupported confidence and future-grade claims.",
  },
];

export function buildMarkdownExport() {
  return `# Winter Learning Lab Progress Update

## Reviewed Draft

15 of 16 scheduled sessions were delivered, using vocabulary sorting and paired read-aloud exercises. [E2, E5]

20 of 22 enrolled students attended at least once, and delivered sessions averaged 16.4 participants. [E1]

Among 18 participants with matched pre/post checks, the mean score increased from 61% to 74%, exceeding the 10-point target. This is descriptive progress for the matched sample, not proof of causal impact. [E3, E4]

A participant said, "The reading games made practice feel less intimidating." Facilitators observed more volunteering, but no confidence measure was collected. [E7, E6]

## Unresolved Warnings

- R3 is supported with caveat: do not generalize to all enrolled students or claim causation.
- R4 requires human review because the confidence observation is not a measured outcome.
- Blocked claim excluded: "The program increased students' confidence and will improve grades."

## Evidence Appendix

${evidence
  .filter((item) => item.id !== "E8")
  .map((item) => `- ${item.id}: ${item.content}`)
  .join("\n")}
`;
}
