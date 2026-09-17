# Contributing / 参与贡献

欢迎中文或英文反馈。GAGI 是个人幽默偏好研究原型；当前公开内容包括 Web 应用、早期实验工具和部分研究报告，完整 Local Lab 尚未公开。

## 可以怎样参与

- Bug、文档错误、复算不一致：提交 [Issue](https://github.com/DerridaDriver/GAGI/issues)。请注明文件、commit、复现步骤和预期结果。
- 幽默偏好、方法学问题、研究想法：使用 [Discussions](https://github.com/DerridaDriver/GAGI/discussions)。新实验或较大功能改动请先讨论范围。
- Pull request 请说明问题、改动与验证结果。保持改动集中，不附带真实凭据、私人数据库、provider 原始日志或未经许可的语料。

## 验证与历史记录

文档与报告相关改动先运行离线检查：

```sh
python scripts/publication/verify.py
python scripts/publication/secret_scan.py
```

Web 代码改动使用 Node.js 24.x 和 package.json 指定的 pnpm，安装依赖后运行 `pnpm lint` 与 `pnpm build`。需要运行 Web 时请使用自己的环境配置，参考 [DEPLOYMENT.md](DEPLOYMENT.md)；调用生成接口可能产生费用。

`reports/history/` 是冻结快照，请勿直接改写；纠错请增加说明，并保留来源和原始标签。区分观察、解释和因果结论。`ALL_BAD`、未评分、失效或已终止的实验不能被悄悄改成成功或负例。

## License

提交内容须为你有权贡献的材料；请标明第三方来源与许可证。除非明确另行声明并达成安排，有意提交并纳入项目的贡献按 [Apache-2.0](LICENSE) 授权。许可范围见 [LICENSING.md](LICENSING.md)。

## English

Chinese and English contributions are welcome. Report reproducible bugs, documentation errors or discrepancies in published calculations through Issues; use Discussions for research ideas and questions about humor preference. Discuss substantial changes before implementation.

Keep pull requests focused and describe the problem, changes and validation. Run the offline publication checks above for documentation/report changes; run `pnpm lint` and `pnpm build` for Web changes with Node.js 24.x and the pinned pnpm version. Use your own configuration for runtime checks; generation may incur API charges.

Do not rewrite frozen `reports/history/` snapshots, relabel unreviewed samples, hide negative results or overstate causal findings. Record corrections separately. Do not submit credentials, private databases, raw provider logs or materials you lack permission to contribute. Identify third-party sources and their licenses. Contributions intentionally submitted for inclusion are under Apache-2.0 unless explicitly stated and separately arranged; see the licensing scope above.
