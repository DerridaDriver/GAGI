# GAGI Gold Rush v0-T — Thinking Control

这是 GAGI 0.4 的本地诊断实验。它复用 Gold Rush v0 的题目、Writer、参数、Prompt、模型、请求和解析逻辑，唯一变量是 DeepSeek Chat Completions 的 `thinking.type` 从 `disabled` 改为 `enabled`。

正式 GAGI 0.4 与原 Gold Rush v0 默认保持 `disabled`。

## Thinking enabled dry run

```powershell
pnpm gold-rush:generate-thinking --dry-run
```

Dry run 为 1 个 topic × 1 个 writer × 1 轮，共 1 次请求、4 条候选，写入独立的 `dry-runs/`。

## Thinking enabled 正式实验

```powershell
pnpm gold-rush:generate-thinking
```

正式实验为 6 个 topic × 2 个 writer × 4 轮 × 4 条，共 48 次请求、192 条候选，写入独立的 `runs/`。不要与 `experiments/gold-rush-v0/` 下的 disabled baseline 混用。

## 评审和分析

只在 `review.csv` 的 `rating` 列填写 `HIT`、`MAYBE` 或 `BAD`。评审文件不含 Writer、thinking mode、round、source slot、reasoning content、provider 或 model。

```powershell
pnpm gold-rush:analyze experiments/gold-rush-v0-thinking/runs/<实际 run-id>/review.csv
```

`raw.json` 会记录 `thinking_mode: enabled` 以及 reasoning content 是否出现，但不会保存 reasoning content 本身。
