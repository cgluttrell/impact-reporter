# Build for Good Submission Draft

Status: draft. Do not submit until reviewed and approved by the project
maintainer.

## Short description

Impact Reporter helps small nonprofit and education teams draft funder progress
reports from the evidence they actually have. The current hosted pilot uses a
synthetic evidence packet to demonstrate the product promise: traceable report
drafting, visible support gaps, blocked unsupported claims, and human review
before export.

## What the hosted pilot shows

- A four-step reporting workflow.
- A synthetic Neighborhood Learning Lab fixture.
- Evidence ledger confirmation before drafting.
- Requirement coverage status.
- Claim-level evidence inspection.
- Deterministic checks for evidence IDs, blocked claims, caveats, and export
  eligibility.
- A blocked claim that tries to overstate student confidence and future grades.
- Markdown export with warnings and an evidence appendix.

## Responsible AI framing

The model may propose evidence and language. Deterministic code verifies
references, blocked claims, warnings, and export eligibility. A human remains
responsible for approving the final report.

## Current pilot boundary

The hosted version uses synthetic data only. It is not a compliance product,
audit tool, grant-management system, funder-submission service, or proof of
real-world impact.

## Next MVP slice

The next product step is controlled bring-your-own sample evidence input, not
user logins. A user should be able to paste or load a small non-confidential
packet, extract candidate evidence, run verifier checks, inspect claims, and
export a reviewed Markdown report without creating an account or storing data.
