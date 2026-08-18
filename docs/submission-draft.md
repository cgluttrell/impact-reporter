# Build for Good Submission Draft

Status: draft. Do not submit until reviewed and approved by the project
maintainer.

Source checked: OpenAI Build Week public Devpost page and rules on
2026-08-18. The logged-in "Enter a Submission" page redirects to Devpost
registration without Chris's account session, so this draft is reconciled
against the published submission requirements rather than private form widget
labels.

## Form-ready fields

Project name: Impact Reporter

Recommended category: Education

Project URL / live demo: https://impact-reporter.luttrell.works/

Code repository: https://github.com/cgluttrell/impact-reporter

License: MIT

Demo video: TODO - public YouTube URL, under 3 minutes, with voiceover covering
what was built and how Codex/GPT-5.6 were used.

Codex feedback session ID: TODO - Chris must provide the `/feedback` Codex
session ID for the thread where the majority of core functionality was built.

README requirement: satisfied. The README includes setup instructions, the live
demo link, sample-data boundary, verification commands, and a "How Codex
Helped" section consistent with this draft.

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

## Project description

Impact Reporter is a safer reporting assistant for small nonprofit and
education teams. It starts from a synthetic community-program evidence packet,
turns the packet into a visible evidence ledger, checks candidate report claims
against the evidence, blocks unsupported impact language, and exports a Markdown
draft only after human review is recorded.

The hosted demo proves the product's trust workflow: evidence before prose,
claim-level inspection before export, and deterministic verification around the
places where AI-written reports usually become risky. Instead of making weak
notes sound more confident, Impact Reporter shows which claims are supported,
which need caveats, and which should stay out of the report.

The current build also includes a safe sample-packet path for non-confidential
rehearsal input. Live AI routes exist only as guarded server-side helpers and
remain disabled in the public hosted pilot unless separately approved and
configured.

## How Codex and GPT-5.6 were used

Codex was the implementation agent for the project. It scaffolded the
Next.js/Cloudflare Worker app, implemented the evidence-led workflow, added the
deterministic verifier and sample workflow parsing, wrote Vitest and Playwright
coverage, prepared deployment documentation, and helped iterate through product
and QA review feedback in small pull requests.

GPT-5.6/Codex accelerated the build by turning the product requirements into
working code and tests while keeping Chris in the approval loop for scope,
public release, and submission decisions. Key product decisions stayed explicit:
synthetic data only for the hosted pilot, no browser-exposed API key, static mode
as the public default, blocked claims excluded from export, and human review
required before generating a shareable Markdown draft.

## Current pilot boundary

The hosted version uses synthetic data only. It is not a compliance product,
audit tool, grant-management system, funder-submission service, or proof of
real-world impact.

## Next MVP slice

The next product step is broadening the controlled sample-evidence workflow
beyond the checked-in rehearsal packet, not user logins. A user should be able
to bring a small non-confidential packet, inspect and adjust candidate evidence,
run verifier checks, inspect claims, and export a reviewed Markdown report
without creating an account or storing real data.

## Submission readiness notes

- Public repository requirement: satisfied.
- Relevant open-source license requirement: satisfied with MIT.
- README setup/sample-data/run guidance: satisfied.
- Codex/GPT-5.6 usage explanation: present in README and above.
- Demo video requirement: still pending Chris-provided public YouTube URL.
- `/feedback` Codex session ID requirement: still pending Chris-provided ID.
- Final approval/submission: human-only; do not change this draft's status until
  Chris approves it.
