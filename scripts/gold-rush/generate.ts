import { randomInt, randomUUID } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWriterUserPrompt,
  generateWithWriter,
  WRITER_MAX_TOKENS,
  WRITER_MODEL,
  WRITER_PROVIDER,
  WRITER_THINKING_MODE,
  type WriterReasoningEffort,
  type WriterThinkingMode,
} from "../../lib/deepseek-writer.ts";
import {
  EXPECTED_PROMPT_HASHES,
  loadFrozenWriterPrompts,
} from "./prompt-source.ts";

const topics = [
  "为什么鬼都是白色的？",
  "为什么程序员喜欢黑色？",
  "为什么猫看不起人？",
  "世界末日为什么总在晚上？",
  "为什么死人从来不迟到？",
  "为什么老板总是最后一个下班？",
] as const;
const writers = ["writer_v1", "writer_v2.1"] as const;
const sourceSlots = ["A", "B", "C", "D"] as const;
const fixedLevels = { darkness: 7, absurdity: 7, vulgarity: 5 } as const;
const roundsPerWriter = 4;
const maxAttempts = 3;
const legacyRequestTimeoutMs = 45_000;
const matchedRequestTimeoutMs = 180_000;
const matchedMaxTokens = 16_384;

type Writer = (typeof writers)[number];

type Candidate = {
  id: string;
  review_id: string;
  topic: string;
  darkness: number;
  absurdity: number;
  vulgarity: number;
  writer: Writer;
  round: number;
  source_slot: (typeof sourceSlots)[number];
  text: string;
  provider: typeof WRITER_PROVIDER;
  model: typeof WRITER_MODEL;
  thinking_mode: WriterThinkingMode;
  request_id: string;
  logical_request_id: string;
};

type FailureType = "NONE" | "LENGTH_FAIL" | "API_FAIL";

type RequestAudit = {
  request_id: string;
  logical_request_id: string;
  topic: string;
  writer: Writer;
  round: number;
  attempt: number;
  attempt_number: number;
  thinking_mode: WriterThinkingMode;
  reasoning_effort: WriterReasoningEffort | null;
  max_tokens: number;
  request_timeout_ms: number;
  latency_ms: number | null;
  finish_reason: string | null;
  completion_tokens: number | null;
  reasoning_tokens: number | null;
  reasoning_content_present: boolean | null;
  content_empty: boolean | null;
  status: "succeeded" | "failed";
  failure_type: FailureType;
  error: string | null;
};

type RequestOutcome = {
  logical_request_id: string;
  topic: string;
  writer: Writer;
  round: number;
  status: "SUCCESS" | "LENGTH_FAIL" | "API_FAIL";
  attempts: number;
  successful_request_id: string | null;
};

type ExperimentConfig = {
  name: string;
  directory: string;
  thinkingMode: WriterThinkingMode;
  reasoningEffort: WriterReasoningEffort | null;
  maxTokens: number;
  requestTimeoutMs: number;
};

function loadEnvironment() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(scriptDirectory, "../../.env.local");
  const values: Record<string, string> = {};

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }

  if (!values.DEEPSEEK_API_KEY) {
    throw new Error(".env.local 中缺少 DEEPSEEK_API_KEY。");
  }

  return values;
}

function shuffleInPlace<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1);
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function safeMarkdown(value: string) {
  return value.replaceAll("|", "\\|").replaceAll(/\r?\n/g, "<br>");
}

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function isTransientApiFailure(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") return true;
  if (error instanceof TypeError && error.message === "fetch failed") {
    return true;
  }

  const message = error instanceof Error ? error.message : "";
  const statusMatch = message.match(/status (\d{3})/);
  const status = statusMatch ? Number(statusMatch[1]) : null;
  return status === 429 || (status !== null && status >= 500);
}

