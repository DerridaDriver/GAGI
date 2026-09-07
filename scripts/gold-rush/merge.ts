import { randomInt, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXPECTED_PROMPT_HASHES } from "./prompt-source.ts";

const expectedTopics = [
  "为什么鬼都是白色的？",
  "为什么程序员喜欢黑色？",
  "为什么猫看不起人？",
  "世界末日为什么总在晚上？",
  "为什么死人从来不迟到？",
  "为什么老板总是最后一个下班？",
] as const;

type Candidate = {
  id: string;
  review_id: string;
  topic: string;
  darkness: number;
  absurdity: number;
  vulgarity: number;
  writer: "writer_v1" | "writer_v2.1";
  round: number;
  source_slot: "A" | "B" | "C" | "D";
  text: string;
  provider: string;
  model: string;
  thinking_mode: "disabled" | "enabled";
  request_id: string;
  logical_request_id: string;
};

type RequestAudit = Record<string, unknown> & {
  request_id: string;
  logical_request_id: string;
};

type RequestOutcome = Record<string, unknown> & {
  logical_request_id: string;
};

type RawRun = {
  experiment: string;
  run_id: string;
  dry_run: boolean;
  config: {
    topics: string[];
    provider: string;
    model: string;
    thinking_mode: "disabled" | "enabled";
    reasoning_effort: "high" | null;
    max_tokens: number;
    request_timeout_ms: number;
    prompt_sha256: typeof EXPECTED_PROMPT_HASHES;
  };
  requests: RequestAudit[];
  request_outcomes: RequestOutcome[];
  candidates: Candidate[];
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

function rawPathFromArgument(argument: string) {
  const path = resolve(argument);
  return statSync(path).isDirectory() ? resolve(path, "raw.json") : path;
}

function loadRun(argument: string) {
  const rawPath = rawPathFromArgument(argument);
  return {
    rawPath,
    run: JSON.parse(readFileSync(rawPath, "utf8")) as RawRun,
  };
}

function assertRun(
  run: RawRun,
  expectedThinking: "disabled" | "enabled",
  expectedEffort: "high" | null,
) {
  if (run.dry_run) throw new Error(`${run.run_id} 是 dry run，不能合并。`);
  if (run.config.thinking_mode !== expectedThinking) {
    throw new Error(`${run.run_id} thinking_mode 不符合合并组别。`);
  }
  if (run.config.reasoning_effort !== expectedEffort) {
    throw new Error(`${run.run_id} reasoning_effort 不符合合并组别。`);
  }
  if (
    run.config.max_tokens !== 16_384 ||
    run.config.request_timeout_ms !== 180_000
  ) {
    throw new Error(`${run.run_id} 不是 16384/180000 matched run。`);
  }
  if (run.config.model !== "deepseek-v4-flash") {
    throw new Error(`${run.run_id} model 不匹配。`);
  }
  if (JSON.stringify(run.config.topics) !== JSON.stringify(expectedTopics)) {
    throw new Error(`${run.run_id} topics 不匹配。`);
  }
  if (
    JSON.stringify(run.config.prompt_sha256) !==
    JSON.stringify(EXPECTED_PROMPT_HASHES)
  ) {
    throw new Error(`${run.run_id} Prompt SHA-256 不匹配。`);
  }
}

function main() {
  const [controlArgument, treatmentArgument] = process.argv.slice(2);
  if (!controlArgument || !treatmentArgument) {
    throw new Error(
      "用法：pnpm gold-rush:merge <control run目录或raw.json> <treatment run目录或raw.json>",
    );
  }

  const control = loadRun(controlArgument);
  const treatment = loadRun(treatmentArgument);
  assertRun(control.run, "disabled", null);
  assertRun(treatment.run, "enabled", "high");

  const mergedRunId = `${timestamp()}-${randomUUID().slice(0, 8)}`;
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const outputDirectory = resolve(
    scriptDirectory,
    `../../experiments/gold-rush-v0-matched-16384/merged-review/${mergedRunId}`,
  );
  mkdirSync(outputDirectory, { recursive: true });

  const sources = [
    { group: "control" as const, ...control },
    { group: "treatment" as const, ...treatment },
  ];
  const entries = sources.flatMap(({ group, rawPath, run }) => {
    const audits = new Map(
      run.requests.map((request) => [request.request_id, request]),
    );
    const outcomes = new Map(
      run.request_outcomes.map((outcome) => [
        outcome.logical_request_id,
        outcome,
      ]),
    );

    return run.candidates.map((candidate) => {
      const requestAudit = audits.get(candidate.request_id);
      const requestOutcome = outcomes.get(candidate.logical_request_id);
      if (!requestAudit || !requestOutcome) {
        throw new Error(`${run.run_id} candidate provenance 不完整。`);
      }

      return {
        review_id: randomUUID(),
        topic: candidate.topic,
        text: candidate.text,
        provenance: {
          group,
          source_run_id: run.run_id,
          source_raw_path: rawPath,
          original_candidate: candidate,
          request_audit: requestAudit,
          request_outcome: requestOutcome,
        },
      };
    });
  });

  const reviewOrder = expectedTopics.flatMap((topic) =>
    shuffleInPlace(entries.filter((entry) => entry.topic === topic)),
  );
  if (reviewOrder.length !== entries.length) {
    throw new Error("存在不属于冻结 topic 集的候选，已停止合并。");
  }

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
    experiment: "GAGI Gold Rush v0 Matched 16384 — Merged Blind Review",
    merged_run_id: mergedRunId,
    created_at: new Date().toISOString(),
    source_runs: {
      control: { run_id: control.run.run_id, raw_path: control.rawPath },
      treatment: {
        run_id: treatment.run.run_id,
        raw_path: treatment.rawPath,
      },
    },
    candidate_count: entries.length,
    entries,
  };
  writeFileSync(
    resolve(outputDirectory, "mapping.json"),
    `${JSON.stringify(mapping, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" },
  );

  const readme = `# GAGI Gold Rush v0 — Merged Blind Review

评审完成前，只打开 \`review.csv\`。

不要打开 \`mapping.json\`、各组 \`raw.json\` 或任何 provenance 文件；这些文件会泄漏 thinking、Writer、round、token 和 latency。

## 评分规则

- **HIT**：真的让我笑了，或者出现明确即时“草 / 哈哈哈”的反应。
- **MAYBE**：没有真正笑，但连接有意思、有潜力。
- **BAD**：没反应、AI 味、硬梗、废话、老套或不好笑。

“结构看起来不错”不能自动算 HIT。第一反应优先。

只在 \`review.csv\` 的 \`rating\` 列填写 \`HIT\`、\`MAYBE\` 或 \`BAD\`，不要修改其他列。

评审完成后运行：

\`\`\`powershell
pnpm gold-rush:analyze-merged "${resolve(outputDirectory, "review.csv")}"
\`\`\`
`;
  writeFileSync(resolve(outputDirectory, "README.md"), readme, {
    encoding: "utf8",
    flag: "wx",
  });

  console.log(`Merged blind review：${entries.length} 条候选`);
  console.log(`review.csv：${resolve(outputDirectory, "review.csv")}`);
  console.log(`mapping.json：${resolve(outputDirectory, "mapping.json")}`);
}

main();
