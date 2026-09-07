import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const allowedRatings = ["HIT", "MAYBE", "BAD"] as const;
type Rating = (typeof allowedRatings)[number];

type RawCandidate = {
  id: string;
  topic: string;
  writer: "writer_v1" | "writer_v2.1";
};

type RatedCandidate = RawCandidate & { rating: Rating };

type RawRequestOutcome = {
  logical_request_id: string;
  topic: string;
  writer: "writer_v1" | "writer_v2.1";
  round: number;
  status: "SUCCESS" | "LENGTH_FAIL" | "API_FAIL";
  attempts: number;
  successful_request_id: string | null;
};

type RawRequestAudit = {
  request_id: string;
  logical_request_id: string;
  topic: string;
  writer: "writer_v1" | "writer_v2.1";
  latency_ms: number | null;
  completion_tokens: number | null;
  reasoning_tokens: number | null;
};

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  if (quoted) throw new Error("review.csv 存在未闭合的引号。");
  return rows;
}

function summarize(items: RatedCandidate[]) {
  const hit = items.filter((item) => item.rating === "HIT").length;
  const maybe = items.filter((item) => item.rating === "MAYBE").length;
  const bad = items.filter((item) => item.rating === "BAD").length;
  const total = items.length;

  return {
    total,
    HIT: hit,
    MAYBE: maybe,
    BAD: bad,
    HIT_rate: total === 0 ? 0 : hit / total,
    MAYBE_rate: total === 0 ? 0 : maybe / total,
    BAD_rate: total === 0 ? 0 : bad / total,
  };
}

function percentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function printSummary(label: string, summary: ReturnType<typeof summarize>) {
  console.log(
    `${label}: total=${summary.total}, HIT=${summary.HIT} (${percentage(summary.HIT_rate)}), MAYBE=${summary.MAYBE} (${percentage(summary.MAYBE_rate)}), BAD=${summary.BAD} (${percentage(summary.BAD_rate)})`,
  );
}

function summarizeCompletion(items: RawRequestOutcome[]) {
  const successfulRequests = items.filter(
    (item) => item.status === "SUCCESS",
  ).length;
  const lengthFail = items.filter(
    (item) => item.status === "LENGTH_FAIL",
  ).length;
  const apiFail = items.filter((item) => item.status === "API_FAIL").length;
  const totalRequests = items.length;

  return {
    total_requests: totalRequests,
    successful_requests: successfulRequests,
    LENGTH_FAIL: lengthFail,
    API_FAIL: apiFail,
    success_rate:
      totalRequests === 0 ? 0 : successfulRequests / totalRequests,
  };
}

function printCompletionSummary(
  label: string,
  summary: ReturnType<typeof summarizeCompletion>,
) {
  console.log(
    `${label}: requests=${summary.total_requests}, successful=${summary.successful_requests}, LENGTH_FAIL=${summary.LENGTH_FAIL}, API_FAIL=${summary.API_FAIL}, success_rate=${percentage(summary.success_rate)}`,
  );
}

