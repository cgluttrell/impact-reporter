# Deployment Runbook

Impact Reporter is not public yet.

The recommended first deployment target is Cloudflare because LIW already uses
that account and this repo now includes the official OpenNext Cloudflare adapter
configuration for deploying Next.js to Cloudflare Workers with Workers Assets.
Vercel remains a fallback if Cloudflare setup creates unexpected friction.

## Required gates before public deployment

- Chris approves the deployment target and public URL.
- All PRs in the implementation stack are merged.
- `pnpm qa` passes from a clean checkout.
- Secret/path audit passes.
- README and safety docs match the deployed behavior.
- Static demo mode is confirmed to work without `OPENAI_API_KEY`.
- Public hosted live model calls remain disabled unless Chris explicitly
  approves enabling them.
- Hosted live model calls require both `IMPACT_REPORTER_LIVE_AI=enabled` and a
  server-side `OPENAI_API_KEY`.

## Vercel outline

1. Connect `cgluttrell/impact-reporter`.
2. Use the default Next.js framework settings.
3. Set no production `OPENAI_API_KEY` for the first public static demo.
4. Set `IMPACT_REPORTER_DEMO_MODE=static`.
5. Deploy.
6. Run the browser QA checklist against the production URL.
7. Capture desktop and mobile screenshots.
8. Record the approved URL in Mission Control.

## Cloudflare Workers outline

Use Cloudflare's current Next.js path: OpenNext for Cloudflare on Workers with
Workers Assets. Do not use the deprecated `next-on-pages` package.

1. Connect `cgluttrell/impact-reporter` in Cloudflare Workers/Pages builds or
   deploy from an authenticated local shell.
2. Keep the first public demo static/no-key by leaving
   `IMPACT_REPORTER_LIVE_AI` unset and `OPENAI_API_KEY` unset.
3. Use the repo's checked-in `wrangler.jsonc`, `open-next.config.ts`, and the
   branded custom domain `impact-reporter.luttrell.works`.
4. Deploy only after `pnpm qa` and `pnpm preview` pass.
5. Use `pnpm run deploy` for an authenticated CLI deploy, or configure
   Cloudflare's build/deploy flow to run the equivalent OpenNext Cloudflare
   deploy command.
6. Run the browser QA checklist against the production URL.
7. Capture desktop and mobile screenshots.
8. Record the approved URL in Mission Control.

## GitHub Actions deploy automation

The repo includes `.github/workflows/cloudflare-deploy.yml` so deployment can be
driven by GitHub after merges instead of a local Wrangler OAuth session.

The workflow has two gates:

- Pull requests and `main` pushes run `pnpm qa`, `opennextjs-cloudflare build`,
  and `wrangler deploy --dry-run`.
- Publishing runs only on `main` or manual dispatch, only when
  `CLOUDFLARE_DEPLOY_ENABLED` is set to `true`, and targets
  `https://impact-reporter.luttrell.works/`.

Required GitHub repository settings before automatic publish:

1. Secret: `CLOUDFLARE_API_TOKEN`
   - Use a Cloudflare API token scoped to the account and Worker.
   - Grant only the minimum Workers edit/deploy permissions needed for
     `impact-reporter`.
   - Do not use the broad local Wrangler OAuth token for CI.
2. Secret: `CLOUDFLARE_ACCOUNT_ID`
   - Use the Cloudflare account ID for the LIW account.
3. Variable: `CLOUDFLARE_DEPLOY_ENABLED`
   - Set to `true` only after the token and account ID are in place.

The automation does not set `OPENAI_API_KEY`, `OPENAI_MODEL`, or
`IMPACT_REPORTER_LIVE_AI`. Live AI stays controlled by Cloudflare Worker
environment configuration and still requires Chris's explicit approval.

## Enabling hosted live AI later

Do not enable hosted live AI until Chris explicitly approves the data boundary,
model, and deployment window.

When approved:

1. Keep real nonprofit, participant, student, client, financial, regulated, and
   confidential data out of the public pilot until a production data policy is
   approved.
2. Set `IMPACT_REPORTER_LIVE_AI=enabled` as a server-side deployment variable.
3. Set `OPENAI_API_KEY` as a Cloudflare secret, not in source control.
4. Optionally set `OPENAI_MODEL` server-side.
5. Redeploy, then verify `/api/extract` and `/api/draft` with synthetic sample
   input only.
6. Confirm responses remain structured and verifier review remains authoritative.

## Current environment note

This machine did not have `vercel`, `cloudflare`, or `wrangler` CLI available
when T1741 was prepared, so no hosted deployment was performed in that pass.
T1742 added Cloudflare config and `wrangler` as a project devDependency; account
authentication is still required before a hosted deploy can be performed.
