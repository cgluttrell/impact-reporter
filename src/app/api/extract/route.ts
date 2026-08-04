import {
  buildResponsesRequest,
  callOpenAIResponses,
  evidenceExtractionSchema,
  validateLiveRequestBody,
} from "@/lib/live-openai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateLiveRequestBody(body);

  if (!validation.ok) {
    return Response.json(
      { status: "invalid_request", error: validation.error },
      { status: validation.status },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return Response.json({
      mode: "static",
      status: "no_key",
      message:
        "Static demo mode is active. Set OPENAI_API_KEY server-side to enable live extraction.",
    });
  }

  const openAIRequest = buildResponsesRequest({
    model,
    schemaName: "EvidenceExtraction",
    schema: evidenceExtractionSchema(),
    system:
      "Extract candidate nonprofit reporting evidence from synthetic demo notes. Preserve source excerpts exactly. Do not verify evidence. Do not assign consent. Every candidate requires human confirmation.",
    user: JSON.stringify({
      sourceArtifactId: validation.sourceArtifactId,
      note: validation.note,
    }),
  });

  return callOpenAIResponses({ apiKey, request: openAIRequest });
}
