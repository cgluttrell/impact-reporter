export const MAX_LIVE_INPUT_CHARS = 6000;

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
            periodRef: { type: "string" },
            proposedValue: { type: "number" },
            proposedUnit: { type: "string" },
            ambiguities: { type: "array", items: { type: "string" } },
            requiresHumanConfirmation: { const: true },
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