function mean(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], quantile: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * quantile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function summarizePerformance(
  outcomes: RawRequestOutcome[],
  allAttempts: RawRequestAudit[],
) {
  const logicalRequestIds = new Set(
    outcomes.map((outcome) => outcome.logical_request_id),
  );
  const attempts = allAttempts.filter((attempt) =>
    logicalRequestIds.has(attempt.logical_request_id),
  );
  const attemptLatencies = attempts.flatMap((attempt) =>
    attempt.latency_ms === null ? [] : [attempt.latency_ms],
  );
  const logicalLatencies = outcomes.map((outcome) =>
    attempts
      .filter(
        (attempt) =>
          attempt.logical_request_id === outcome.logical_request_id &&
          attempt.latency_ms !== null,
      )
      .reduce((sum, attempt) => sum + (attempt.latency_ms ?? 0), 0),
  );
  const totalCompletionTokens = attempts.reduce(
    (sum, attempt) => sum + (attempt.completion_tokens ?? 0),
    0,
  );
  const totalReasoningTokens = attempts.reduce(
    (sum, attempt) => sum + (attempt.reasoning_tokens ?? 0),
    0,
  );

  return {
    logical_requests: outcomes.length,
    attempts: attempts.length,
    mean_latency_ms: mean(logicalLatencies),
    p50_latency_ms: percentile(logicalLatencies, 0.5),
    p95_latency_ms: percentile(logicalLatencies, 0.95),
    max_latency_ms:
      logicalLatencies.length === 0 ? null : Math.max(...logicalLatencies),
    attempt_mean_latency_ms: mean(attemptLatencies),
    attempt_p50_latency_ms: percentile(attemptLatencies, 0.5),
    attempt_p95_latency_ms: percentile(attemptLatencies, 0.95),
    attempt_max_latency_ms:
      attemptLatencies.length === 0 ? null : Math.max(...attemptLatencies),
    total_completion_tokens: totalCompletionTokens,
    mean_completion_tokens:
      outcomes.length === 0 ? null : totalCompletionTokens / outcomes.length,
    total_reasoning_tokens: totalReasoningTokens,
    mean_reasoning_tokens:
      outcomes.length === 0 ? null : totalReasoningTokens / outcomes.length,
  };
}

function printPerformanceSummary(
  label: string,
  summary: ReturnType<typeof summarizePerformance>,
) {
  const display = (value: number | null) =>
    value === null ? "N/A" : value.toFixed(2);
  console.log(
    `${label}: mean_latency_ms=${display(summary.mean_latency_ms)}, p50_latency_ms=${display(summary.p50_latency_ms)}, p95_latency_ms=${display(summary.p95_latency_ms)}, max_latency_ms=${display(summary.max_latency_ms)}, total_completion_tokens=${summary.total_completion_tokens}, mean_completion_tokens=${display(summary.mean_completion_tokens)}, total_reasoning_tokens=${summary.total_reasoning_tokens}, mean_reasoning_tokens=${display(summary.mean_reasoning_tokens)}`,
  );
}

