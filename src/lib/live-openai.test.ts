import { describe, expect, it } from "vitest";
import {
  buildResponsesRequest,
  evidenceExtractionSchema,
  MAX_LIVE_INPUT_CHARS,
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
});
