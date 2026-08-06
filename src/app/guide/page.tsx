import Link from "next/link";

const steps = [
  {
    title: "Open the sample report brief",
    body: "Start with the fictional program, reporting period, funder, and questions the report needs to answer.",
  },
  {
    title: "Inspect the evidence ledger",
    body: "Review each evidence item before trusting a claim: metrics, notes, quotes, source context, caveats, and blocked statements.",
  },
  {
    title: "Check each draft claim",
    body: "Select a claim to see what evidence supports it. The app labels strong claims, caveated claims, and claims that should not appear in a clean report.",
  },
  {
    title: "Record review, then export",
    body: "A clean Markdown export stays disabled until human review is recorded. The export keeps evidence references and unresolved warnings visible.",
  },
];

const limits = [
  "Use synthetic or non-confidential sample text only.",
  "Do not paste real participant, student, beneficiary, client, patient, financial, grant, regulated, confidential, or private data.",
  "The hosted demo has no login, saved workspace, file upload, or production data handling.",
  "The hosted demo makes no live AI calls unless that mode is explicitly enabled later.",
  "This is not a compliance product, audit tool, evaluation system, or funder-submission service.",
];

const outcomes = [
  "A report brief that names the program, period, funder, and reporting questions.",
  "An evidence ledger that separates accepted evidence, caveated evidence, and unsupported statements.",
  "Draft claims that show which evidence they cite.",
  "A blocked-claim check that keeps unsupported confidence, causation, or future-results language out of the clean export.",
  "A reviewed Markdown report draft with evidence references and warnings still attached.",
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2522]">
      <header className="border-b border-[#c9d2c4] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <Link
            className="text-sm font-semibold text-[#1f4d3a] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
            href="/"
          >
            Back to Impact Reporter
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#52615a]">
            End-user guide
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Use Impact Reporter to check a progress report before it leaves the team
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#405048]">
            Impact Reporter helps nonprofit and education teams turn program
            notes into evidence-linked report language. It shows what each claim
            is based on, flags unsupported claims, and keeps human review in
            control before export.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-6">
        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">What you do in the app</h2>
          <p className="mt-2 text-sm leading-6 text-[#405048]">
            You start with a safe sample reporting packet, inspect the evidence
            the app found, review the draft claims, block language the evidence
            does not support, record human review, and export a Markdown report
            draft.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#405048]">
            The point is not to make a prettier paragraph. The point is to make
            the relationship between evidence and claims visible before a report
            goes to a funder, board, donor, or reviewer.
          </p>
        </section>

        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">Try the workflow</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {steps.map((step, index) => (
              <article className="border border-[#dfe4dc] p-4" key={step.title}>
                <p className="text-sm font-semibold text-[#52615a]">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#405048]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">What the app produces</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#405048]">
            {outcomes.map((outcome) => (
              <li className="border-l-4 border-[#8aa398] pl-3" key={outcome}>
                {outcome}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">Current safety boundary</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#405048]">
            {limits.map((limit) => (
              <li className="border-l-4 border-[#d6b86a] pl-3" key={limit}>
                {limit}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
