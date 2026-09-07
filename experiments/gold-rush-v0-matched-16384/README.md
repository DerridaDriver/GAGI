# GAGI Gold Rush v0 — Matched Control 16384

这是 GAGI 0.4 的本地诊断实验，不写入 Supabase。Control 与 Treatment 除 thinking 设置外，沿用 Gold Rush v0 的全部冻结条件。

- Control：`thinking = disabled`、不发送 `reasoning_effort`
- Treatment：`thinking = enabled`、`reasoning_effort = high`
- 两组：`max_tokens = 16384`、`request_timeout_ms = 180000`

正式 GAGI 0.4 网站保持 `thinking = disabled`、`max_tokens = 800`、timeout `45000 ms`。

## 失败与重试规则

- `finish_reason = length` 记录为 `LENGTH_FAIL`，不重试、不生成候选。
- 正常返回但 content 为空或无法通过现有 JSON 合约时，记录为 `API_FAIL`，不重试、不生成候选。
- 只有 timeout / AbortError、HTTP 429、HTTP 5xx 和暂时性网络错误最多重试 3 次。
- `raw.json` 保留每个 attempt 的 latency/token 审计，以及每个逻辑请求的最终 outcome。
- `review.csv` 只包含成功请求实际生成的候选。

## Dry run

```powershell
pnpm gold-rush:matched-control --dry-run
pnpm gold-rush:matched-treatment --dry-run
```

## 完整实验（确认 dry run 后才运行）

```powershell
pnpm gold-rush:matched-control
pnpm gold-rush:matched-treatment
```

Analyzer 同时输出系统完成率（SUCCESS / LENGTH_FAIL / API_FAIL / success rate）和成功候选的 HIT / MAYBE / BAD：

```powershell
pnpm gold-rush:analyze experiments/gold-rush-v0-matched-16384/<group>/runs/<run-id>/review.csv
```

两组正式 run 完成后，创建统一盲评文件：

```powershell
pnpm gold-rush:merge experiments/gold-rush-v0-matched-16384/control-disabled/runs/<control-run-id> experiments/gold-rush-v0-matched-16384/treatment-enabled-high/runs/<treatment-run-id>
```

人工评完 merged `review.csv` 后，按照该目录 README 中的命令运行 `gold-rush:analyze-merged`。

## 120 条快速抽查

从 merged mapping 创建每个 topic × thinking × writer 各 5 条的严格平衡子样本：

```powershell
pnpm gold-rush:spot-check experiments/gold-rush-v0-matched-16384/merged-review/<run-id>/mapping.json
```

人工评完 spot-check `review.csv` 后，按照该目录 README 中的命令运行 `gold-rush:analyze-spot-check`。
