# User Guide

Impact Reporter helps a nonprofit reporting team practice turning program notes
into an evidence-linked progress update.

The current hosted demo is static and uses synthetic data only. It does not
require an account, does not call a live AI model, and must not receive real or
confidential information.

Live demo:

https://impact-reporter.luttrell.works/

## Who This Is For

This demo is for people who need to understand or improve nonprofit progress
reporting:

- nonprofit program staff preparing a funder update
- grant writers or development staff checking whether claims are supported
- reviewers who need to see evidence behind narrative claims
- builders evaluating evidence-first AI workflow patterns

It is not a compliance system, audit tool, grant-management platform, or proof
of real-world impact.

## Before You Start

Use the demo data already loaded in the app. Do not paste or upload real:

- participant, student, beneficiary, client, or patient information
- financial, grant, regulated, confidential, or private data
- notes from a real nonprofit program
- funder correspondence or internal reports

The demo exists to show the workflow, not to process real reporting material.

## The Main Idea

Impact Reporter follows one rule:

> Draft what you can prove. Flag what you cannot.

The app separates three things that are often blurred together:

- the funder's reporting requirements
- the evidence available for the reporting period
- the claims that can or cannot be supported by that evidence

## Step 1: Report Brief

Start with the reporting period and requirements.

Use this step to understand what the funder is asking for and what the report
needs to cover. In the demo, the brief is already filled with synthetic
Neighborhood Learning Lab material.

Look for:

- reporting period
- funder questions
- required sections
- evidence expectations

## Step 2: Evidence Ledger

Review the available evidence before trusting any draft language.

The ledger shows the source material the report can use. Some evidence supports
simple output claims, some supports limited outcome claims, and some is only
context.

Look for:

- evidence IDs
- source excerpts
- date or period references
- metric units and denominators
- confidence warnings

If a claim is not backed by the ledger, it should not appear as proven impact.

## Step 3: Coverage And Draft

Review which requirements are covered and which claims are drafted.

The draft is evidence-linked. That means a claim should point back to one or
more evidence IDs instead of standing alone as polished prose.

Pay special attention to status labels:

- `supported`: the claim has enough evidence for the current demo standard
- `needs review`: the claim needs human judgment before use
- `blocked`: the claim should not be included as a clean supported claim

The demo intentionally includes an unsupported confidence and future-grade
claim. Impact Reporter blocks it rather than making it sound better than the
evidence allows.

## Step 4: Review And Export

Use this step to decide what is ready to export.

The export keeps warnings visible. This is intentional. A useful reporting
workflow should not hide gaps just because the narrative sounds polished.

The Markdown export includes:

- report draft sections
- evidence references
- unresolved warnings
- blocked claim notes
- evidence appendix

## Claim Inspector

The inspector shows why a claim is allowed, needs review, or is blocked.

Use it when a sentence sounds persuasive but you need to know whether it is
actually supported.

The inspector can show:

- related evidence IDs
- period or denominator checks
- quote consent status
- unsupported or overstated claim warnings
- blocking reasons

## What A Good Result Looks Like

A good result is not just a polished draft. A good result is a draft where:

- supported claims point to evidence
- unsupported claims are blocked or downgraded
- unresolved warnings remain visible
- a human reviewer can see what still needs judgment
- exported text does not pretend weak evidence is strong evidence

## What Not To Do

Do not treat the demo as a production reporting system.

Do not use it to:

- submit a real funder report
- prove program impact
- evaluate real participants
- process confidential data
- replace human review
- certify compliance

## Current Limitations

The hosted demo is static/no-key:

- no login or user accounts
- no saved user workspace
- no file upload
- no real AI extraction or drafting
- no production data handling
- hosted at `https://impact-reporter.luttrell.works/`

Optional live AI routes exist in the codebase, but the hosted demo leaves
`IMPACT_REPORTER_LIVE_AI` and `OPENAI_API_KEY` unset. Those routes return safe
static-mode responses such as `live_disabled` until the project maintainer
approves enabling live model calls after a data-boundary review.

## Suggested Demo Script

1. Open the hosted demo.
2. Read the report brief.
3. Move to the evidence ledger and inspect the available evidence.
4. Move to coverage and draft.
5. Select a supported claim and inspect the evidence behind it.
6. Select the blocked confidence/future-grade claim and note why it is blocked.
7. Move to review and export.
8. Generate the Markdown export.
9. Confirm the export keeps blocked-claim warnings visible.

The trust moment is the blocked claim. The app is useful because it refuses to
turn weak evidence into confident-sounding impact.
