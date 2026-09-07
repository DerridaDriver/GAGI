import { randomInt, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const topics = [
  "为什么鬼都是白色的？",
  "为什么程序员喜欢黑色？",
  "为什么猫看不起人？",
  "世界末日为什么总在晚上？",
  "为什么死人从来不迟到？",
  "为什么老板总是最后一个下班？",
] as const;
const groups = ["control", "treatment"] as const;
const writers = ["writer_v1", "writer_v2.1"] as const;
const samplesPerStratum = 5;

type SourceEntry = {
  review_id: string;
  topic: string;
  text: string;
  provenance: {
    group: (typeof groups)[number];
    source_run_id: string;
    source_raw_path: string;
    original_candidate: {
      id: string;
      writer: (typeof writers)[number];
      round: number;
      source_slot: "A" | "B" | "C" | "D";
      thinking_mode: "disabled" | "enabled";
      [key: string]: unknown;
    };
    request_audit: {
      latency_ms: number | null;
      completion_tokens: number | null;
      reasoning_tokens: number | null;
      [key: string]: unknown;
    };
    request_outcome: Record<string, unknown>;
  };
};

type SourceMapping = {
  merged_run_id: string;
  entries: SourceEntry[];
};

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
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

function mappingPathFromArgument(argument: string) {
  const path = resolve(argument);
  return statSync(path).isDirectory() ? resolve(path, "mapping.json") : path;
}

function main() {
  const sourceArgument = process.argv[2];
  if (!sourceArgument) {
    throw new Error(
      "用法：pnpm gold-rush:spot-check <merged mapping.json 或其目录>",
    );
  }

  const sourceMappingPath = mappingPathFromArgument(sourceArgument);
  const source = JSON.parse(
    readFileSync(sourceMappingPath, "utf8"),
  ) as SourceMapping;

  const selected: Array<{
    review_id: string;
    topic: string;
    text: string;
    provenance: SourceEntry["provenance"] & {
      source_merged_review_id: string;
    };
  }> = [];
  const strata: Array<{
    topic: string;
    thinking_condition: "disabled" | "enabled-high";
    writer: (typeof writers)[number];
    available: number;
    sampled: number;
  }> = [];

  for (const topic of topics) {
    for (const group of groups) {
      for (const writer of writers) {
        const pool = source.entries.filter(
          (entry) =>
            entry.topic === topic &&
            entry.provenance.group === group &&
            entry.provenance.original_candidate.writer === writer,
        );
        if (pool.length < samplesPerStratum) {
          throw new Error(
            `stratum 少于 ${samplesPerStratum} 条：${topic} / ${group} / ${writer}，实际 ${pool.length} 条。`,
          );
        }

        const sample = shuffleInPlace([...pool]).slice(0, samplesPerStratum);
        strata.push({
          topic,
          thinking_condition:
            group === "control" ? "disabled" : "enabled-high",
          writer,
          available: pool.length,
          sampled: sample.length,
        });
        selected.push(
          ...sample.map((entry) => ({
            review_id: randomUUID(),
            topic: entry.topic,
            text: entry.text,
            provenance: {
              ...entry.provenance,
              source_merged_review_id: entry.review_id,
            },
          })),
        );
      }
    }
  }

  const expectedCount =
    topics.length * groups.length * writers.length * samplesPerStratum;
  if (selected.length !== expectedCount) {
    throw new Error(
      `抽样数量错误：预期 ${expectedCount}，实际 ${selected.length}。`,
    );
  }
  if (new Set(selected.map((entry) => entry.review_id)).size !== expectedCount) {
    throw new Error("新 review_id 存在重复，已停止写入。");
  }

  const reviewOrder = topics.flatMap((topic) =>
    shuffleInPlace(selected.filter((entry) => entry.topic === topic)),
  );
  const runId = `${timestamp()}-${randomUUID().slice(0, 8)}`;
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const outputDirectory = resolve(
    scriptDirectory,
    `../../experiments/gold-rush-v0-matched-16384/spot-check-120/${runId}`,
  );
  mkdirSync(outputDirectory, { recursive: true });

  const reviewCsv = [
    "review_id,topic,text,rating",
    ...reviewOrder.map((entry) =>
      [entry.review_id, entry.topic, entry.text, ""].map(csvCell).join(","),
    ),
  ].join("\r\n");
  writeFileSync(resolve(outputDirectory, "review.csv"), `${reviewCsv}\r\n`, {
    encoding: "utf8",
    flag: "wx",
  });

  const mapping = {
    experiment: "GAGI Gold Rush v0 Matched 16384 — Spot Check 120",
    spot_check_run_id: runId,
    created_at: new Date().toISOString(),
    source_merged_run_id: source.merged_run_id,
    source_mapping_path: sourceMappingPath,
    sampling: {
      method: "stratified random sample without replacement",
      samples_per_stratum: samplesPerStratum,
      strata_count: strata.length,
      candidate_count: selected.length,
      strata,
    },
    entries: selected,
  };
  writeFileSync(
    resolve(outputDirectory, "mapping.json"),
    `${JSON.stringify(mapping, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" },
  );

  const readme = `# GAGI Gold Rush v0 — Spot Check 120

评审完成前，只打开 \`review.csv\`。

不要打开 \`mapping.json\`、原始 \`raw.json\` 或任何 provenance 文件；这些文件会泄漏 thinking、Writer、round、token 和 latency。

## 评分规则

- **HIT**：真的让我笑了，或者产生明确即时的“草/哈哈哈”反应。
- **MAYBE**：没真正笑，但连接有意思、有潜力。
- **BAD**：不好笑、AI味、硬梗、废话、老套、解释过头等。

第一反应优先。“结构设计得不错”不能自动算 HIT。

只在 \`review.csv\` 的 \`rating\` 列填写 \`HIT\`、\`MAYBE\` 或 \`BAD\`，不要修改其他列。

评审完成后运行：

\`\`\`powershell
pnpm gold-rush:analyze-spot-check "${resolve(outputDirectory, "review.csv")}"
\`\`\`
`;
  writeFileSync(resolve(outputDirectory, "README.md"), readme, {
    encoding: "utf8",
    flag: "wx",
  });

  console.log(`Spot-check：${selected.length} 条候选，${strata.length} 个 strata`);
  console.log(`review.csv：${resolve(outputDirectory, "review.csv")}`);
  console.log(`mapping.json：${resolve(outputDirectory, "mapping.json")}`);
}

main();
