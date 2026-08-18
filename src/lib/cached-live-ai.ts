import { samplePacketText } from "./sample-workflow";

export const CACHED_SAMPLE_SOURCE_ARTIFACT_ID = "pasted-sample-packet";
export const CACHED_SAMPLE_MODEL = "cached-synthetic-v1";

export function normalizeCachedSampleInput(value: string) {
  return value.trim().replace(/\r\n/g, "\n");
}

export function isCachedSampleRequest(input: {
  sourceArtifactId: string;
  note: string;
}) {
  return (
    input.sourceArtifactId === CACHED_SAMPLE_SOURCE_ARTIFACT_ID &&
    normalizeCachedSampleInput(input.note) ===
      normalizeCachedSampleInput(samplePacketText)
  );
}

export function cachedEvidenceExtractionResponse() {
  return Response.json({
    mode: "live",
    status: "cached_default",
    model: CACHED_SAMPLE_MODEL,
    source: "committed-cache",
    message:
      "Serving cached output for the fixed synthetic sample. No OpenAI API call was made.",
    response: {
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                sourceArtifactId: CACHED_SAMPLE_SOURCE_ARTIFACT_ID,
                candidates: [
                  {
                    candidateKey: "sample-attendance",
                    evidenceType: "metric",
                    sourceExcerpt:
                      "12 residents attended at least one workshop; 4 workshops were delivered; average attendance was 9 residents per workshop.",
                    claimClass: "output",
                    periodRef: "2026-04-01 through 2026-04-30",
                    proposedValue: 12,
                    proposedUnit: "residents attended at least one workshop",
                    ambiguities: [
                      "Average attendance should be checked against session-level records before external use.",
                    ],
                    requiresHumanConfirmation: true,
                  },
                  {
                    candidateKey: "sample-activities",
                    evidenceType: "event",
                    sourceExcerpt:
                      "Participants completed seed-starting, soil testing, and container-garden planning activities.",
                    claimClass: "output",
                    periodRef: "2026-04-01 through 2026-04-30",
                    proposedValue: null,
                    proposedUnit: null,
                    ambiguities: [],
                    requiresHumanConfirmation: true,
                  },
                  {
                    candidateKey: "sample-survey-outcome",
                    evidenceType: "outcome_measure",
                    sourceExcerpt:
                      "8 of 10 survey respondents said they could identify two soil-health practices after the workshop.",
                    claimClass: "outcome",
                    periodRef: "2026-04-01 through 2026-04-30",
                    proposedValue: 8,
                    proposedUnit: "survey respondents",
                    ambiguities: [
                      "Descriptive survey result only; it does not establish causation.",
                      "The denominator is respondents, not all participants.",
                    ],
                    requiresHumanConfirmation: true,
                  },
                  {
                    candidateKey: "sample-quote",
                    evidenceType: "quote",
                    sourceExcerpt:
                      '"I learned how to test the soil before planting."',
                    claimClass: "anecdotal",
                    periodRef: "2026-04-01 through 2026-04-30",
                    proposedValue: null,
                    proposedUnit: null,
                    ambiguities: [
                      "Consent and attribution must be reviewed before real-world use.",
                    ],
                    requiresHumanConfirmation: true,
                  },
                  {
                    candidateKey: "sample-unsupported-impact",
                    evidenceType: "observation",
                    sourceExcerpt:
                      "The program will improve household food security across the neighborhood.",
                    claimClass: "unknown",
                    periodRef: "2026-04-01 through 2026-04-30",
                    proposedValue: null,
                    proposedUnit: null,
                    ambiguities: [
                      "Future broad impact claim is unsupported by the sample evidence and should be blocked.",
                    ],
                    requiresHumanConfirmation: true,
                  },
                ],
                extractionGaps: [
                  {
                    code: "causal_evidence_missing",
                    message:
                      "The sample packet does not support causal or future community-wide food-security claims.",
                    sourceArtifactId: CACHED_SAMPLE_SOURCE_ARTIFACT_ID,
                  },
                ],
              }),
            },
          ],
        },
      ],
    },
  });
}

export function cachedDraftPackageResponse() {
  return Response.json({
    mode: "live",
    status: "cached_default",
    model: CACHED_SAMPLE_MODEL,
    source: "committed-cache",
    message:
      "Serving cached draft output for the fixed synthetic sample. No OpenAI API call was made.",
    response: {
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                sections: [
                  {
                    requirementId: "R1",
                    status: "drafted",
                    narrative:
                      "Riverbend Neighborhood Center delivered four garden-learning workshops covering seed-starting, soil testing, and container-garden planning.",
                    claims: [
                      {
                        claimKey: "activities-delivered",
                        text: "Participants completed seed-starting, soil testing, and container-garden planning activities.",
                        claimType: "output",
                        evidenceIds: ["S2"],
                        numericAssertions: [],
                        quoteAssertions: [],
                      },
                    ],
                  },
                  {
                    requirementId: "R2",
                    status: "drafted",
                    narrative:
                      "Twelve residents attended at least one workshop, with average attendance reported as nine residents per workshop.",
                    claims: [
                      {
                        claimKey: "attendance-summary",
                        text: "12 residents attended at least one workshop.",
                        claimType: "output",
                        evidenceIds: ["S1"],
                        numericAssertions: [
                          {
                            displayValue: "12 residents",
                            normalizedValue: 12,
                            unit: "residents",
                            evidenceId: "S1",
                            metricField: "value",
                          },
                        ],
                        quoteAssertions: [],
                      },
                    ],
                  },
                  {
                    requirementId: "R3",
                    status: "needs_human_judgment",
                    narrative:
                      "Eight of ten survey respondents said they could identify two soil-health practices after the workshop. This should be described as self-reported learning progress, not proof of causal impact.",
                    claims: [
                      {
                        claimKey: "soil-health-practices",
                        text: "8 of 10 survey respondents said they could identify two soil-health practices after the workshop.",
                        claimType: "outcome",
                        evidenceIds: ["S3"],
                        numericAssertions: [
                          {
                            displayValue: "8 of 10 survey respondents",
                            normalizedValue: 8,
                            unit: "respondents",
                            evidenceId: "S3",
                            metricField: "numerator",
                          },
                        ],
                        quoteAssertions: [],
                      },
                    ],
                  },
                  {
                    requirementId: "R4",
                    status: "needs_human_judgment",
                    narrative:
                      "One participant said, \"I learned how to test the soil before planting.\" Next cycle, the team plans to add a follow-up check-in and collect before/after gardening confidence ratings.",
                    claims: [
                      {
                        claimKey: "participant-quote",
                        text: "I learned how to test the soil before planting.",
                        claimType: "anecdotal",
                        evidenceIds: ["S4"],
                        numericAssertions: [],
                        quoteAssertions: [
                          {
                            quotedText:
                              "I learned how to test the soil before planting.",
                            evidenceId: "S4",
                          },
                        ],
                      },
                    ],
                  },
                ],
                gaps: [
                  {
                    requirementId: "R3",
                    category: "missing_measurement_context",
                    message:
                      "The packet does not support the claim that the program will improve household food security across the neighborhood.",
                  },
                ],
              }),
            },
          ],
        },
      ],
    },
  });
}
