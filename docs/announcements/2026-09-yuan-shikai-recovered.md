# 🏺 GAGI 考古重大进展：失踪的“袁世凯”原始记录已找回

2026-09-14 · PROJECT HISTORY / DOCUMENTATION UPDATE

GAGI 项目最古老的传说终于有物证了。

按作者回忆，在 0.1 阶段，我们向原生 DeepSeek API 问：

> 为什么鬼都是白色的？

四个候选里出现了 D：

> **因为袁世凯说过：鬼要是不白，怎么在黑白片里客串**

后来，这条输出成了项目的精神图腾之一。我们开始研究为什么模型会偶然产生这种让人愿意选中的回答。错误权威引用、历史人物突入、时空错位、“白色鬼”与“黑白片”的重新解释，以及短而不解释的表达，是我们对它的阅读，不是已经验证的幽默机制。

接下来，项目经历了 sampling experiments、Semantic Escape、QLoRA、Teacher Factory、WHY→BECAUSE collapse、Route Balancing、Template Diversification、Closure optimization、Human Preference、Mechanism Search 和 Rare-Hit Search，留下了大量实验文件。目的之一，就是弄清楚：

**为什么原生 API 当初能偶然说出这种东西，而我们越认真教，它有时反而越不会说。**

更荒谬的是，原始“袁世凯”记录后来还找不到了。现在，截图考古成功。完整的四个候选一起找回，可以直接看到这句话是当时页面中的 D，不只是后来凭记忆拼出来的孤立句子。

**袁世凯回来了。至于 GAGI 什么时候回来，不知道。**

## 原始截图

![完整 GAGI 0.1 四候选与选中 D 的页面](../assets/gagi-01-yuan-shikai-original.png)

截图按原文件逐字节复制，没有重新压缩或裁剪。A/B/C/D 与选择提示均保留。

## 证据确认了什么

- 页面上 D 的原文是：“因为袁世凯说过：鬼要是不白，怎么在黑白片里客串”。引用保留截图原文，不补句末标点。
- D 处于选中状态。
- 页面提示：“已记录：你选择了 D。GAGI 0.1 暂时不会真的保存它。”这解释了为何页面点选本身不能证明存在数据库投票记录。
- 截图没有显示题面、生成时间、provider、模型名称、thinking 配置或 prompt 版本。
- 题面“为什么鬼都是白色的？”、DeepSeek API、`deepseek-v4-flash`、thinking disabled，以及后来称为 `writer_v1` 的背景来自作者本次提供的历史回忆，未由图片独立验证。未找回这一条的原始 API 响应或请求日志。
- 这是历史证据找回，不是生成能力提升，也没有统计重要性或机制因果结论。

## 数据身份与边界

**EARLY ORIGIN ARTIFACT / PROJECT PREHISTORY SAMPLE**

不补写为正式 GOLD，不加入 Gold11 或 accepted corpus，不更改 Human labels、实验统计、历史快照或任何既有研究结论。截图中的点选是这份历史记录的一部分，不自动转成新的训练标签。

## 公告发布状态

仓库在本次检查时未开启 GitHub Discussions，因此按任务要求将公告保存于此；没有修改 repository settings，也没有创建 Release、tag 或软件版本。后续可手工开启 Discussions 并复制本文发布。

[中文 README：项目起源](../../README.md#-项目起源失踪的袁世凯回来了) · [English README: Project prehistory](../../README_EN.md#-project-prehistory-yuan-shikai-returns)
