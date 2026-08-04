export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2522]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c9d2c4] pb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#52615a]">
              Build for Good demo
            </p>
            <h1 className="text-3xl font-semibold tracking-normal text-[#17201c]">
              Impact Reporter
            </h1>
          </div>
          <span className="rounded border border-[#8aa398] bg-white px-3 py-2 text-sm font-medium text-[#24342e]">
            Synthetic data only
          </span>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <p className="max-w-2xl text-2xl font-semibold leading-tight text-[#17201c]">
              Draft what you can prove. Flag what you cannot.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#405048]">
              Impact Reporter is a focused workbench for turning a synthetic
              nonprofit evidence packet into a traceable funder progress-report
              draft. AI proposes evidence and language; deterministic code
              verifies claims; a human approves the export.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Report brief",
                "Evidence ledger",
                "Coverage and draft",
                "Review and export",
              ].map((step, index) => (
                <div
                  className="border border-[#c9d2c4] bg-white p-4"
                  key={step}
                >
                  <p className="text-sm font-semibold text-[#52615a]">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#17201c]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="border border-[#c9d2c4] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#17201c]">
              Neighborhood Learning Lab
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#405048]">
              The first demo fixture is fictional. It includes attendance
              metrics, matched pre/post reading checks, facilitator notes, one
              approved synthetic quote, and one unsupported confidence claim
              that must not pass as measured impact.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium text-[#52615a]">Sessions</dt>
                <dd className="text-lg font-semibold text-[#17201c]">
                  15 / 16
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[#52615a]">Attendance</dt>
                <dd className="text-lg font-semibold text-[#17201c]">246</dd>
              </div>
              <div>
                <dt className="font-medium text-[#52615a]">Matched sample</dt>
                <dd className="text-lg font-semibold text-[#17201c]">18</dd>
              </div>
              <div>
                <dt className="font-medium text-[#52615a]">Verifier state</dt>
                <dd className="text-lg font-semibold text-[#7a3528]">
                  Review required
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
