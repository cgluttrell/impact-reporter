import {
  buildResponsesRequest,
  callOpenAIResponses,
  evidenceExtractionSchema,
  resolveLiveRouteConfig,
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

  const liveConfig = resolveLiveRouteConfig(process.env);

  if (!liveConfig.ready) {
    return Response.json({
      mode: "static",
      status: liveConfig.status,
      message: liveConfig.message,
    });
  }

  const openAIRequest = buildResponsesRequest({
    model: liveConfig.model,
    schemaName: "EvidenceExtraction",
    schema: evidenceExtractionSchema(),
    system:
      "Extract candidate nonprofit reporting evidence from synthetic demo notes. Preserve source excerpts exactly. Do not verify evidence. Do not assign consent. Every candidate requires human confirmation.",
    user: JSON.stringify({
      sourceArtifactId: validation.sourceArtifactId,
      note: validation.note,
    }),
  });

  return callOpenAIResponses({ apiKey: liveConfig.apiKey, request: openAIRequest });
}
