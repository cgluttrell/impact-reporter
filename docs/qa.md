# QA Checklist

Run before public visibility or hosted deployment:

```bash
pnpm install
pnpm qa
```

`pnpm qa` runs:

- verifier and live-route unit tests
- ESLint
- TypeScript typecheck
- production build
- Playwright desktop/mobile workflow test
- axe accessibility smoke test

Manual visual QA:

- Open desktop width around 1440px.
- Open mobile width around 390px.
- Confirm no text overlap.
- Confirm the four-step navigation works.
- Confirm E8 remains blocked.
- Confirm Markdown export includes warnings and evidence appendix.
- Confirm `/api/extract` and `/api/draft` return `no_key` without server env.

Public release blockers:

- real or confidential data appears anywhere
- API key is exposed client-side
- unsupported confidence/grades claim appears as measured impact
- export omits unresolved warnings
- serious/critical accessibility issue remains
- README instructions fail from a fresh checkout
