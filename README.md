# Impact Reporter

Impact Reporter helps nonprofit and education teams turn program notes into
funder-ready report drafts while keeping every claim tied to evidence.

> Draft what you can prove. Flag what you cannot.

Live demo: <https://impact-reporter.luttrell.works/>

## What It Does

The current demo uses a fictional Neighborhood Learning Lab packet to show a
four-step reporting workflow:

1. Review the report brief: program, period, funder, and reporting questions.
2. Inspect the evidence ledger before trusting any draft language.
3. Check evidence-linked claims against the reporting requirements.
4. Record human review and export a Markdown draft with warnings attached.

The key moment is the blocked claim. Impact Reporter refuses to turn weak
evidence into confident-sounding impact language.

## Who It Helps

Impact Reporter is for small teams that need credible reporting but do not have
a dedicated evaluation department:

- nonprofit executive directors preparing board or funder updates
- grants and program managers writing progress reports
- frontline program leads turning messy notes into safer report language
- board reviewers checking whether public claims are defensible
- funders or reviewers who want clearer evidence trails

It is not a compliance product, audit tool, grant-management platform,
evaluation system, or proof of real-world impact. It is a reporting review aid
that helps teams see what their notes support, what needs caveats, and what
should not be claimed yet.

## Demo Modes

- Static demo mode needs no API key. It uses sample data, precomputed evidence,
  deterministic checks, and a Markdown export.
- Optional live AI routes exist server-side for extraction and drafting. They
  stay disabled unless `IMPACT_REPORTER_LIVE_AI=enabled` and a server-side
  `OPENAI_API_KEY` are configured.
- When live AI is disabled or no key is present, the routes return explicit
  static-mode JSON instead of calling a model.

The browser never receives an OpenAI key. Model calls use the OpenAI Responses
API with structured outputs and `store: false`.

## Data Boundary

Use synthetic or non-confidential sample text only.

Do not enter real nonprofit, beneficiary, client, student, health, education,
financial, grant, regulated, confidential, or personal data into the hosted
demo.

## OpenAI Integration

The optional live mode is designed to use OpenAI where it adds product value:
turning raw sample notes into candidate evidence and draft report language. The
trust layer remains deterministic and human-reviewed:

- AI proposes candidate evidence or draft language.
- Code verifies evidence IDs, blocked claims, and export eligibility.
- Human review is required before export.

The public demo can run without a key, so judges and reviewers can evaluate the
workflow safely. Live mode is intentionally guarded for the judging window and
should be enabled only after route-level controls and Cloudflare-level abuse
controls are in place. The checked-in route limiter is a best-effort per-isolate
backstop, not the whole production abuse-control strategy.

## How Codex Helped

Codex was used throughout implementation as the coding agent for the repo work:

- scaffolded the Next.js/Cloudflare Worker app and documentation
- implemented the static evidence-led reporting workflow
- added verifier logic, sample workflow parsing, and live OpenAI route helpers
- wrote and maintained Vitest and Playwright coverage, including accessibility
  checks across desktop and mobile
- opened small pull requests with local and GitHub CI evidence
- incorporated review feedback from product/persona passes into focused code
  changes

Claude/Fable was used as an independent review and critique lane. Codex remained
the implementation path for code, tests, QA, and pull requests.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Verification

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm qa
```

`pnpm qa` runs unit tests, lint, typecheck, production build, and Playwright
tests across the configured desktop and mobile projects.

## Optional Live AI Configuration

Create local environment variables only when testing live server-side routes:

```bash
IMPACT_REPORTER_LIVE_AI=enabled
OPENAI_API_KEY=replace-with-local-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

Do not commit real keys. Hosted live mode should only be enabled with Cloudflare
rate limits, origin controls, and an explicit review of the data boundary.

For local video-demo preparation, use
[`docs/local-live-demo.md`](docs/local-live-demo.md),
[`docs/demo-live-synthetic-packet.md`](docs/demo-live-synthetic-packet.md), and
[`docs/demo-recording-checklist.md`](docs/demo-recording-checklist.md).

## Documentation

- [User guide](docs/user-guide.md)
- [Architecture](docs/architecture.md)
- [Verifier contract](docs/verifier-contract.md)
- [Privacy and safety](docs/privacy-and-safety.md)
- [Demo walkthrough](docs/demo-walkthrough.md)
- [Deployment runbook](docs/deployment.md)
- [QA checklist](docs/qa.md)
- [Submission draft](docs/submission-draft.md)
- [MVP roadmap](docs/mvp-roadmap.md)

## License

MIT
