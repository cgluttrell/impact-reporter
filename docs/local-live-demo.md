# Local Live-AI Demo Runbook

Use this runbook to record a local Impact Reporter demo with optional live AI.
This is for local video capture only. Do not enable hosted live AI from this
runbook.

## Boundary

- Use synthetic demo data only.
- Do not paste real nonprofit, beneficiary, client, student, health, education,
  financial, grant, regulated, confidential, or personal data.
- Do not commit `.env.local`, API keys, terminal output that includes secrets,
  or screenshots that reveal secrets.
- Keep the public hosted site in static mode unless a separate production-live
  approval happens.
- The browser never needs the OpenAI key. The key belongs only in the local
  server environment.

## One-Time Local Setup

Install dependencies from the repo root:

```bash
pnpm install
```

Create a local environment file. Use a real key only on the right-hand side of
`OPENAI_API_KEY`; never paste the real key into docs, chat, screenshots, or
source control.

```bash
cat > .env.local <<'EOF'
IMPACT_REPORTER_LIVE_AI=enabled
OPENAI_API_KEY=replace-with-local-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
IMPACT_REPORTER_DEMO_MODE=static
EOF
```

Before recording, confirm `.env.local` is ignored:

```bash
git status --short --ignored .env.local
```

Expected result: `.env.local` appears as ignored, not staged.

## Static Rehearsal

Run the normal QA suite first:

```bash
pnpm qa
```

Run the app without live AI, or temporarily remove the live env values, and
verify the static path:

```bash
pnpm dev
```

Open `http://localhost:3000`.

Checks:

- The preloaded walkthrough opens from the first screen.
- The optional pasted packet starts empty.
- The pasted-packet analysis probes `/api/extract`.
- Static mode shows the fallback status instead of silently pretending live AI is
  running.
- The Evidence ledger, Coverage and draft, Human review, and Export steps all
  remain usable.
- The unsupported confidence/grades claim remains blocked.

## Live Readiness Check

With `.env.local` present, start the local server:

```bash
pnpm dev
```

Check the extraction route from another terminal:

```bash
curl -s http://localhost:3000/api/extract
```

Expected live-ready shape:

```json
{
  "mode": "live",
  "status": "ready",
  "message": "Live AI is configured for POST requests.",
  "model": "gpt-4.1-mini"
}
```

If the result says `live_disabled`, `IMPACT_REPORTER_LIVE_AI` is missing or not
set to `enabled`.

If the result says `missing_key`, the server cannot see `OPENAI_API_KEY`.

If the browser still shows static fallback after the route is live-ready, refresh
the page and retry the pasted-packet flow.

## Live Smoke

Use the synthetic packet in
[`demo-live-synthetic-packet.md`](demo-live-synthetic-packet.md).

In the app:

1. Open the Report brief step.
2. Paste the packet into the optional sample input.
3. Click Analyze pasted packet.
4. Confirm the route status reports live route availability or a controlled
   fallback.
5. Continue through Evidence ledger, Coverage and draft, Human review, and
   Export.
6. Confirm blocked claims remain blocked and warnings remain visible.

Do not chase perfect model output during recording. The product point is the
guarded workflow: AI can propose evidence, but deterministic review and human
approval control the draft.

## Cost Guard

The default model is `gpt-4.1-mini`. A normal synthetic demo run should be in
the pennies range. Use a small project budget cap before live testing.

Recommended local test budget:

- Start with a project spend limit of 5 USD.
- Record one clean take after one or two smoke runs.
- Stop the local server after recording.
- Remove or rotate the key if it was exposed in any recording, terminal history,
  screenshot, or shared note.

## Recording Setup

Use a clean browser profile or private window with no visible bookmarks,
accounts, email, calendar, or secret-bearing tabs.

Suggested viewport:

```text
Desktop: 1440 x 1000
Zoom: 100 percent
Local URL: http://localhost:3000
```

Keep terminal windows out of the recorded area. If a terminal must be visible,
show only harmless commands and no environment values.

## Stop Condition

Stop and use the static demo path if:

- route readiness is not `mode: live` and `status: ready`
- the API key appears anywhere on screen
- model output includes unsafe or confusing claims
- any real or confidential data is accidentally pasted
- the local flow looks less trustworthy than the static walkthrough

