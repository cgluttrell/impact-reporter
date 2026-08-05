import { Claim, EvidenceItem, Requirement } from "./demo-data";

export type FindingSeverity = "pass" | "warning" | "block";

export type VerificationFinding = {
  code: string;
  severity: FindingSeverity;
  entityId: string;
  message: string;
  blocking: boolean;
};

export function checkAttendanceAverage(input: {
  attendances: number;
  deliveredSessions: number | null;
  displayedAverage: number;
}): VerificationFinding {
  if (!input.deliveredSessions || input.deliveredSessions <= 0) {
    return {
      code: "attendance.denominator_present",
      severity: "block",
      entityId: "E1",
      message: "Attendance average requires delivered-session denominator.",
      blocking: true,
    };
  }

  const recomputed = Number(
    (input.attendances / input.deliveredSessions).toFixed(1),
  );

  if (recomputed !== input.displayedAverage) {
    return {
      code: "attendance.average_recomputes",
      severity: "block",
      entityId: "E1",
      message: `Attendance average mismatch: expected ${recomputed}, got ${input.displayedAverage}.`,
      blocking: true,
    };
  }

  return {
    code: "attendance.average_recomputes",
    severity: "pass",
    entityId: "E1",
    message: "Attendance average recomputes from source values.",
    blocking: false,
  };
}

export function checkOutcomeDelta(input: {
  baseline: number | null;
  followUp: number | null;
  targetChange: number;
  displayedDelta: number;
  matchedSample: number | null;
}): VerificationFinding[] {
  const findings: VerificationFinding[] = [];

  if (!input.matchedSample || input.matchedSample <= 0) {
    findings.push({
      code: "outcome.matched_sample_present",
      severity: "block",
      entityId: "E3",
      message: "Outcome claim requires a matched-sample denominator.",
      blocking: true,
    });
  }

  if (input.baseline === null || input.followUp === null) {
    findings.push({
      code: "outcome.baseline_followup_present",
      severity: "block",
      entityId: "E3",
      message: "Outcome claim requires baseline and follow-up values.",
      blocking: true,
    });
    return findings;
  }

  const delta = input.followUp - input.baseline;
  findings.push({
    code: "outcome.delta_recomputes",
    severity: delta === input.displayedDelta ? "pass" : "block",
    entityId: "E3",
    message:
      delta === input.displayedDelta
        ? "Outcome delta recomputes from baseline and follow-up."
        : `Outcome delta mismatch: expected ${delta}, got ${input.displayedDelta}.`,
    blocking: delta !== input.displayedDelta,
  });

  findings.push({
    code: "outcome.target_comparison",
    severity: delta >= input.targetChange ? "pass" : "warning",
    entityId: "E3",
    message:
      delta >= input.targetChange
        ? "Outcome delta meets or exceeds target."
        : "Outcome delta does not meet target.",
    blocking: false,
  });

  findings.push({
    code: "outcome.scope_caveat",
    severity: "warning",
    entityId: "E3",
    message: "Matched pre/post result is descriptive and not causal evidence.",
    blocking: false,
  });

  return findings;
}

export function checkQuote(input: {
  evidence: EvidenceItem;
  quotedText: string;
}): VerificationFinding[] {
  const findings: VerificationFinding[] = [];
  const consent = input.evidence.details?.Consent;

  findings.push({
    code: "quote.exact_match",
    severity: input.evidence.content === input.quotedText ? "pass" : "block",
    entityId: input.evidence.id,
    message:
      input.evidence.content === input.quotedText
        ? "Quote text matches accepted evidence exactly."
        : "Quote text does not match accepted evidence.",
    blocking: input.evidence.content !== input.quotedText,
  });

  findings.push({
    code: "quote.consent_status",
    severity: consent === "approved_for_synthetic_demo" ? "pass" : "block",
    entityId: input.evidence.id,
    message:
      consent === "approved_for_synthetic_demo"
        ? "Quote has approved synthetic-demo consent."
        : "Quote is missing approved synthetic-demo consent.",
    blocking: consent !== "approved_for_synthetic_demo",
  });

  return findings;
}

export function verifyClaims(input: {
  claims: Claim[];
  evidence: EvidenceItem[];
  requirements: Requirement[];
}): VerificationFinding[] {
  const findings: VerificationFinding[] = [];
  const evidenceById = new Map(input.evidence.map((item) => [item.id, item]));

  for (const requirement of input.requirements) {
    const hasClaim = input.claims.some(
      (claim) => claim.requirementId === requirement.id,
    );
    findings.push({
      code: "required_requirements_have_links",
      severity: hasClaim ? "pass" : "block",
      entityId: requirement.id,
      message: hasClaim
        ? `${requirement.id} has at least one draft claim.`
        : `${requirement.id} has no draft claim.`,
      blocking: !hasClaim,
    });
  }

  for (const claim of input.claims) {
    if (claim.evidenceIds.length === 0) {
      findings.push({
        code: "claim.evidence_required",
        severity: "block",
        entityId: claim.id,
        message: "Exportable claims require at least one evidence ID.",
        blocking: true,
      });
    }

    for (const evidenceId of claim.evidenceIds) {
      const item = evidenceById.get(evidenceId);
      if (!item) {
        findings.push({
          code: "claim.evidence_id_exists",
          severity: "block",
          entityId: claim.id,
          message: `Claim cites missing evidence ID ${evidenceId}.`,
          blocking: true,
        });
        continue;
      }

      if (item.status === "flagged" || item.status === "rejected") {
        findings.push({
          code: "unsupported_claim.no_evidence",
          severity: "block",
          entityId: claim.id,
          message: `Claim cites ${item.id}, which is ${item.status}.`,
          blocking: true,
        });
      }
    }

    const riskyLanguage =
      /increased students'? confidence|will improve (their )?grades/i.test(
        claim.text,
      );
    if (riskyLanguage) {
      findings.push({
        code: "causal_language_requires_support",
        severity: "block",
        entityId: claim.id,
        message:
          "Confidence and future-grade language requires measurement and attribution evidence.",
        blocking: true,
      });
    }

    if (claim.status === "blocked") {
      findings.push({
        code: "claim.blocked_from_clean_export",
        severity: "block",
        entityId: claim.id,
        message: "Blocked claim cannot appear in clean export.",
        blocking: true,
      });
    }
  }

  findings.push({
    code: "human_review_required",
    severity: "warning",
    entityId: "report-nll-2026-winter",
    message: "Final package remains review-required until a human approves it.",
    blocking: false,
  });

  return findings;
}

export function hasBlockingFindings(findings: VerificationFinding[]) {
  return findings.some((finding) => finding.blocking);
}

export function evaluateCleanExportReadiness(input: {
  claims: Claim[];
  evidence: EvidenceItem[];
  requirements: Requirement[];
  humanReviewApproved: boolean;
}) {
  const exportableClaims = input.claims.filter(
    (claim) => claim.status !== "blocked",
  );
  const findings = verifyClaims({
    claims: exportableClaims,
    evidence: input.evidence,
    requirements: input.requirements,
  }).filter((finding) => finding.code !== "human_review_required");

  findings.push({
    code: "clean_export.human_review_approved",
    severity: input.humanReviewApproved ? "pass" : "block",
    entityId: "report-nll-2026-winter",
    message: input.humanReviewApproved
      ? "Human review has been recorded for clean export."
      : "Clean export requires recorded human review.",
    blocking: !input.humanReviewApproved,
  });

  return {
    canExport: !hasBlockingFindings(findings),
    findings,
    exportableClaims,
  };
}