function main() {
  const reviewPathArgument = process.argv[2];
  if (!reviewPathArgument) {
    throw new Error("用法：pnpm gold-rush:analyze <review.csv 路径>");
  }

  const reviewPath = resolve(reviewPathArgument);
  const runDirectory = dirname(reviewPath);
  const rawPath = resolve(runDirectory, "raw.json");
  const raw = JSON.parse(readFileSync(rawPath, "utf8")) as {
    experiment: string;
    run_id: string;
    candidates: RawCandidate[];
    requests?: RawRequestAudit[];
    request_outcomes?: RawRequestOutcome[];
  };
  const csvRows = parseCsv(readFileSync(reviewPath, "utf8"));
  const header = csvRows.shift();
  if (header?.join(",") !== "review_id,topic,text,rating") {
    throw new Error("review.csv 表头必须是 review_id,topic,text,rating。");
  }

  const rawById = new Map(raw.candidates.map((candidate) => [candidate.id, candidate]));
  const seenIds = new Set<string>();
  const rated: RatedCandidate[] = [];
  let unratedCount = 0;

  for (const row of csvRows) {
    if (row.length !== 4) throw new Error("review.csv 存在列数不为 4 的行。");
    const [reviewId, topic, , rawRating] = row;
    const source = rawById.get(reviewId);
    if (!source) throw new Error(`review_id 不存在于 raw.json：${reviewId}`);
    if (seenIds.has(reviewId)) throw new Error(`review_id 重复：${reviewId}`);
    if (topic !== source.topic) throw new Error(`review_id 的 topic 不匹配：${reviewId}`);
    seenIds.add(reviewId);

    const rating = rawRating.trim().toUpperCase();
    if (!rating) {
      unratedCount += 1;
      continue;
    }
    if (!allowedRatings.includes(rating as Rating)) {
      throw new Error(`非法 rating：${rating}`);
    }
    rated.push({ ...source, rating: rating as Rating });
  }

  if (seenIds.size !== raw.candidates.length) {
    throw new Error(
      `review.csv 与 raw.json 数量不一致：${seenIds.size}/${raw.candidates.length}。`,
    );
  }
  if (unratedCount > 0) {
    throw new Error(`仍有 ${unratedCount} 条候选未评分。`);
  }

  const writers = ["writer_v1", "writer_v2.1"] as const;
  const topics = [
    ...new Set(
      raw.request_outcomes?.map((item) => item.topic) ??
        rated.map((item) => item.topic),
    ),
  ];
  const ratingAnalysis = {
    overall: summarize(rated),
    by_writer: Object.fromEntries(
      writers.map((writer) => [
        writer,
        summarize(rated.filter((item) => item.writer === writer)),
      ]),
    ),
    by_topic: Object.fromEntries(
      topics.map((topic) => [
        topic,
        {
          overall: summarize(rated.filter((item) => item.topic === topic)),
          by_writer: Object.fromEntries(
            writers.map((writer) => [
              writer,
              summarize(
                rated.filter(
                  (item) => item.topic === topic && item.writer === writer,
                ),
              ),
            ]),
          ),
        },
      ]),
    ),
  };
  const systemCompletion = raw.request_outcomes
    ? {
        overall: summarizeCompletion(raw.request_outcomes),
        by_writer: Object.fromEntries(
          writers.map((writer) => [
            writer,
            summarizeCompletion(
              raw.request_outcomes!.filter((item) => item.writer === writer),
            ),
          ]),
        ),
        by_topic: Object.fromEntries(
          topics.map((topic) => [
            topic,
            summarizeCompletion(
              raw.request_outcomes!.filter((item) => item.topic === topic),
            ),
          ]),
        ),
      }
    : null;
  const systemPerformance =
    raw.request_outcomes && raw.requests
      ? {
          overall: summarizePerformance(raw.request_outcomes, raw.requests),
          by_writer: Object.fromEntries(
            writers.map((writer) => {
              const outcomes = raw.request_outcomes!.filter(
                (item) => item.writer === writer,
              );
              return [writer, summarizePerformance(outcomes, raw.requests!)];
            }),
          ),
        }
      : null;
  const analysis = {
    experiment: raw.experiment,
    run_id: raw.run_id,
    analyzed_at: new Date().toISOString(),
    system_completion: systemCompletion,
    latency_and_tokens: systemPerformance,
    successful_candidate_ratings: ratingAnalysis,
  };

  if (systemCompletion) {
    console.log("系统完成率");
    printCompletionSummary("总体", systemCompletion.overall);
    for (const writer of writers) {
      printCompletionSummary(writer, systemCompletion.by_writer[writer]);
    }
  } else {
    console.log("系统完成率：旧 raw.json 无 request_outcomes，无法计算。");
  }

  if (systemPerformance) {
    console.log("延迟与 Token（逻辑请求延迟为其全部 attempts 的耗时之和）");
    printPerformanceSummary("总体", systemPerformance.overall);
    for (const writer of writers) {
      printPerformanceSummary(writer, systemPerformance.by_writer[writer]);
    }
  } else {
    console.log("延迟与 Token：旧 raw.json 无完整 request audit，无法计算。");
  }

  console.log("成功候选人工评分");
  printSummary("总体", ratingAnalysis.overall);
  for (const writer of writers) {
    printSummary(writer, ratingAnalysis.by_writer[writer]);
  }
  for (const topic of topics) {
    printSummary(`题目：${topic}`, ratingAnalysis.by_topic[topic].overall);
    for (const writer of writers) {
      printSummary(
        `  ${writer}`,
        ratingAnalysis.by_topic[topic].by_writer[writer],
      );
    }
  }

  const timestamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");
  const analysisPath = resolve(
    runDirectory,
    `analysis-${timestamp}-${randomUUID().slice(0, 8)}.json`,
  );
  writeFileSync(analysisPath, `${JSON.stringify(analysis, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  console.log(`分析已保存：${analysisPath}`);
}

main();
