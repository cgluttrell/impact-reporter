import { describe, expect, it } from "vitest";
import {
  checkAttendanceAverage,
  checkOutcomeDelta,
  checkQuote,
  hasBlockingFindings,
  verifyClaims,
} from "./verifier";
import { claims, evidence, requirements } from "./demo-data";

describe("verifier arithmetic rules", () => {
  it("passes the attendance average when the denominator and recomputation match", () => {
    const finding = checkAttendanceAverage({
      attendances: 246,
      deliveredSessions: 15,
      displayedAverage: 16.4,
    });

    expect(finding).toMatchObject({
      code: "attendance.average_recomputes",
      severity: "pass",
      blocking: false,
    });
  });

  it("blocks attendance average without a denominator", () => {
    const finding = checkAttendanceAverage({
      attendances: 246,
      deliveredSessions: null,
      displayedAverage: 16.4,
    });

    expect(finding).toMatchObject({
      code: "attendance.denominator_present",
      severity: "block",
      blocking: true,
    });
  });

  it("blocks wrong attendance arithmetic", () => {
    const finding = checkAttendanceAverage({
      attendances: 246,
      deliveredSessions: 15,
      displayedAverage: 18,
    });

    expect(finding).toMatchObject({
      code: "attendance.average_recomputes",
      severity: "block",
      blocking: true,
    });
  });

  it("passes the known outcome delta while preserving scope caveat", () => {
    const findings = checkOutcomeDelta({
      baseline: 61,
      followUp: 74,
      targetChange: 10,
      displayedDelta: 13,
      matchedSample: 18,
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "outcome.delta_recomputes",
          severity: "pass",
        }),
        expect.objectContaining({
          code: "outcome.scope_caveat",
          severity: "warning",
        }),
      ]),
    );
  });

  it("blocks outcome claims without a matched sample", () => {
    const findings = checkOutcomeDelta({
      baseline: 61,
      followUp: 74,
      targetChange: 10,
      displayedDelta: 13,
      matchedSample: null,
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "outcome.matched_sample_present",
          severity: "block",
          blocking: true,
        }),
      ]),
    );
  });
});

describe("verifier quote rules", () => {
  const quoteEvidence = evidence.find((item) => item.id === "E7");

  it("passes exact quote text with approved synthetic consent", () => {
    expect(quoteEvidence).toBeDefined();

    const findings = checkQuote({
      evidence: quoteEvidence!,
      quotedText: "The reading games made practice feel less intimidating.",
    });

    expect(hasBlockingFindings(findings)).toBe(false);
  });

  it("blocks quote mismatch", () => {
    expect(quoteEvidence).toBeDefined();

    const findings = checkQuote({
      evidence: quoteEvidence!,
      quotedText: "Reading games made practice less intimidating.",
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "quote.exact_match",
          severity: "block",
        }),
      ]),
    );
  });

  it("blocks missing quote consent", () => {
    expect(quoteEvidence).toBeDefined();

    const findings = checkQuote({
      evidence: {
        ...quoteEvidence!,
        details: { ...quoteEvidence!.details, Consent: "unknown" },
      },
      quotedText: "The reading games made practice feel less intimidating.",
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "quote.consent_status",
          severity: "block",
        }),
      ]),
    );
  });
});

describe("verifier claim integrity rules", () => {
  it("blocks the known unsupported confidence and future-grade claim", () => {
    const findings = verifyClaims({ claims, evidence, requirements });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "causal_language_requires_support",
          entityId: "C6",
          severity: "block",
        }),
        expect.objectContaining({
          code: "unsupported_claim.no_evidence",
          entityId: "C6",
          severity: "block",
        }),
      ]),
    );
  });

  it("blocks missing evidence IDs", () => {
    const findings = verifyClaims({
      claims: [
        {
          id: "C-missing",
          requirementId: "R1",
          text: "This claim cites a missing evidence item.",
          evidenceIds: ["E404"],
          status: "verified",
          finding: "Should fail.",
        },
      ],
      evidence,
      requirements,
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "claim.evidence_id_exists",
          severity: "block",
        }),
      ]),
    );
  });

  it("blocks claims with no evidence IDs", () => {
    const findings = verifyClaims({
      claims: [
        {
          id: "C-empty",
          requirementId: "R1",
          text: "This claim has no evidence.",
          evidenceIds: [],
          status: "verified",
          finding: "Should fail.",
        },
      ],
      evidence,
      requirements,
    });

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "claim.evidence_required",
          severity: "block",
        }),
      ]),
    );
  });
});