async function generateBatch(
  apiKey: string,
  writer: Writer,
  systemPrompt: string,
  topic: string,
  round: number,
  experiment: ExperimentConfig,
  requestAudits: RequestAudit[],
) {
  const userPrompt = buildWriterUserPrompt({ topic, ...fixedLevels });
  const logicalRequestId = randomUUID();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const attemptStartedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      experiment.requestTimeoutMs,
    );
    const requestAudit: RequestAudit = {
      request_id: randomUUID(),
      logical_request_id: logicalRequestId,
      topic,
      writer,
      round,
      attempt,
      attempt_number: attempt,
      thinking_mode: experiment.thinkingMode,
      reasoning_effort: experiment.reasoningEffort,
      max_tokens: experiment.maxTokens,
      request_timeout_ms: experiment.requestTimeoutMs,
      latency_ms: null,
      finish_reason: null,
      completion_tokens: null,
      reasoning_tokens: null,
      reasoning_content_present: null,
      content_empty: null,
      status: "failed",
      failure_type: "API_FAIL",
      error: null,
    };
    requestAudits.push(requestAudit);

    try {
      const jokes = await generateWithWriter(
        apiKey,
        writer,
        systemPrompt,
        userPrompt,
        controller.signal,
        {
          thinkingMode: experiment.thinkingMode,
          reasoningEffort: experiment.reasoningEffort ?? undefined,
          maxTokens: experiment.maxTokens,
          onResponseAudit: (audit) => {
            requestAudit.finish_reason = audit.finishReason;
            requestAudit.completion_tokens = audit.completionTokens;
            requestAudit.reasoning_tokens = audit.reasoningTokens;
            requestAudit.reasoning_content_present =
              audit.reasoningContentPresent;
            requestAudit.content_empty = audit.contentEmpty;
          },
        },
      );

      if (requestAudit.finish_reason === "length") {
        requestAudit.failure_type = "LENGTH_FAIL";
        requestAudit.error = "DeepSeek returned finish_reason=length";
        console.warn(
          `[LENGTH_FAIL] ${writer} | 第 ${round} 轮 | ${topic} | 不重试`,
        );
        return {
          status: "LENGTH_FAIL" as const,
          logicalRequestId,
          attempts: attempt,
        };
      }

      requestAudit.status = "succeeded";
      requestAudit.failure_type = "NONE";
      return {
        status: "SUCCESS" as const,
        jokes,
        requestId: requestAudit.request_id,
        logicalRequestId,
        attempts: attempt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      requestAudit.error = message;

      if (requestAudit.finish_reason === "length") {
        requestAudit.failure_type = "LENGTH_FAIL";
        console.warn(
          `[LENGTH_FAIL] ${writer} | 第 ${round} 轮 | ${topic} | 不重试`,
        );
        return {
          status: "LENGTH_FAIL" as const,
          logicalRequestId,
          attempts: attempt,
        };
      }

      const receivedNormalResponse =
        requestAudit.finish_reason !== null ||
        requestAudit.content_empty !== null;
      const canRetry =
        !receivedNormalResponse && isTransientApiFailure(error);

      if (canRetry && attempt < maxAttempts) {
        console.warn(
          `[暂时性故障，重试 ${attempt}/${maxAttempts}] ${writer} | 第 ${round} 轮 | ${topic} | ${message}`,
        );
        await new Promise((resolveDelay) =>
          setTimeout(resolveDelay, attempt * 1_000),
        );
        continue;
      }

      console.warn(
        `[API_FAIL] ${writer} | 第 ${round} 轮 | ${topic} | ${message}${canRetry ? " | 已耗尽重试" : " | 不重试"}`,
      );
      return {
        status: "API_FAIL" as const,
        logicalRequestId,
        attempts: attempt,
      };
    } finally {
      requestAudit.latency_ms = Date.now() - attemptStartedAt;
      clearTimeout(timeout);
    }
  }

  throw new Error(`${writer} 第 ${round} 轮进入了不可达状态。`);
}

