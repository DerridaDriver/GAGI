# GAGI Gold Rush v0 — Matched Control 4096

这是 GAGI 0.4 的本地诊断实验，不写入 Supabase。两组都从头生成，除 thinking 设置外沿用 Gold Rush v0 的全部冻结条件：

> Pilot：本目录保留 4096-token dry runs 和失败 run 作为技术记录，不再作为正式 matched experiment。当前 `gold-rush:matched-*` 命令已指向独立的 16384-token 实验目录。

- Control：`thinking = disabled`、不发送 `reasoning_effort`、`max_tokens = 4096`
- Treatment：`thinking = enabled`、`reasoning_effort = high`、`max_tokens = 4096`
- 两组实验请求 timeout：`request_timeout_ms = 180000`

正式网站继续使用共享 writer 的默认配置：`thinking = disabled`、`max_tokens = 800`。

历史 dry run 与失败 run 分别保留在：

- `control-disabled/dry-runs/<run-id>/`
- `treatment-enabled-high/dry-runs/<run-id>/`
- `treatment-enabled-high/runs/<run-id>/error.json`

本 Pilot 不再提供生成命令，避免误将当前 16384-token 命令当作 4096-token 复现命令。

`raw.json` 的 `requests` 保存每次请求的 thinking、reasoning effort、token 上限、finish reason 与 API 返回的 token usage，但不保存 reasoning content。`review.csv` 只包含 `review_id,topic,text,rating`。
