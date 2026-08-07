# Demo Recording Checklist

Use this checklist for the local video demo. The goal is to show a real product
workflow, not to prove that AI is magic.

## Before Recording

- Confirm the public hosted site is still static/no-key.
- Confirm the local server is the only place live AI is enabled.
- Confirm `.env.local` is ignored by git.
- Confirm no terminal, browser tab, password manager, dashboard, or URL exposes
  an API key.
- Use only [`demo-live-synthetic-packet.md`](demo-live-synthetic-packet.md) or
  the checked-in preloaded sample.
- Run `pnpm qa`.
- Do one unrecorded rehearsal.

## Two-Minute Talk Track

1. Open with the problem:
   "Impact Reporter helps a nonprofit turn messy progress notes into a funder
   report while keeping every claim tied to evidence."
2. Show the first screen:
   "The public version is safe in static mode. For this local recording, the
   extraction route can use live AI with a server-side key, but the workflow
   still requires evidence review."
3. Paste or start the synthetic packet:
   "This is fictional demo data. No real nonprofit or participant data is used."
4. Show route status:
   "The app checks the extraction route before analysis. If live AI is not ready,
   it falls back visibly instead of pretending."
5. Move to Evidence ledger:
   "AI can propose candidates, but the ledger makes source excerpts,
   ambiguities, and warnings visible."
6. Show the blocked claim:
   "This is the trust moment. The system refuses to turn unsupported confidence
   or school-grade language into measured impact."
7. Show Coverage and draft:
   "Draft language must cite accepted evidence. Unsupported claims do not get a
   clean path to export."
8. Show Human review:
   "A person still approves the package. The tool is designed for governed
   drafting, not autopilot reporting."
9. Export:
   "The exported Markdown carries warnings and evidence references forward."

## Click Path

1. Load `http://localhost:3000`.
2. Start with the preloaded walkthrough or paste the synthetic packet.
3. If using pasted packet, click Analyze pasted packet and wait for route status.
4. Open Evidence ledger.
5. Select the attendance evidence.
6. Select the reading-comprehension evidence.
7. Select the unsupported confidence/grades claim and show the warning.
8. Open Coverage and draft.
9. Open Human review and approve only after warnings are visible.
10. Open Export and show the Markdown evidence appendix.

## What To Avoid Saying

- Do not say the tool verifies impact.
- Do not say the tool proves causation.
- Do not say live AI is enabled on the public hosted site.
- Do not say real nonprofit data is supported.
- Do not say it replaces human review.
- Do not imply funder, compliance, audit, or legal acceptance.

## Good Closing Line

"The important part is not that AI writes a prettier report. The important part
is that unsupported claims stay visible, blocked, and reviewable before anything
leaves the workflow."

## Fallback Recording

If local live AI is not ready, record the static path and say:

"The same workflow runs safely without a key. Live extraction is optional and
guarded server-side, but the review and export controls are the product."

