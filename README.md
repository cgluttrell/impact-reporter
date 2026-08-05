# Impact Reporter

Impact Reporter is a public-safe demo workbench for evidence-linked nonprofit
progress reporting.

The narrow product promise:

> Draft what you can prove. Flag what you cannot.

The demo uses a fully synthetic program, Neighborhood Learning Lab, to show a
four-step reporting workflow:

1. Define the report brief.
2. Confirm the evidence ledger.
3. Review coverage and draft evidence-linked claims.
4. Approve, export, and keep unresolved warnings visible.

## Current Status

This repository is in early Build for Good implementation. The first committed
state is a governed scaffold. After this bootstrap, all changes must use the
task/issue/branch/PR/QA/Chris-merge workflow.

## Data Boundary

Use synthetic data only.

Do not enter real nonprofit, beneficiary, client, student, health, education,
financial, grant, regulated, confidential, or personal data into this project.
The demo is not a compliance product, audit tool, funder-submission system, or
proof of real-world impact.

## Demo Modes

- Static demo mode: no OpenAI key required. Uses the Neighborhood Learning Lab
  fixture and precomputed draft/verification states.
- Optional live mode: planned later. Any model calls must run server-side, use
  structured outputs, set `store: false`, and preserve deterministic verifier
  authority.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Additional verifier, fixture, accessibility, and Playwright tests will be added
as the static vertical slice lands.

## Documentation

- [User guide](docs/user-guide.md)
- [Architecture](docs/architecture.md)
- [Demo walkthrough](docs/demo-walkthrough.md)
- [Verifier contract](docs/verifier-contract.md)
- [Privacy and safety](docs/privacy-and-safety.md)
- [Contributing](docs/contributing.md)
- [Deployment runbook](docs/deployment.md)
- [QA checklist](docs/qa.md)
- [Submission draft](docs/submission-draft.md)

## Project Management

Mission Control is the internal system of record. GitHub issues provide repo
traceability once code work begins:

- T1737 / Issue #1: governed repo bootstrap
- T1738 / Issue #2: static demo vertical slice
- T1739 / Issue #3: verifier and fixture test suite
- T1740 / Issue #4: optional live OpenAI route
- T1741 / Issue #5: public docs, QA, deployment, and submission package
