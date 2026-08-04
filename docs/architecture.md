# Architecture

Impact Reporter follows one trust rule:

> AI proposes. Deterministic code verifies. A human approves.

The app is planned as a Next.js application with shared TypeScript/Zod schemas,
synthetic fixtures, deterministic verifier functions, and optional server-side
OpenAI routes.

Model output never becomes verified evidence by itself. Draft claims must cite
accepted evidence IDs, and the verifier owns arithmetic, denominators, quote
exactness, consent, coverage, warnings, blockers, and export eligibility.