function getExperimentConfig(): ExperimentConfig {
  const isMatchedControl = process.argv.includes("--matched-control");
  const isMatchedTreatment = process.argv.includes("--matched-treatment");
  const isLegacyThinking = process.argv.includes("--thinking-enabled");
  const selectedCount = [
    isMatchedControl,
    isMatchedTreatment,
    isLegacyThinking,
  ].filter(Boolean).length;

  if (selectedCount > 1) {
    throw new Error("实验模式参数冲突；每次只能选择一个实验组。");
  }

  if (isMatchedControl) {
    return {
      name: "GAGI Gold Rush v0 Matched Control",
      directory: "gold-rush-v0-matched-16384/control-disabled",
      thinkingMode: "disabled",
      reasoningEffort: null,
      maxTokens: matchedMaxTokens,
      requestTimeoutMs: matchedRequestTimeoutMs,
    };
  }

  if (isMatchedTreatment) {
    return {
      name: "GAGI Gold Rush v0 Matched Treatment",
      directory: "gold-rush-v0-matched-16384/treatment-enabled-high",
      thinkingMode: "enabled",
      reasoningEffort: "high",
      maxTokens: matchedMaxTokens,
      requestTimeoutMs: matchedRequestTimeoutMs,
    };
  }

  if (isLegacyThinking) {
    return {
      name: "GAGI Gold Rush v0-T",
      directory: "gold-rush-v0-thinking",
      thinkingMode: "enabled",
      reasoningEffort: null,
      maxTokens: WRITER_MAX_TOKENS,
      requestTimeoutMs: legacyRequestTimeoutMs,
    };
  }

  return {
    name: "GAGI Gold Rush v0",
    directory: "gold-rush-v0",
    thinkingMode: WRITER_THINKING_MODE,
    reasoningEffort: null,
    maxTokens: WRITER_MAX_TOKENS,
    requestTimeoutMs: legacyRequestTimeoutMs,
  };
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const experiment = getExperimentConfig();
  const selectedTopics = isDryRun ? topics.slice(0, 1) : topics;
  const selectedWriters = isDryRun ? writers.slice(0, 1) : writers;
  const selectedRounds = isDryRun ? 1 : roundsPerWriter;
  const expectedLogicalRequestCount =
    selectedTopics.length * selectedWriters.length * selectedRounds;
  const environment = loadEnvironment();
  const prompts = loadFrozenWriterPrompts();
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const outputRoot = resolve(
    scriptDirectory,
    `../../experiments/${experiment.directory}/${isDryRun ? "dry-runs" : "runs"}`,
  );
  const runId = `${timestamp()}-${randomUUID().slice(0, 8)}`;
  const runDirectory = resolve(outputRoot, runId);
  mkdirSync(outputRoot, { recursive: true });
  mkdirSync(runDirectory);

  const candidates: Candidate[] = [];
  const requestAudits: RequestAudit[] = [];
  const requestOutcomes: RequestOutcome[] = [];

  try {
    for (const topic of selectedTopics) {
      for (const writer of selectedWriters) {
        for (let round = 1; round <= selectedRounds; round += 1) {
          console.log(
            `[生成] ${topic} | ${writer} | 第 ${round}/${selectedRounds} 轮`,
          );
          const result = await generateBatch(
            environment.DEEPSEEK_API_KEY,
            writer,
            prompts[writer],
            topic,
            round,
            experiment,
            requestAudits,
          );

          requestOutcomes.push({
            logical_request_id: result.logicalRequestId,
            topic,
            writer,
            round,
            status: result.status,
            attempts: result.attempts,
            successful_request_id:
              result.status === "SUCCESS" ? result.requestId : null,
          });

          if (result.status !== "SUCCESS") continue;

          for (const [index, text] of result.jokes.entries()) {
            const reviewId = randomUUID();
            candidates.push({
              id: reviewId,
              review_id: reviewId,
              topic,
              ...fixedLevels,
              writer,
              round,
              source_slot: sourceSlots[index],
              text,
              provider: WRITER_PROVIDER,
              model: WRITER_MODEL,
              thinking_mode: experiment.thinkingMode,
              request_id: result.requestId,
              logical_request_id: result.logicalRequestId,
            });
          }
        }
      }
    }

    if (requestOutcomes.length !== expectedLogicalRequestCount) {
      throw new Error(
        `逻辑请求数量错误：预期 ${expectedLogicalRequestCount}，实际 ${requestOutcomes.length}。`,
      );
    }

    const successfulRequestCount = requestOutcomes.filter(
      (request) => request.status === "SUCCESS",
    ).length;
    if (candidates.length !== successfulRequestCount * 4) {
      throw new Error(
        `成功请求与候选数量不一致：${successfulRequestCount} 个成功请求，${candidates.length} 条候选。`,
      );
    }

    loadFrozenWriterPrompts();

    const raw = {
      experiment: experiment.name,
      run_id: runId,
      dry_run: isDryRun,
      created_at: new Date().toISOString(),
      config: {
        topics: selectedTopics,
        writers: selectedWriters,
        rounds_per_writer: selectedRounds,
        planned_requests: expectedLogicalRequestCount,
        candidates_per_request: 4,
        ...fixedLevels,
        provider: WRITER_PROVIDER,
        model: WRITER_MODEL,
        thinking_mode: experiment.thinkingMode,
        reasoning_effort: experiment.reasoningEffort,
        max_tokens: experiment.maxTokens,
        request_timeout_ms: experiment.requestTimeoutMs,
        reasoning_content: {
          saved: false,
          responses_present: requestAudits.filter(
            (request) => request.reasoning_content_present,
          ).length,
          successful_responses: requestAudits.filter(
            (request) => request.status === "succeeded",
          ).length,
        },
        prompt_sha256: EXPECTED_PROMPT_HASHES,
      },
      requests: requestAudits,
      request_outcomes: requestOutcomes,
      candidates,
    };
    writeFileSync(
      resolve(runDirectory, "raw.json"),
      `${JSON.stringify(raw, null, 2)}\n`,
      { encoding: "utf8", flag: "wx" },
    );

    const reviewOrder = selectedTopics.flatMap((topic) =>
      shuffleInPlace(
        candidates
          .filter((candidate) => candidate.topic === topic)
          .map((candidate) => ({
            review_id: candidate.id,
            topic: candidate.topic,
            text: candidate.text,
          })),
      ),
    );
    const reviewCsv = [
      "review_id,topic,text,rating",
      ...reviewOrder.map((item) =>
        [item.review_id, item.topic, item.text, ""].map(csvCell).join(","),
      ),
    ].join("\r\n");
    writeFileSync(resolve(runDirectory, "review.csv"), `${reviewCsv}\r\n`, {
      encoding: "utf8",
      flag: "wx",
    });

    const reviewMarkdown = [
      `# ${experiment.name} — Blind Review`,
      "",
      "只在 Rating 列填写 `HIT`、`MAYBE` 或 `BAD`。不要查看 raw.json。",
      "",
      ...selectedTopics.flatMap((topic) => {
        const items = reviewOrder.filter((item) => item.topic === topic);
        return [
          `## ${topic}`,
          "",
          "| Review ID | 笑话 | Rating |",
          "| --- | --- | --- |",
          ...items.map(
            (item) =>
              `| ${item.review_id} | ${safeMarkdown(item.text)} |  |`,
          ),
          "",
        ];
      }),
    ].join("\n");
    writeFileSync(
      resolve(runDirectory, "review.md"),
      `${reviewMarkdown}\n`,
      { encoding: "utf8", flag: "wx" },
    );

    console.log(`完成：${candidates.length} 条候选`);
    console.log(
      `thinking=${experiment.thinkingMode}; reasoning_effort=${experiment.reasoningEffort ?? "n/a"}; max_tokens=${experiment.maxTokens}; request_timeout_ms=${experiment.requestTimeoutMs}`,
    );
    console.log(
      `请求结果：SUCCESS=${successfulRequestCount}; LENGTH_FAIL=${requestOutcomes.filter((request) => request.status === "LENGTH_FAIL").length}; API_FAIL=${requestOutcomes.filter((request) => request.status === "API_FAIL").length}`,
    );
    console.log(
      `reasoning_content=${requestAudits.filter((request) => request.reasoning_content_present).length}/${requestAudits.filter((request) => request.reasoning_content_present !== null).length} 个已返回 attempt（仅记录是否存在，未保存内容）`,
    );
    console.log(`输出目录：${runDirectory}`);

    if (
      isDryRun &&
      requestOutcomes.some((request) => request.status === "LENGTH_FAIL")
    ) {
      console.error("Dry run 出现 LENGTH_FAIL；已停止，不应继续正式实验。");
      process.exitCode = 2;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    writeFileSync(
      resolve(runDirectory, "error.json"),
      `${JSON.stringify(
        {
          experiment: experiment.name,
          run_id: runId,
          error: message,
          completed_candidates: candidates.length,
          requests: requestAudits,
        },
        null,
        2,
      )}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    throw error;
  }
}

await main();
