# Privacy and Safety

Impact Reporter is currently synthetic-only.

Do not enter real nonprofit, beneficiary, client, student, health, education,
financial, grant, regulated, confidential, or personal data.

The demo does not provide legal, regulatory, audit, evaluation, compliance,
grant-management, or funder-acceptance assurance. It does not automatically
submit reports.

If optional live model routes are enabled, they must run server-side only, use
structured outputs, set `store: false`, handle refusal and malformed output,
and avoid raw evidence logging.

Current live-route safety defaults:

- no key required for static demo mode
- live AI remains disabled unless `IMPACT_REPORTER_LIVE_AI=enabled`
- `OPENAI_API_KEY` is read server-side only
- `OPENAI_MODEL` is optional and server-side
- request input is bounded
- no real data is allowed
- public hosted live calls require Chris approval before enablement
