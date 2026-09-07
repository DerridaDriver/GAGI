import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const allowedRatings = ["HIT", "MAYBE", "BAD"] as const;
type Rating = (typeof allowedRatings)[number];

type MappingEntry = {
  review_id: string;
  topic: string;
  text: string;
  provenance: {
    group: "control" | "treatment";
    original_candidate: {
      writer: "writer_v1" | "writer_v2.1";
    };
  };
};

type RatedEntry = MappingEntry & { rating: Rating };

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

function summarize(items: RatedEntry[]) {
  const total = items.length;
  const HIT = items.filter((item) => item.rating === "HIT").length;
  const MAYBE = items.filter((item) => item.rating === "MAYBE").length;
  const BAD = items.filter((item) => item.rating === "BAD").length;
  return {
    total,
    HIT,
    MAYBE,
    BAD,
    HIT_rate: total === 0 ? 0 : HIT / total,
    MAYBE_rate: total === 0 ? 0 : MAYBE / total,
    BAD_rate: total === 0 ? 0 : BAD / total,
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

function main() {
  const reviewPathArgument = process.argv[2];
  if (!reviewPathArgument) {
    throw new Error(
      "用法：pnpm gold-rush:analyze-merged <merged review.csv 路径>",
    );
  }

  const reviewPath = resolve(reviewPathArgument);
  const reviewDirectory = dirname(reviewPath);
  const mapping = JSON.parse(
    readFileSync(resolve(reviewDirectory, "mapping.json"), "utf8"),
  ) as {
    experiment?: string;
    merged_run_id?: string;
    spot_check_run_id?: string;
    entries: MappingEntry[];
  };
  const byId = new Map(
    mapping.entries.map((entry) => [entry.review_id, entry]),
  );
  const rows = parseCsv(readFileSync(reviewPath, "utf8"));
  const header = rows.shift();
  if (header?.join(",") !== "review_id,topic,text,rating") {
    throw new Error("review.csv 表头必须是 review_id,topic,text,rating。");
  }

  const rated: RatedEntry[] = [];
  const seen = new Set<string>();
  let unrated = 0;
  for (const row of rows) {
    if (row.length !== 4) throw new Error("review.csv 存在列数不为 4 的行。");
    const [reviewId, topic, text, rawRating] = row;
    const entry = byId.get(reviewId);
    if (!entry) throw new Error(`mapping.json 中不存在 review_id：${reviewId}`);
    if (seen.has(reviewId)) throw new Error(`review_id 重复：${reviewId}`);
    if (entry.topic !== topic || entry.text !== text) {
      throw new Error(`review_id 的 topic/text 被修改：${reviewId}`);
    }
    seen.add(reviewId);

    const rating = rawRating.trim().toUpperCase();
    if (!rating) {
      unrated += 1;
      continue;
    }
    if (!allowedRatings.includes(rating as Rating)) {
      throw new Error(`非法 rating：${rating}`);
    }
    rated.push({ ...entry, rating: rating as Rating });
  }

  if (seen.size !== mapping.entries.length) {
    throw new Error(
      `review.csv 与 mapping.json 数量不一致：${seen.size}/${mapping.entries.length}。`,
    );
  }
  if (unrated > 0) throw new Error(`仍有 ${unrated} 条候选未评分。`);

  const thinkingGroups = ["control", "treatment"] as const;
  const writers = ["writer_v1", "writer_v2.1"] as const;
  const topics = [...new Set(rated.map((item) => item.topic))];
  const analysis = {
    run_id: mapping.spot_check_run_id ?? mapping.merged_run_id,
    analyzed_at: new Date().toISOString(),
    overall: summarize(rated),
    by_thinking: Object.fromEntries(
      thinkingGroups.map((group) => [
        group === "control" ? "disabled" : "enabled-high",
        summarize(rated.filter((item) => item.provenance.group === group)),
      ]),
    ),
    by_writer: Object.fromEntries(
      writers.map((writer) => [
        writer,
        summarize(
          rated.filter(
            (item) => item.provenance.original_candidate.writer === writer,
          ),
        ),
      ]),
    ),
    by_thinking_writer: Object.fromEntries(
      thinkingGroups.flatMap((group) =>
        writers.map((writer) => [
          `${group === "control" ? "disabled" : "enabled-high"} + ${writer}`,
          summarize(
            rated.filter(
              (item) =>
                item.provenance.group === group &&
                item.provenance.original_candidate.writer === writer,
            ),
          ),
        ]),
      ),
    ),
    by_topic_thinking: Object.fromEntries(
      topics.map((topic) => [
        topic,
        {
          disabled: summarize(
            rated.filter(
              (item) =>
                item.topic === topic && item.provenance.group === "control",
            ),
          ),
          "enabled-high": summarize(
            rated.filter(
              (item) =>
                item.topic === topic && item.provenance.group === "treatment",
            ),
          ),
        },
      ]),
    ),
  };

  printSummary("总体", analysis.overall);
  for (const [label, summary] of Object.entries(analysis.by_thinking)) {
    printSummary(label, summary);
  }
  for (const [label, summary] of Object.entries(analysis.by_writer)) {
    printSummary(label, summary);
  }
  for (const [label, summary] of Object.entries(analysis.by_thinking_writer)) {
    printSummary(label, summary);
  }
  for (const [topic, summaries] of Object.entries(analysis.by_topic_thinking)) {
    printSummary(`${topic} | disabled`, summaries.disabled);
    printSummary(`${topic} | enabled-high`, summaries["enabled-high"]);
  }

  const isSpotCheck = mapping.experiment?.includes("Spot Check") ?? false;
  const outputPath = resolve(
    reviewDirectory,
    `${isSpotCheck ? "spot-check-analysis" : "merged-analysis"}-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}-${randomUUID().slice(0, 8)}.json`,
  );
  writeFileSync(outputPath, `${JSON.stringify(analysis, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  console.log(`${isSpotCheck ? "Spot-check" : "Merged"} analysis 已保存：${outputPath}`);
}

main();
