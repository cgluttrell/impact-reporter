# Impact Reporter MVP Roadmap

Impact Reporter should become a usable community-impact reporting assistant, not
only a polished static demo.

## Product Goal

Help nonprofit and education teams produce progress-report drafts that stay tied
to evidence, expose weak claims, and preserve human review before anything is
shared with a funder or stakeholder.

## Current Safe Pilot

The hosted Cloudflare version is intentionally conservative:

- synthetic Neighborhood Learning Lab data only
- no login
- no saved workspace
- no file upload
- no live AI key
- no real nonprofit or participant data

This proves the trust workflow and public deployment path, but it is not the
finished application.

## Next Functional Slice

Build a controlled bring-your-own sample evidence workflow:

1. Let a user paste or load a small non-confidential evidence packet.
2. Extract candidate evidence into an editable ledger.
3. Keep deterministic verifier checks in charge of claim eligibility.
4. Let the user inspect supported, warning, and blocked claims.
5. Export Markdown with warnings and evidence references intact.

## Why Logins Wait

User accounts are not the next product risk. They become useful only after the
app needs saved reports, organization workspaces, collaboration, or access
control.

Before that, the app should prove that one person can bring safe sample evidence
into the workflow and leave with a useful, reviewable report draft.

## Acceptance Standard

The app is not ready to call a real positive-impact application until an intended
user can supply a small safe evidence packet and complete the reporting workflow
without relying on the preloaded sample.
