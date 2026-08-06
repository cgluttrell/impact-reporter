export const MAX_LIVE_INPUT_CHARS = 6000;
export const MAX_SOURCE_ARTIFACT_ID_CHARS = 120;
export const LIVE_AI_ENABLE_VALUE = "enabled";
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export type LiveRouteValidation =
  | { ok: true; sourceArtifactId: string; note: string }
  | { ok: false; status: number; error: string };

export type OpenAIRequestBody = {
  model: string;
  store: false;
  input: Array<{
    role: "system" | "user";
    content: string;
  }>;
  text: {
    format: {
      type: "json_schema";
      name: string;
      strict: true;
      schema: Record<string, unknown>;
    };
  };
};

export type LiveRouteConfig =
  | {
      ready: true;
      apiKey: string;
      model: string;
    }
  | {
      ready: false;
      status: "live_disabled" | "missing_key";
      message: string;
    };

export function resolveLiveRouteConfig(
  env: Record<string, string | undefined>,
): LiveRouteConfig {
  const liveAIEnabled = env.IMPACT_REPORTER_LIVE_AI === LIVE_AI_ENABLE_VALUE;
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  if (!liveAIEnabled) {
    return {
      ready: false,
      status: "live_disabled",
      message:
        "Static pilot mode is active. Live AI requires IMPACT_REPORTER_LIVE_AI=enabled and a server-side OPENAI_API_KEY.",
    };
  }

  if (!apiKey) {
    return {
      ready: false,
      status: "missing_key",
      message:
        "Live AI is enabled, but no server-side OPENAI_API_KEY is configured.",
    };
  }

  return { ready: true, apiKey, model };
}

export function validateLiveRequestBody(body: unknown): LiveRouteValidation {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "JSON body is required." };
  }

  const sourceArtifactId = (body as Record<string, unknown>).sourceArtifactId;
  const note = (body as Record<string, unknown>).note;

  if (typeof sourceArtifactId !== "string" || sourceArtifactId.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "sourceArtifactId is required.",
    };
  }

  if (sourceArtifactId.length > MAX_SOURCE_ARTIFACT_ID_CHARS) {
    return {
      ok: false,
      status: 413,
      error: `sourceArtifactId is limited to ${MAX_SOURCE_ARTIFACT_ID_CHARS} characters.`,
    };
  }

  if (typeof note !== "string" || note.trim().length === 0) {
    return { ok: false, status: 400, error: "note is required." };
  }

  if (note.length > MAX_LIVE_INPUT_CHARS) {
    return {
      ok: false,
      status: 413,
      error: `note is limited to ${MAX_LIVE_INPUT_CHARS} characters.`,
    };
  }

  return { ok: true, sourceArtifactId, note };
}

export function evidenceExtractionSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["sourceArtifactId", "candidates", "extractionGaps"],
    properties: {
      sourceArtifactId: { type: "string" },
      candidates: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "candidateKey",
            "evidenceType",
            "sourceExcerpt",
            "claimClass",
            "periodRef",
            "proposedValue",
            "proposedUnit",
            "ambiguities",
            "requiresHumanConfirmation",
          ],
          properties: {
            candidateKey: { type: "string" },
            evidenceType: {
              type: "string",
              enum: [
                "event",
                "metric",
                "observation",
                "quote",
                "outcome_measure",
                "context",
              ],
            },
            sourceExcerpt: { type: "string" },
            claimClass: {
              type: "string",
              enum: ["output", "outcome", "anecdotal", "context", "unknown"],
            },
            periodRef: { type: ["string", "null"] },
            proposedValue: { type: ["number", "null"] },
            proposedUnit: { type: ["string", "null"] },
            ambiguities: { type: "array", items: { type: "string" } },
            requiresHumanConfirmation: { type: "boolean", enum: [true] },
          },
        },
      },
      extractionGaps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["code", "message", "sourceArtifactId"],
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            sourceArtifactId: { type: "string" },
          },
        },
      },
    },
  };
}

export function draftPackageSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["sections", "gaps"],
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["requirementId", "status", "narrative", "claims"],
          properties: {
            requirementId: { type: "string" },
            status: {
              type: "string",
              enum: [
                "drafted",
                "insufficient_evidence",
                "needs_human_judgment",
              ],
            },
            narrative: { type: "string" },
            claims: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "claimKey",
                  "text",
                  "claimType",
                  "evidenceIds",
                  "numericAssertions",
                  "quoteAssertions",
                ],
                properties: {
                  claimKey: { type: "string" },
                  text: { type: "string" },
                  claimType: {
                    type: "string",
                    enum: [
                      "output",
                      "outcome",
                      "anecdotal",
                      "context",
                      "variance_explanation",
                    ],
                  },
                  evidenceIds: { type: "array", items: { type: "string" } },
                  numericAssertions: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "displayValue",
                        "normalizedValue",
                        "unit",
                        "evidenceId",
                        "metricField",
                      ],
                      properties: {
                        displayValue: { type: "string" },
                        normalizedValue: { type: "number" },
                        unit: { type: "string" },
                        evidenceId: { type: "string" },
                        metricField: {
                          type: "string",
                          enum: [
                            "value",
                            "numerator",
                            "denominator",
                            "baselineValue",
                          ],
                        },
                      },
                    },
                  },
                  quoteAssertions: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["quotedText", "evidenceId"],
                      properties: {
                        quotedText: { type: "string" },
                        evidenceId: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      gaps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["requirementId", "category", "message"],
          properties: {
            requirementId: { type: "string" },
            category: {
              type: "string",
              enum: [
                "missing_evidence",
                "ambiguous_evidence",
                "missing_measurement_context",
                "human_judgment_required",
              ],
            },
            message: { type: "string" },
          },
        },
      },
    },
  };
}

export function staticModeResponse(env: Record<string, string | undefined>) {
  const liveConfig = resolveLiveRouteConfig(env);

  if (liveConfig.ready) {
    return Response.json({
      mode: "live",
      status: "ready",
      message: "Live AI is configured for POST requests.",
      model: liveConfig.model,
    });
  }

  return Response.json({
    mode: "static",
    status: liveConfig.status,
    message: liveConfig.message,
  });
}

export function buildResponsesRequest(input: {
  model: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}): OpenAIRequestBody {
  return {
    model: input.model,
    store: false,
    input: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
    text: {
      format: {
        type: "json_schema",
        name: input.schemaName,
        strict: true,
        schema: input.schema,
      },
    },
  };
}

export async function callOpenAIResponses(input: {
  apiKey: string;
  request: OpenAIRequestBody;
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input.request),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json(
      {
        mode: "live",
        status: "openai_error",
        error: "OpenAI request failed.",
        detail: payload?.error?.message ?? response.statusText,
      },
      { status: 502 },
    );
  }

  return Response.json({
    mode: "live",
    status: "ok",
    response: payload,
  });
}
