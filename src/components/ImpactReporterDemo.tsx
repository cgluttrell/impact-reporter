"use client";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildMarkdownExport,
  claims,
  evidence,
  EvidenceItem,
  projectBrief,
  requirements,
} from "@/lib/demo-data";

const steps = [
  "Report brief",
  "Evidence ledger",
  "Coverage and draft",
  "Review and export",
] as const;

type Step = (typeof steps)[number];

const statusStyles = {
  verified: "border-[#7aa085] bg-[#eef7ef] text-[#23472f]",
  warning: "border-[#d6b86a] bg-[#fff8df] text-[#604514]",
  blocked: "border-[#d28f82] bg-[#fff0ed] text-[#7a3528]",
};

function requirementStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function EvidenceIcon({ item }: { item: EvidenceItem }) {
  if (item.status === "flagged" || item.status === "rejected") {
    return <Ban aria-hidden className="h-4 w-4" />;
  }
  if (item.warning) {
    return <AlertTriangle aria-hidden className="h-4 w-4" />;
  }
  return <CheckCircle2 aria-hidden className="h-4 w-4" />;
}

export function ImpactReporterDemo() {
  const [activeStep, setActiveStep] = useState<Step>("Report brief");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("E3");
  const [selectedClaimId, setSelectedClaimId] = useState("C3");
  const [exportText, setExportText] = useState("");

  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId);
  const selectedClaim = claims.find((claim) => claim.id === selectedClaimId);
  const blockedClaims = claims.filter((claim) => claim.status === "blocked");

  const selectedClaimEvidence = useMemo(
    () =>
      selectedClaim?.evidenceIds
        .map((id) => evidence.find((item) => item.id === id))
        .filter(Boolean) as EvidenceItem[] | undefined,
    [selectedClaim],
  );

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2522]">
      <header className="border-b border-[#c9d2c4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#52615a]">
              Build for Good demo
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Impact Reporter
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-[#8aa398] px-3 py-2 text-sm font-medium text-[#24342e]">
              Synthetic data only
            </span>
            <button
              className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-[#f6f7f4] px-3 py-2 text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
              onClick={() => {
                setActiveStep("Report brief");
                setSelectedEvidenceId("E3");
                setSelectedClaimId("C3");
                setExportText("");
              }}
              type="button"
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              Reset sample
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <nav
            aria-label="Impact Reporter workflow"
            className="grid gap-2 sm:grid-cols-4"
          >
            {steps.map((step, index) => (
              <button
                aria-current={activeStep === step ? "step" : undefined}
                className={`min-h-14 rounded border px-3 py-2 text-left text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4f7d68] ${
                  activeStep === step
                    ? "border-[#4f7d68] bg-[#dfeee5] text-[#193329]"
                    : "border-[#c9d2c4] bg-white text-[#405048] hover:bg-[#eef2ec]"
                }`}
                key={step}
                onClick={() => setActiveStep(step)}
                type="button"
              >
                <span className="block text-xs text-[#52615a]">
                  Step {index + 1}
                </span>
                {step}
              </button>
            ))}
          </nav>

          {activeStep === "Report brief" && (
            <section className="border border-[#c9d2c4] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Report brief</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#405048]">
                    The sample is preloaded so reviewers can evaluate the trust
                    workflow without setup or credentials.
                  </p>
                </div>
                <span className="rounded border border-[#d6b86a] bg-[#fff8df] px-3 py-2 text-sm font-medium text-[#604514]">
                  Human review required
                </span>
              </div>
              <dl className="mt-5 grid gap-3 md:grid-cols-2">
                {Object.entries(projectBrief).map(([key, value]) => (
                  <div className="border border-[#dfe4dc] p-3" key={key}>
                    <dt className="text-sm font-medium capitalize text-[#52615a]">
                      {key.replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid gap-3">
                {requirements.map((requirement) => (
                  <article
                    className="border border-[#dfe4dc] p-4"
                    key={requirement.id}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="font-semibold">
                        {requirement.id}: {requirement.label}
                      </h3>
                      <span className="text-sm text-[#52615a]">
                        {requirement.limit}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#405048]">
                      {requirement.prompt}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeStep === "Evidence ledger" && (
            <section className="border border-[#c9d2c4] bg-white p-5">
              <h2 className="text-xl font-semibold">Evidence ledger</h2>
              <p className="mt-2 text-sm leading-6 text-[#405048]">
                Candidate evidence is visible, typed, and inspectable. The
                unsupported confidence claim is kept out of accepted measured
                outcomes.
              </p>
              <div className="mt-5 grid gap-3">
                {evidence.map((item) => (
                  <button
                    className={`rounded border p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#4f7d68] ${
                      selectedEvidenceId === item.id
                        ? "border-[#4f7d68] bg-[#eef7ef]"
                        : "border-[#dfe4dc] hover:bg-[#f6f7f4]"
                    }`}
                    key={item.id}
                    onClick={() => setSelectedEvidenceId(item.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <EvidenceIcon item={item} />
                        <span className="font-semibold">
                          {item.id}: {item.label}
                        </span>
                      </div>
                      <span className="rounded border border-[#c9d2c4] px-2 py-1 text-xs font-medium uppercase text-[#52615a]">
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#405048]">
                      {item.content}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeStep === "Coverage and draft" && (
            <section className="border border-[#c9d2c4] bg-white p-5">
              <h2 className="text-xl font-semibold">Coverage and draft</h2>
              <p className="mt-2 text-sm leading-6 text-[#405048]">
                Each requirement shows support status before draft claims are
                inspected.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {requirements.map((requirement) => (
                  <article
                    className="border border-[#dfe4dc] p-4"
                    key={requirement.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        {requirement.id}: {requirement.label}
                      </h3>
                      <span className="text-xs font-semibold uppercase text-[#52615a]">
                        {requirementStatusLabel(requirement.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#405048]">
                      {requirement.summary}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Evidence: {requirement.evidenceIds.join(", ")}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {claims.map((claim) => (
                  <button
                    className={`w-full rounded border p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#4f7d68] ${
                      selectedClaimId === claim.id
                        ? "border-[#4f7d68] bg-[#eef7ef]"
                        : "border-[#dfe4dc] hover:bg-[#f6f7f4]"
                    }`}
                    key={claim.id}
                    onClick={() => setSelectedClaimId(claim.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {claim.id} / {claim.requirementId}
                      </span>
                      <span
                        className={`rounded border px-2 py-1 text-xs font-semibold uppercase ${statusStyles[claim.status]}`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#405048]">
                      {claim.text}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeStep === "Review and export" && (
            <section className="border border-[#c9d2c4] bg-white p-5">
              <h2 className="text-xl font-semibold">Review and export</h2>
              <p className="mt-2 text-sm leading-6 text-[#405048]">
                Clean export remains blocked until unsupported measured-impact
                claims are excluded and human review is recorded.
              </p>
              <div className="mt-5 border border-[#d28f82] bg-[#fff0ed] p-4 text-[#7a3528]">
                <div className="flex items-center gap-2 font-semibold">
                  <Ban aria-hidden className="h-4 w-4" />
                  {blockedClaims.length} blocked claim excluded from clean export
                </div>
                <p className="mt-2 text-sm leading-6">
                  The confidence and future-grade claim is visible as a blocker,
                  not hidden in polished prose.
                </p>
              </div>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded bg-[#1f4d3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#193f30] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                onClick={() => setExportText(buildMarkdownExport())}
                type="button"
              >
                <Download aria-hidden className="h-4 w-4" />
                Generate Markdown export
              </button>
              {exportText && (
                <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap border border-[#c9d2c4] bg-[#f6f7f4] p-4 text-sm leading-6">
                  {exportText}
                </pre>
              )}
            </section>
          )}
        </section>

        <aside className="space-y-5">
          <section className="border border-[#c9d2c4] bg-white p-5">
            <div className="flex items-center gap-2">
              <Search aria-hidden className="h-5 w-5 text-[#52615a]" />
              <h2 className="text-lg font-semibold">Inspector</h2>
            </div>
            {selectedClaim && (
              <div className="mt-4 border-b border-[#dfe4dc] pb-4">
                <p className="text-sm font-semibold text-[#52615a]">
                  Selected claim
                </p>
                <p className="mt-2 text-sm leading-6">{selectedClaim.text}</p>
                <p
                  className={`mt-3 rounded border px-3 py-2 text-sm font-medium ${statusStyles[selectedClaim.status]}`}
                >
                  {selectedClaim.finding}
                </p>
                {selectedClaimEvidence && selectedClaimEvidence.length > 0 && (
                  <p className="mt-3 text-sm text-[#52615a]">
                    Cites {selectedClaimEvidence.map((item) => item.id).join(", ")}
                  </p>
                )}
              </div>
            )}
            {selectedEvidence && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#52615a]">
                  Selected evidence
                </p>
                <h3 className="mt-2 font-semibold">
                  {selectedEvidence.id}: {selectedEvidence.label}
                </h3>
                <p className="mt-2 text-sm leading-6">
                  {selectedEvidence.content}
                </p>
                <p className="mt-3 text-sm text-[#52615a]">
                  {selectedEvidence.provenance}
                </p>
                {selectedEvidence.warning && (
                  <p className="mt-3 rounded border border-[#d6b86a] bg-[#fff8df] px-3 py-2 text-sm font-medium text-[#604514]">
                    {selectedEvidence.warning}
                  </p>
                )}
                {selectedEvidence.details && (
                  <dl className="mt-3 space-y-2 text-sm">
                    {Object.entries(selectedEvidence.details).map(
                      ([key, value]) => (
                        <div className="flex justify-between gap-3" key={key}>
                          <dt className="text-[#52615a]">{key}</dt>
                          <dd className="text-right font-medium">{value}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                )}
              </div>
            )}
          </section>

          <section className="border border-[#c9d2c4] bg-white p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck aria-hidden className="h-5 w-5 text-[#52615a]" />
              <h2 className="text-lg font-semibold">Review state</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6">
              <li className="flex gap-2">
                <CheckCircle2 aria-hidden className="mt-1 h-4 w-4" />
                Static demo mode works without an API key.
              </li>
              <li className="flex gap-2">
                <AlertTriangle aria-hidden className="mt-1 h-4 w-4" />
                R3 remains descriptive, not causal.
              </li>
              <li className="flex gap-2">
                <Ban aria-hidden className="mt-1 h-4 w-4" />
                Unsupported confidence/grade claim is blocked.
              </li>
              <li className="flex gap-2">
                <FileText aria-hidden className="mt-1 h-4 w-4" />
                Export includes warnings and evidence appendix.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
