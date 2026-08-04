# Verifier Contract

The deterministic verifier controls export eligibility.

Initial rule areas:

- evidence ID references must exist
- accepted evidence is required for exportable claims
- attendance averages recompute from source values
- outcome deltas recompute from baseline and follow-up values
- denominators, periods, units, and matched samples must be present
- quote text must match accepted quote evidence exactly
- quote consent must be approved for demo use
- observations cannot be upgraded to measured outcomes
- causal or future claims require supporting evidence
- unresolved blockers prevent clean export

The static fixture should include passing, warning, and blocking findings.
