# Architecture

Impact Reporter follows one trust rule:

> AI proposes. Deterministic code verifies. A human approves.

The app is planned as a Next.js application with shared TypeScript/Zod schemas,
synthetic fixtures, deterministic verifier functions, and optional server-side
OpenAI routes.

Model output never becomes verified evidence by itself. Draft claims must cite
accepted evidence IDs, and the verifier owns arithmetic, denominators, quote
exactness, consent, coverage, warnings, blockers, and export eligibility.

## Optional Live Routes

Static demo mode does not need an API key.

Optional live routes are server-side only:

- `POST /api/extract`
- `POST /api/draft`

They validate request shape, enforce a bounded input size, return explicit
static-mode responses such as `live_disabled` or `missing_key` when live AI is
not fully configured, call the OpenAI Responses API only from the server, set
`store: false`, and request strict JSON schema output.

The browser never receives the API key, and model output still must pass the
deterministic verifier before export.
