"use client";

import {
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle2,
  Copy,
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
import {
  buildMarkdownExportFromDataset,
  buildSampleWorkflow,
  samplePacketText,
  ReportDataset,
} from "@/lib/sample-workflow";
import { evaluateCleanExportReadiness } from "@/lib/verifier";

const steps = [
  "Report brief",
  "Evidence ledger",
  "Coverage and draft",
  "Review and export",
] as const;

type Step = (typeof steps)[number];

type ExtractionRouteState =
  | "idle"
  | "checking"
  | "static"
  | "live"
  | "fallback";

type ExtractionRouteStatus = {
  state: ExtractionRouteState;
  message: string;
};

const statusStyles = {
  verified: "border-[#7aa085] bg-[#eef7ef] text-[#23472f]",
  warning: "border-[#d6b86a] bg-[#fff8df] text-[#604514]",
  blocked: "border-[#d28f82] bg-[#fff0ed] text-[#7a3528]",
};

function requirementStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function briefLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase());
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
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
  const [copyStatus, setCopyStatus] = useState("");
  const [humanReviewApproved, setHumanReviewApproved] = useState(false);
  const [sampleText, setSampleText] = useState("");
  const [sampleDataset, setSampleDataset] = useState<ReportDataset | null>(null);
  const [extractionRouteStatus, setExtractionRouteStatus] =
    useState<ExtractionRouteStatus>({
      state: "idle",
      message: "Pasted sample analysis stays in this browser until checked.",
    });

  const activeBrief = sampleDataset?.projectBrief ?? projectBrief;
  const activeRequirements = sampleDataset?.requirements ?? requirements;
  const activeEvidence = sampleDataset?.evidence ?? evidence;
  const activeClaims = sampleDataset?.claims ?? claims;
  const activeMode = sampleDataset ? "sample" : "preloaded";

  const selectedEvidence = activeEvidence.find(
    (item) => item.id === selectedEvidenceId,
  );
  const selectedClaim = activeClaims.find((claim) => claim.id === selectedClaimId);
  const blockedClaims = activeClaims.filter((claim) => claim.status === "blocked");
  const cleanExportReadiness = useMemo(
    () =>
      evaluateCleanExportReadiness({
        claims: activeClaims,
        evidence: activeEvidence,
        requirements: activeRequirements,
        humanReviewApproved,
      }),
    [activeClaims, activeEvidence, activeRequirements, humanReviewApproved],
  );
  const exportBlockers = cleanExportReadiness.findings.filter(
    (finding) => finding.blocking,
  );

  const selectedClaimEvidence = useMemo(
    () =>
      selectedClaim?.evidenceIds
        .map((id) => activeEvidence.find((item) => item.id === id))
        .filter(Boolean) as EvidenceItem[] | undefined,
    [activeEvidence, selectedClaim],
  );
  const selectedClaimEvidenceIds = useMemo(
    () => new Set(selectedClaim?.evidenceIds ?? []),
    [selectedClaim],
  );
  const dispositionCounts = useMemo(
    () => ({
      verified: activeClaims.filter((claim) => claim.status === "verified").length,
      warning: activeClaims.filter((claim) => claim.status === "warning").length,
      blocked: activeClaims.filter((claim) => claim.status === "blocked").length,
    }),
    [activeClaims],
  );
  const blockedClaimSummary =
    blockedClaims.length === 1
      ? `"${blockedClaims[0].text}" is blocked and excluded from the report.`
      : `${blockedClaims.length} blocked ${pluralize(blockedClaims.length, "claim")} are excluded from the report.`;

  function selectClaim(claim: (typeof activeClaims)[number]) {
    setSelectedClaimId(claim.id);
    setSelectedEvidenceId(claim.evidenceIds[0] ?? selectedEvidenceId);
  }

  function resetToPreloadedSample() {
    setActiveStep("Report brief");
    setSelectedEvidenceId("E3");
    setSelectedClaimId("C3");
    setExportText("");
    setCopyStatus("");
    setHumanReviewApproved(false);
    setSampleText("");
    setSampleDataset(null);
    setExtractionRouteStatus({
      state: "idle",
      message: "Pasted sample analysis stays in this browser until checked.",
    });
  }

  async function analyzeSamplePacket() {
    const trimmedSampleText = sampleText.trim();
    if (!trimmedSampleText) return;

    setExtractionRouteStatus({
      state: "checking",
      message: "Checking extraction route before analyzing pasted sample.",
    });

    try {
      const routeStatusResponse = await fetch("/api/extract", {
        method: "GET",
      });
      const routeStatus = (await routeStatusResponse.json().catch(() => null)) as
        | { mode?: string; status?: string; message?: string }
        | null;

      if (
        routeStatusResponse.ok &&
        routeStatus?.mode === "live" &&
        routeStatus.status === "ready"
      ) {
        const extractionResponse = await fetch("/api/extract", {
          body: JSON.stringify({
            sourceArtifactId: "pasted-sample-packet",
            note: trimmedSampleText,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!extractionResponse.ok) {
          setExtractionRouteStatus({
            state: "fallback",
            message:
              "Extraction route did not return a usable response; using browser sample analysis.",
          });
        } else {
          setExtractionRouteStatus({
            state: "live",
            message:
              "Extraction route is live; browser sample analysis keeps this review visible.",
          });
        }
      } else {
        setExtractionRouteStatus({
          state: "static",
          message:
            routeStatus?.status === "missing_key"
              ? "Extraction route is missing its server key; using browser sample analysis."
              : "Extraction route is in static pilot mode; using browser sample analysis.",
        });
      }
    } catch {
      setExtractionRouteStatus({
        state: "fallback",
        message:
          "Extraction route could not be reached; using browser sample analysis.",
      });
    }

    const dataset = buildSampleWorkflow(trimmedSampleText);
    setSampleDataset(dataset);
    setSelectedEvidenceId(dataset.evidence[0]?.id ?? "S1");
    setSelectedClaimId(dataset.claims[0]?.id ?? "SC1");
    setExportText("");
    setCopyStatus("");
    setHumanReviewApproved(false);
    setActiveStep("Evidence ledger");
  }

  async function copyExport() {
    if (!exportText) return;
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("Copied Markdown export.");
    } catch {
      setCopyStatus("Copy failed. Select the preview text to copy manually.");
    }
  }

  function downloadExport() {
    if (!exportText) return;

    const blob = new Blob([exportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "impact-reporter-export.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2522]">
      <header className="border-b border-[#c9d2c4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#52615a]">
              Community impact reporting pilot
            </p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Impact Reporter
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#405048]">
              Turn program notes into a funder-ready draft with every claim
              checked against evidence. Supported claims stay in, shaky claims
              get caveats, and unsupported claims are blocked before a funder
              sees them.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-[#8aa398] px-3 py-2 text-sm font-medium text-[#24342e]">
              Demo uses sample data only
            </span>
            <a
              className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-white px-3 py-2 text-sm font-medium hover:bg-[#f6f7f4] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
              href="/guide"
            >
              <BookOpen aria-hidden className="h-4 w-4" />
              Guide
            </a>
            <button
              className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-[#f6f7f4] px-3 py-2 text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
              onClick={resetToPreloadedSample}
              type="button"
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              Reset pilot sample
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <section className="border border-[#c9d2c4] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Evidence source</h2>
                <p className="mt-1 text-sm leading-6 text-[#405048]">
                  {activeMode === "sample"
                    ? "Using pasted sample packet. It stays in this browser session and is not uploaded or stored."
                    : "Using the preloaded sample report."}
                </p>
                <p
                  aria-live="polite"
                  className="mt-2 text-sm font-medium text-[#405048]"
                >
                  Extraction route: {extractionRouteStatus.message}
                </p>
              </div>
              <span className="rounded border border-[#8aa398] bg-[#eef7ef] px-3 py-2 text-sm font-medium text-[#24342e]">
                {activeMode === "sample" ? "Using pasted sample" : "Using preloaded sample"}
              </span>
            </div>
          </section>

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
                    Start with the sample report, then follow the evidence trail
                    through draft claims, blocked language, human review, and
                    export. The walkthrough shows what your notes support, what
                    needs caution, and what not to claim yet.
                  </p>
                </div>
                <span className="rounded border border-[#d6b86a] bg-[#fff8df] px-3 py-2 text-sm font-medium text-[#604514]">
                  Human review required
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded bg-[#1f4d3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#193f30] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                  onClick={() => setActiveStep("Evidence ledger")}
                  type="button"
                >
                  <Search aria-hidden className="h-4 w-4" />
                  Start preloaded walkthrough
                </button>
                <a
                  className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#f6f7f4] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                  href="/guide"
                >
                  <BookOpen aria-hidden className="h-4 w-4" />
                  Read the guide
                </a>
              </div>

              <section className="mt-5 border border-[#d6b86a] bg-[#fffdf2] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      Optional: try another non-confidential sample
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#604514]">
                      Use short sample notes only: activities, attendance,
                      quotes, observations, measures, caveats, and next steps.
                      Do not paste names, private details, real participant
                      records, or grant information.
                    </p>
                  </div>
                  <span className="rounded border border-[#8aa398] bg-white px-3 py-2 text-sm font-medium text-[#24342e]">
                    {activeMode === "sample" ? "Using pasted sample" : "Using preloaded sample"}
                  </span>
                </div>
                <label
                  className="mt-4 block text-sm font-semibold text-[#405048]"
                  htmlFor="sample-packet"
                >
                  Optional sample evidence packet
                </label>
                <textarea
                  className="mt-2 min-h-48 w-full resize-y border border-[#c9d2c4] bg-white p-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                  id="sample-packet"
                  onChange={(event) => setSampleText(event.target.value)}
                  placeholder="Paste a short synthetic program packet here, or load the example packet."
                  value={sampleText}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded bg-[#1f4d3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#193f30] focus:outline-none focus:ring-2 focus:ring-[#4f7d68] disabled:cursor-not-allowed disabled:bg-[#9aa9a1]"
                    disabled={!sampleText.trim() || extractionRouteStatus.state === "checking"}
                    onClick={analyzeSamplePacket}
                    type="button"
                  >
                    <Search aria-hidden className="h-4 w-4" />
                    {extractionRouteStatus.state === "checking"
                      ? "Checking route"
                      : "Analyze pasted packet"}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#f6f7f4] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                    onClick={() => setSampleText(samplePacketText)}
                    type="button"
                  >
                    Load example packet
                  </button>
                </div>
              </section>

              <dl className="mt-5 grid gap-3 md:grid-cols-2">
                {Object.entries(activeBrief).map(([key, value]) => (
                  <div className="border border-[#dfe4dc] p-3" key={key}>
                    <dt className="text-sm font-medium capitalize text-[#52615a]">
                      {briefLabel(key)}
                    </dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid gap-3">
                {activeRequirements.map((requirement) => (
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
                Here is what the app found in the notes and how it plans to use
                each item. Unsupported statements stay visible, but they are not
                treated as measured outcomes.
              </p>
              <div className="mt-5 grid gap-3">
                {activeEvidence.map((item) => (
                  <button
                    className={`rounded border p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#4f7d68] ${
                      selectedEvidenceId === item.id
                        ? "border-[#4f7d68] bg-[#eef7ef]"
                        : selectedClaimEvidenceIds.has(item.id)
                          ? "border-[#8aa398] bg-[#f4faf6]"
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
                {activeRequirements.map((requirement) => (
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
                {activeClaims.map((claim) => (
                  <button
                    className={`w-full rounded border p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#4f7d68] ${
                      selectedClaimId === claim.id
                        ? "border-[#4f7d68] bg-[#eef7ef]"
                        : "border-[#dfe4dc] hover:bg-[#f6f7f4]"
                    }`}
                    key={claim.id}
                    onClick={() => selectClaim(claim)}
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
                Before export, review which claims are supported, which need
                caveats, and which are blocked. Blocked claims are excluded
                instead of reworded to sound better.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="border border-[#7aa085] bg-[#eef7ef] p-3 text-sm text-[#23472f]">
                  <p className="text-lg font-semibold">{dispositionCounts.verified}</p>
                  <p>Supported {pluralize(dispositionCounts.verified, "claim")}</p>
                </div>
                <div className="border border-[#d6b86a] bg-[#fff8df] p-3 text-sm text-[#604514]">
                  <p className="text-lg font-semibold">{dispositionCounts.warning}</p>
                  <p>Caveated {pluralize(dispositionCounts.warning, "claim")}</p>
                </div>
                <div className="border border-[#d28f82] bg-[#fff0ed] p-3 text-sm text-[#7a3528]">
                  <p className="text-lg font-semibold">{dispositionCounts.blocked}</p>
                  <p>Blocked {pluralize(dispositionCounts.blocked, "claim")}</p>
                </div>
              </div>
              <div className="mt-5 border border-[#d28f82] bg-[#fff0ed] p-4 text-[#7a3528]">
                <div className="flex items-center gap-2 font-semibold">
                  <Ban aria-hidden className="h-4 w-4" />
                  {blockedClaims.length} blocked {pluralize(blockedClaims.length, "claim")} excluded from export
                </div>
                <p className="mt-2 text-sm leading-6">
                  {blockedClaimSummary}
                </p>
              </div>
              <label className="mt-5 flex items-start gap-3 border border-[#d6b86a] bg-[#fff8df] p-4 text-sm leading-6 text-[#604514]">
                <input
                  checked={humanReviewApproved}
                  className="mt-1 h-4 w-4 accent-[#1f4d3a]"
                  onChange={(event) => {
                    setHumanReviewApproved(event.target.checked);
                    setExportText("");
                    setCopyStatus("");
                  }}
                  type="checkbox"
                />
                <span>
                  I reviewed this report&apos;s claims and confirm the sample export is ready.
                </span>
              </label>
              {exportBlockers.length > 0 && (
                <div className="mt-3 border border-[#d28f82] bg-[#fff0ed] p-4 text-sm leading-6 text-[#7a3528]">
                  <p className="font-semibold">Export locked</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {exportBlockers.map((finding) => (
                      <li key={`${finding.code}-${finding.entityId}`}>
                        {finding.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cleanExportReadiness.canExport && (
                <div className="mt-3 border border-[#7aa085] bg-[#eef7ef] p-4 text-sm leading-6 text-[#23472f]">
                  <p className="font-semibold">Ready to export</p>
                  <p>
                    Human review is recorded for this sample report, and blocked
                    claims are excluded from the Markdown draft.
                  </p>
                </div>
              )}
              <button
                className="mt-5 inline-flex items-center gap-2 rounded bg-[#1f4d3a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#193f30] focus:outline-none focus:ring-2 focus:ring-[#4f7d68] disabled:cursor-not-allowed disabled:bg-[#9aa9a1]"
                disabled={!cleanExportReadiness.canExport}
                onClick={() =>
                  {
                    setExportText(
                      sampleDataset
                        ? buildMarkdownExportFromDataset(sampleDataset)
                        : buildMarkdownExport(),
                    );
                    setCopyStatus("");
                  }
                }
                type="button"
              >
                <Download aria-hidden className="h-4 w-4" />
                Generate Markdown export
              </button>
              {exportText && (
                <section className="mt-5 border border-[#c9d2c4] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Markdown report preview</h3>
                      <p className="mt-1 text-sm leading-6 text-[#405048]">
                        The export keeps evidence references, unresolved
                        warnings, and blocked-claim notes attached.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f6f7f4] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                        onClick={copyExport}
                        type="button"
                      >
                        <Copy aria-hidden className="h-4 w-4" />
                        Copy Markdown
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded border border-[#9aa9a1] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f6f7f4] focus:outline-none focus:ring-2 focus:ring-[#4f7d68]"
                        onClick={downloadExport}
                        type="button"
                      >
                        <Download aria-hidden className="h-4 w-4" />
                        Download .md
                      </button>
                    </div>
                  </div>
                  {copyStatus && (
                    <p className="mt-3 text-sm font-medium text-[#23472f]">
                      {copyStatus}
                    </p>
                  )}
                  <pre
                    aria-label="Generated Markdown export"
                    className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap border border-[#c9d2c4] bg-[#f6f7f4] p-4 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#234f39] focus:ring-offset-2"
                    tabIndex={0}
                  >
                    {exportText}
                  </pre>
                </section>
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
                Safe pilot mode works without an API key.
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
