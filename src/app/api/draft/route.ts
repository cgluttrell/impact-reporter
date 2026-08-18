import {
  cachedDraftPackageResponse,
  isCachedSampleRequest,
} from "@/lib/cached-live-ai";
import {
  buildResponsesRequest,
  callOpenAIResponses,
  checkLiveRateLimit,
  clientKeyFromHeaders,
  draftPackageSchema,
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
    return cachedDraftPackageResponse();
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
    schemaName: "DraftPackage",
    schema: draftPackageSchema(),
    system:
      "Draft concise nonprofit progress-report sections from accepted synthetic evidence only. Each substantive claim must cite evidence IDs. Do not call anything verified, safe, compliant, causal, or funder-approved.",
    user: validation.note,
  });

  return withLiveRateLimitHeaders(
    await callOpenAIResponses({
      apiKey: liveConfig.apiKey,
      request: openAIRequest,
    }),
    rateLimit,
  );
}
