# Deployment Runbook

Impact Reporter is not public yet.

The recommended first deployment target is Vercel because this is a Next.js app.
Cloudflare Pages is acceptable if Chris chooses that hosting path.

## Required gates before public deployment

- Chris approves the deployment target and public URL.
- All PRs in the implementation stack are merged.
- `pnpm qa` passes from a clean checkout.
- Secret/path audit passes.
- README and safety docs match the deployed behavior.
- Static demo mode is confirmed to work without `OPENAI_API_KEY`.
- Public hosted live model calls remain disabled unless Chris explicitly
  approves enabling them.

## Vercel outline

1. Connect `cgluttrell/impact-reporter`.
2. Use the default Next.js framework settings.
3. Set no production `OPENAI_API_KEY` for the first public static demo.
4. Set `IMPACT_REPORTER_DEMO_MODE=static`.
5. Deploy.
6. Run the browser QA checklist against the production URL.
7. Capture desktop and mobile screenshots.
8. Record the approved URL in Mission Control.

## Cloudflare Pages outline

1. Connect `cgluttrell/impact-reporter`.
2. Use the Next.js adapter path Chris approves for this project.
3. Keep the first public demo static/no-key.
4. Deploy only after `pnpm qa` passes.
5. Run the browser QA checklist against the production URL.

## Current environment note

This machine did not have `vercel`, `cloudflare`, or `wrangler` CLI available
when T1741 was prepared, so no hosted deployment was performed in that pass.
