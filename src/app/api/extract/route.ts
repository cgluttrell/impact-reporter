import {
  cachedEvidenceExtractionResponse,
  isCachedSampleRequest,
} from "@/lib/cached-live-ai";
import {
  buildResponsesRequest,
  callOpenAIResponses,
  checkLiveRateLimit,
  clientKeyFromHeaders,
  evidenceExtractionSchema,
  liveRateLimitHeaders,
  resolveLiveRouteConfig,
  staticModeResponse,
  validateLiveRequestBody,
  withLiveRateLimitHeaders,
} from "@/lib/live-openai";

export async function GET() {
  return staticModeResponse(process.env);
}

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

  if (isCachedSampleRequest(validation) && !validation.requestLive) {
    return cachedEvidenceExtractionResponse();
  }

  if (!validation.requestLive) {
    return Response.json({
      mode: "live",
      status: "cache_miss",
      message:
        "Live AI is configured, but this route serves cached output unless an explicit live request is made.",
    });
  }

  const rateLimit = checkLiveRateLimit({
    clientKey: clientKeyFromHeaders(request.headers),
  });

  if (!rateLimit.ok) {
    return Response.json(
      { mode: "live", status: "rate_limited", error: rateLimit.error },
      { headers: liveRateLimitHeaders(rateLimit), status: rateLimit.status },
    );
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

  return withLiveRateLimitHeaders(
    await callOpenAIResponses({
      apiKey: liveConfig.apiKey,
      request: openAIRequest,
    }),
    rateLimit,
  );
}
