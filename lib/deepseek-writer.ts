export const WRITER_PROVIDER = "deepseek";
export const WRITER_MODEL = "deepseek-v4-flash";
export const WRITER_THINKING_MODE = "disabled";
export const WRITER_MAX_TOKENS = 800;
export type WriterThinkingMode = "disabled" | "enabled";
export type WriterReasoningEffort = "low" | "high" | "max";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

type DeepSeekResponse = {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
  }>;
  usage?: {
    completion_tokens?: number;
    reasoning_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
};

type WriterInput = {
  topic: string;
  darkness: number;
  absurdity: number;
  vulgarity: number;
};

type WriterRequestOptions = {
  thinkingMode?: WriterThinkingMode;
  reasoningEffort?: WriterReasoningEffort;
  maxTokens?: number;
  onResponseAudit?: (audit: {
    thinkingMode: WriterThinkingMode;
    reasoningEffort: WriterReasoningEffort | null;
    maxTokens: number;
    finishReason: string | null;
    completionTokens: number | null;
    reasoningTokens: number | null;
    reasoningContentPresent: boolean;
    contentEmpty: boolean;
  }) => void;
};

export function buildWriterUserPrompt(input: WriterInput) {
  return `题目：${input.topic}\n黑度：${input.darkness}/10\n荒诞度：${input.absurdity}/10\n恶俗度：${input.vulgarity}/10`;
}

export async function generateWithWriter(
  apiKey: string,
  promptVersion: string,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
  options: WriterRequestOptions = {},
) {
  const thinkingMode = options.thinkingMode ?? WRITER_THINKING_MODE;
  const reasoningEffort = options.reasoningEffort ?? null;
  const maxTokens = options.maxTokens ?? WRITER_MAX_TOKENS;
  const deepSeekResponse = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: WRITER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: thinkingMode },
      ...(reasoningEffort === null
        ? {}
        : { reasoning_effort: reasoningEffort }),
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
      stream: false,
    }),
    cache: "no-store",
    signal,
  });

  if (!deepSeekResponse.ok) {
    throw new Error(
      `DeepSeek ${promptVersion} request failed with status ${deepSeekResponse.status}`,
    );
  }

  const deepSeekData = (await deepSeekResponse.json()) as DeepSeekResponse;
  const choice = deepSeekData.choices?.[0];
  const message = choice?.message;
  const content = message?.content;
  const reasoningTokens =
    deepSeekData.usage?.completion_tokens_details?.reasoning_tokens ??
    deepSeekData.usage?.reasoning_tokens ??
    null;

  options.onResponseAudit?.({
    thinkingMode,
    reasoningEffort,
    maxTokens,
    finishReason: choice?.finish_reason ?? null,
    completionTokens: deepSeekData.usage?.completion_tokens ?? null,
    reasoningTokens,
    reasoningContentPresent:
      typeof message?.reasoning_content === "string" &&
      message.reasoning_content.length > 0,
    contentEmpty: typeof content !== "string" || !content.trim(),
  });

  if (typeof content !== "string" || !content.trim()) {
    throw new Error(
      `DeepSeek ${promptVersion} returned empty content (${choice?.finish_reason ?? "unknown"})`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`DeepSeek ${promptVersion} returned invalid JSON`);
  }

  const jokes =
    typeof parsed === "object" &&
    parsed !== null &&
    "jokes" in parsed &&
    Array.isArray(parsed.jokes)
      ? parsed.jokes
      : null;

  if (
    !jokes ||
    jokes.length !== 4 ||
    !jokes.every((joke) => typeof joke === "string" && joke.trim())
  ) {
    throw new Error(
      `DeepSeek ${promptVersion} returned an invalid jokes array`,
    );
  }

  return jokes.map((joke) => (joke as string).trim());
}
