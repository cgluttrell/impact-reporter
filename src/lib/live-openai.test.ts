import { describe, expect, it } from "vitest";
import {
  buildResponsesRequest,
  checkLiveRateLimit,
  clientKeyFromHeaders,
  DEFAULT_OPENAI_MODEL,
  evidenceExtractionSchema,
  LIVE_RATE_LIMIT_MAX_REQUESTS,
  LIVE_RATE_LIMIT_WINDOW_MS,
  MAX_LIVE_INPUT_CHARS,
  MAX_SOURCE_ARTIFACT_ID_CHARS,
  resolveLiveRouteConfig,
  staticModeResponse,
  validateLiveRequestBody,
} from "./live-openai";

describe("live OpenAI route helpers", () => {
  it("accepts bounded synthetic note input", () => {
    const result = validateLiveRequestBody({
      sourceArtifactId: "source-nll-note",
      note: "Synthetic note text",
    });

    expect(result).toEqual({
      ok: true,
      sourceArtifactId: "source-nll-note",
      note: "Synthetic note text",
    });
  });

  it("rejects missing sourceArtifactId", () => {
    expect(validateLiveRequestBody({ note: "Synthetic note text" })).toEqual({
      ok: false,
      status: 400,
      error: "sourceArtifactId is required.",
    });
  });

  it("rejects empty notes", () => {
    expect(
      validateLiveRequestBody({
        sourceArtifactId: "source-nll-note",
        note: " ",
      }),
    ).toEqual({
      ok: false,
      status: 400,
      error: "note is required.",
    });
  });

  it("rejects notes over the live input limit", () => {
    const result = validateLiveRequestBody({
      sourceArtifactId: "source-nll-note",
      note: "x".repeat(MAX_LIVE_INPUT_CHARS + 1),
    });

    expect(result).toMatchObject({
      ok: false,
      status: 413,
    });
  });

  it("rejects source artifact IDs over the live input limit", () => {
    const result = validateLiveRequestBody({
      sourceArtifactId: "x".repeat(MAX_SOURCE_ARTIFACT_ID_CHARS + 1),
      note: "Synthetic note text",
    });

    expect(result).toMatchObject({
      ok: false,
      status: 413,
    });
  });

  it("keeps the evidence extraction schema strict-compatible", () => {
    const schema = evidenceExtractionSchema();
    const candidates = schema.properties.candidates as {
      items: {
        required: string[];
        properties: Record<string, unknown>;
      };
    };

    expect(candidates.items.required).toEqual(
      expect.arrayContaining([
        "periodRef",
        "proposedValue",
        "proposedUnit",
        "requiresHumanConfirmation",
      ]),
    );
    expect(candidates.items.properties).toMatchObject({
      periodRef: { type: ["string", "null"] },
      proposedValue: { type: ["number", "null"] },
      proposedUnit: { type: ["string", "null"] },
      requiresHumanConfirmation: { type: "boolean", enum: [true] },
    });
  });

  it("returns friendly static-mode metadata for GET probes", async () => {
    const response = await staticModeResponse({});
    await expect(response.json()).resolves.toMatchObject({
      mode: "static",
      status: "live_disabled",
    });
  });

  it("returns live readiness metadata without exposing secrets", async () => {
    const response = await staticModeResponse({
      IMPACT_REPORTER_LIVE_AI: "enabled",
      OPENAI_API_KEY: "test-key",
      OPENAI_MODEL: "test-model",
    });

    await expect(response.json()).resolves.toEqual({
      mode: "live",
      status: "ready",
      message: "Live AI is configured for POST requests.",
      model: "test-model",
      rateLimit: {
        windowSeconds: LIVE_RATE_LIMIT_WINDOW_MS / 1000,
        maxRequests: LIVE_RATE_LIMIT_MAX_REQUESTS,
      },
    });
  });

  it("derives the client key from Cloudflare or forwarded headers", () => {
    expect(
      clientKeyFromHeaders(new Headers({ "cf-connecting-ip": "203.0.113.9" })),
    ).toBe("203.0.113.9");
    expect(
      clientKeyFromHeaders(
        new Headers({ "x-forwarded-for": "198.51.100.4, 10.0.0.1" }),
      ),
    ).toBe("198.51.100.4");
  });

  it("rate limits live requests by client and window", () => {
    const clientKey = `test-client-${crypto.randomUUID()}`;
    const now = 12345;

    for (let index = 0; index < LIVE_RATE_LIMIT_MAX_REQUESTS; index += 1) {
      expect(checkLiveRateLimit({ clientKey, now })).toMatchObject({
        ok: true,
      });
    }

    expect(checkLiveRateLimit({ clientKey, now })).toMatchObject({
      ok: false,
      status: 429,
    });

    expect(
      checkLiveRateLimit({
        clientKey,
        now: now + LIVE_RATE_LIMIT_WINDOW_MS + 1,
      }),
    ).toMatchObject({
      ok: true,
      remaining: LIVE_RATE_LIMIT_MAX_REQUESTS - 1,
    });
  });

  it("builds Responses payloads with store disabled and strict JSON schema", () => {
    const request = buildResponsesRequest({
      model: "test-model",
      system: "System instruction",
      user: "User input",
      schemaName: "EvidenceExtraction",
      schema: evidenceExtractionSchema(),
    });

    expect(request.store).toBe(false);
    expect(request.text.format).toMatchObject({
      type: "json_schema",
      name: "EvidenceExtraction",
      strict: true,
    });
    expect(request.input).toEqual([
      { role: "system", content: "System instruction" },
      { role: "user", content: "User input" },
    ]);
  });

  it("keeps live AI disabled unless the explicit enable flag is set", () => {
    expect(
      resolveLiveRouteConfig({
        OPENAI_API_KEY: "test-key",
      }),
    ).toMatchObject({
      ready: false,
      status: "live_disabled",
    });
  });

  it("reports a missing key only after live AI is explicitly enabled", () => {
    expect(
      resolveLiveRouteConfig({
        IMPACT_REPORTER_LIVE_AI: "enabled",
      }),
    ).toMatchObject({
      ready: false,
      status: "missing_key",
    });
  });

  it("resolves live route config only with enable flag and server-side key", () => {
    expect(
      resolveLiveRouteConfig({
        IMPACT_REPORTER_LIVE_AI: "enabled",
        OPENAI_API_KEY: "test-key",
      }),
    ).toEqual({
      ready: true,
      apiKey: "test-key",
      model: DEFAULT_OPENAI_MODEL,
    });
  });
});
