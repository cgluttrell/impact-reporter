import {
  buildResponsesRequest,
  callOpenAIResponses,
  draftPackageSchema,
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
        "Static demo mode is active. Set OPENAI_API_KEY server-side to enable live drafting.",
    });
  }

  const openAIRequest = buildResponsesRequest({
    model,
    schemaName: "DraftPackage",
    schema: draftPackageSchema(),
    system:
      "Draft concise nonprofit progress-report sections from accepted synthetic evidence only. Each substantive claim must cite evidence IDs. Do not call anything verified, safe, compliant, causal, or funder-approved.",
    user: validation.note,
  });

  return callOpenAIResponses({ apiKey, request: openAIRequest });
}
