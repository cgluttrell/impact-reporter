import Link from "next/link";

const steps = [
  {
    title: "Start with the reporting question",
    body: "Confirm the reporting period, funder questions, and limits before trusting draft language.",
  },
  {
    title: "Review the evidence ledger",
    body: "Inspect evidence IDs, source excerpts, dates, denominators, consent notes, and confidence warnings.",
  },
  {
    title: "Check claims before export",
    body: "Supported claims cite evidence. Weak or unsupported claims stay visible as warnings or blockers.",
  },
  {
    title: "Export with review notes intact",
    body: "The Markdown export keeps warnings and evidence references visible so a human can finish the report responsibly.",
  },
];

const limits = [
  "No real participant, student, beneficiary, client, patient, financial, grant, regulated, confidential, or private data.",
  "No login, saved workspace, file upload, or production data handling yet.",
  "No live AI calls in the hosted version until Chris explicitly approves a server-side key and data boundary.",
  "Not a compliance product, audit tool, evaluation system, or funder-submission service.",
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
            Use Impact Reporter as a safe reporting pilot
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#405048]">
            Impact Reporter helps nonprofit and education teams practice turning
            program evidence into funder-ready progress-report language without
            overstating what the evidence proves.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-6">
        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">Who it is for</h2>
          <p className="mt-2 text-sm leading-6 text-[#405048]">
            This pilot is for nonprofit program staff, grant writers, reviewers,
            and community-impact builders who need a clearer way to connect
            narrative claims to the evidence behind them.
          </p>
        </section>

        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">How to use it</h2>
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
          <h2 className="text-xl font-semibold">Current safety boundary</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#405048]">
            {limits.map((limit) => (
              <li className="border-l-4 border-[#d6b86a] pl-3" key={limit}>
                {limit}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-[#c9d2c4] bg-white p-5">
          <h2 className="text-xl font-semibold">What comes next</h2>
          <p className="mt-2 text-sm leading-6 text-[#405048]">
            The next MVP step is not user accounts. It is a controlled
            bring-your-own sample evidence workflow: paste or load a small
            non-confidential packet, extract candidate evidence, run verifier
            checks, inspect claims, and export a reviewed Markdown report.
          </p>
        </section>
      </div>
    </main>
  );
}
