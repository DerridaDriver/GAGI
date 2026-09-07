# GAGI Gold Rush v0

这是 GAGI 0.4 的本地诊断实验，不写入 Supabase。

> Pilot：本目录中的原始 disabled 实验使用 `max_tokens = 800`。它保留为先导数据，不作为 `max_tokens = 4096` matched-control 比较的一部分。

## 生成正式实验

```powershell
pnpm gold-rush:generate
```

正式实验会调用 DeepSeek 48 次并生成 192 条候选。每次运行都会创建新的 `runs/<timestamp>-<id>/`，不会覆盖旧结果。

## 人工盲评

打开新 run 中的 `review.csv`，只在 `rating` 列填写：

- `HIT`
- `MAYBE`
- `BAD`

评审期间不要打开带来源信息的 `raw.json`。`review.md` 可用于辅助阅读，但评分应写回 `review.csv`。

## 分析

```powershell
pnpm gold-rush:analyze experiments/gold-rush-v0/runs/<run-id>/review.csv
```

分析器通过随机 `review_id` 关联同目录的 `raw.json`，恢复 Writer 来源，输出总体、各 Writer、各题目以及 Writer × 题目的描述性统计。每次分析生成新的时间戳 JSON，不覆盖已有结果。

## 小型 dry run

```powershell
pnpm gold-rush:generate --dry-run
```

Dry run 只使用第一个题目、`writer_v1` 和一轮生成，共 1 次 DeepSeek 请求、4 条候选；结果单独写入 `dry-runs/`。
