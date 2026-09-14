中文 | [English](README_EN.md)

# GAGI

**General Artificial Gag Intelligence / 通用人工笑话智能**

我们想训练一个真正符合人类个人幽默偏好的笑话模型。

到目前为止，我们主要学会了几十种把它训练得更不好笑的方法。

**这是一个仍在进行中的研究项目。我们没有解决幽默生成；失败结果和方法学修正本身，就是项目的主要产出之一。** 项目名也是个笑话，不是 AGI 宣言。

## 为什么做这个项目

我们希望模型从极薄的 setup（题面）出发，完成一个简短的语义重新解释，让一个真实的人觉得：这值得模型学习。生成“结构上像笑话的东西”是另一回事；过去的实验反复让我们撞上这一区别。

项目逐渐从“试着在 prompt 里解释幽默”，转向一个工作方向：

**Teacher proposes. Human selects. Student internalizes.**

**Teacher 负责突变，人类负责选择，训练负责遗传。**

这还只是研究方向，不是已经验证的解决方案。这里的 Human Preference 很窄，也很个人化，不代表所有人的笑点。

## 当前状态

- 研究原型，核心问题尚未解决。
- 没有可用于生产的 Joke Judge。最近几轮本地 Writer pilot 已完成并停止；继续实验需要另行决定。
- Production Web 与 Local Lab 分开。本仓库包含 Web 应用、早期实验工具，以及部分公开研究报告归档，不包含完整的本地训练和生成环境。
- 负结果、主动终止的 wave、失效观察，以及后来对旧结果的重新解释，都有意保留。
- 最新 pilot 中，8 个 setup 有 6 个找到获得 Human 认可的最终样本。但对于“更深的搜索本身是否起了决定性作用”，预注册结论仍为 **INCONCLUSIVE**。

历史报告以[逐字节保持一致的快照](reports/source-manifest.json)保存，保留原来的术语与结论，包括后来在下文中被加以限定的说法。请先阅读[归档说明](reports/README.md)，不要把旧报告中的建议直接当作项目当前决策。

## 🏺 项目起源：失踪的“袁世凯”回来了

GAGI 最初并不是从一套幽默理论开始的。按作者找回的早期测试背景，在 0.1 阶段，我们只是向原生 DeepSeek API 问了一句：

> 为什么鬼都是白色的？

四个候选里，前三条在我们看来都偏典型的脑筋急转弯式回答。第四条突然变成了：

> **因为袁世凯说过：鬼要是不白，怎么在黑白片里客串**

这条输出后来成了 GAGI 的“创世神话”之一。它出现在 QLoRA、Teacher Factory、Route Balancing、Closure 和 Mechanism Search 之前，没有经过后来的复杂流水线。它只是自己出现了。

后来我们开始认真研究：**为什么这种东西偶尔会自然出现，以及怎样让模型更稳定地产生我们真正愿意让它学习的笑话。** 经历了后面时间线中的种种实验，原始“袁世凯”记录自己却失踪了。现在，历史截图重新被找回。

**袁世凯回来了。模型还没有。**

![GAGI 0.1 的完整四候选与 D 被选中的原始截图](docs/assets/gagi-01-yuan-shikai-original.png)

> GAGI 0.1 原始 UI 记录，完整保留 A/B/C/D；D 即“袁世凯”样本。页面注明：“已记录：你选择了 D。GAGI 0.1 暂时不会真的保存它。”

这是 **EARLY ORIGIN ARTIFACT / PROJECT PREHISTORY SAMPLE**，不是新的实验结论或正式 GOLD。截图确认候选原文、D 的点选与页面版本；题面及 DeepSeek／后来称为 `writer_v1` 的 prompt 背景来自作者的历史回忆，未由这张截图独立验证，也未恢复原始 API 响应。“错误权威、时空错位”是对笑点的解释，不是已验证的机制。[找回公告与证据说明](docs/announcements/2026-09-yuan-shikai-recovered.md)

## 实验时间线

以下顺序遵循已记录的实验沿革。除非另有说明，历史 **useful（有用）** 指 `KEEP + GOLD`；后来的 groupwise winner 和目标偏好认可标签，是不同的测量。

### 0.1 — 首次真实 API 生成

按作者回忆，此时接入了 DeepSeek API，使用后来称为 `writer_v1` 的早期 prompt；测试“为什么鬼都是白色的？”时出现了“袁世凯”回答。正式的 generations/votes 保存尚未接入。[找回的截图](docs/assets/gagi-01-yuan-shikai-original.png)直接显示 0.1 页面及投票不会真正保存的提示；该条的 API／prompt 元数据未恢复。它作为项目起源记录保留，不加入后续实验计数。

### 早期采样：Controlled Madness

`SOBER`、`TIPSY`、`DRUNK`、`MANIAC` 四档，各评审 30 条：**共 120 条，HIT 和 MAYBE 均为 0**。

观察：提高采样随机性，没有在这轮测试中产生有用输出。解释：更高的 token-level entropy 没有带来我们想要的有效语义多样性；但这些标签本身并不直接测量语义多样性。[Human 结果](reports/history/00-controlled-madness.md)

### Semantic Escape

`FORBID_DIRECT` 和 `DIVERGE_SYNTH` 试图跳出第一联想。**计划 60 条 candidate，其中 59 条被评为 BAD，1 条未评分；已评分输出中，有用样本为 0。** 旧 DRUNK 对照的 30 条评分不算在这 60 条里。

Prompt 改变了表面行为，却没有改善观察到的 Human Value。我们将其理解为语义漂移，而不是有效幽默；这不证明所有“跳出联想”的方法都不可能成功。缺失的那条评分也不能悄悄补成 BAD。[评分分析](reports/history/01-semantic-escape.md)

### Gold11 QLoRA

早期本地 QLoRA 实验使用了 **11 条 Human Gold**。Checkpoint 对比让我们看到了风格习得与实例记忆的区别：

- step 20：在 11 个训练 setup 上，精确复现为 **1/11**；held-out 输出平均长度从 **191.7** 降至 **7.15** 个字符。
- step 50 和 100：训练集精确复现达到 **11/11**，held-out 中的泄漏也增加了。

模型先学会了短、突然、不解释，随后开始记住实例。这既不证明早期 checkpoint 好笑，也不证明风格迁移就是目标 taste 的迁移。[Checkpoint 指标](reports/history/02-gold11-checkpoint-metrics.json)

### Teacher Factory v0

**180 条 raw candidates → 42 条进入 Human 终审 → 19 KEEP、0 GOLD**，其余 23 条为 SKIP。这是第一轮明显有效的 Teacher 数据生产：增加了 19 条 Human 接受的 Silver，而不是认证了 19 个“客观好笑”的笑话。

当时的流程使用了机器过滤和 shortlist，因此终审通过率不能当作原始生成分布的无偏接受率。[生成指标](reports/history/03-teacher-factory-metrics.json) · [Human 评审](reports/history/03-teacher-factory-review.json)

### 0.8 — Wave 1

**100 个冻结 setup、800 条 raw candidates、120 条 Human 评审：110 SKIP、9 KEEP、1 GOLD。有用率：10/120 = 8.33%。**

规模扩大后，WHY → BECAUSE 结构坍缩暴露出来。后续沿生成链路核查发现，**Teacher 生成的 198/200 个 setup 属于 WHY family（99%）**。Wave 1 标签后来保留作诊断，标记 `do_not_promote=true`，没有被悄悄加入 accepted corpus。[评审报告](reports/history/04-wave1-review.md) · [生成链路剖析](reports/history/05-08a-structural-autopsy.md)

### 0.8A — Structural Proxy Collapse Autopsy

在进入 Setup Potential Gate 之前，setup pool 就已经被 WHY 占据。Gate 看起来不是主要垄断的制造者：WHY 占比从 **gate input 的 98.56% 变为 gate pass 的 98.47%**。但输入中只有 3 个非 WHY setup，限制了反事实比较。

解释：candidate 中大量因果式回答，很大程度上是 Teacher setup generation 的下游结果。要修复的是结构垄断，不是禁止 WHY 或 BECAUSE。[剖析报告](reports/history/05-08a-structural-autopsy.md)

### 0.8B — Route-Balanced Teacher

8 个粗粒度 route 生成了 **64 个冻结 setup**。在进入 Human 评审的候选中：

| Writer arm | 已评审 | 有用 | 有用率 |
|---|---:|---:|---:|
| BASELINE | 46 | 18 | 39.13% |
| ROUTE_AWARE | 45 | 12 | 26.67% |

BASELINE 成为当时协议下的 empirical champion。ROUTE_AWARE 提高了机器 Closure 指标，Human 结果却更差。这是小样本、经过筛选的比较，不是普适的 prompt 排名。[Human 评审与模板审计](reports/history/06-08b-human-review.md)

一条历史正例，后来成了重新辨认目标偏好的重要节点：

> 如何把河流折叠起来？<br>
> 用等高线给它打个蝴蝶结

Human 后来明确区分了这种聪明、诗意的语义重新解释，与项目真正想学习的地狱感／越界感。历史标签 `GOLD` 保留，同时记录后来的 `CLEVER_BUT_NOT_TARGET` 解释。我们曾把 cleverness 当成比它实际更接近目标 taste 的东西。[后续剖析](reports/history/15-09e-autopsy.md)

### 0.8C — Template Diversification

**46 条已评审、6 条有用、有用率 13.04%**，6 条均为 KEEP。Template diversity 提高了，观察到的 Human Value 却比 0.8B BASELINE 更低。

Route diversity、template diversity 与 Human Value 不是可以互换的目标。硬性模板配额实现了结构目标，却伴随更差的人类偏好结果；这并不能单独识别“多样性”的普适因果效应。[Human 分析](reports/history/07-08c-human-review.md)

### 0.8D — Pragmatic Slot Preservation

恢复后的评审队列有 **58 条已评审、5 KEEP、0 GOLD：有用率 8.62%**。机器 Closure 再次上升。

| 实验 | 机器 Closure 通过率 | Human 有用率 |
|---|---:|---:|
| 0.8B BASELINE | 152/250 = 60.80% | 18/46 = 39.13% |
| 0.8C | 176/240 = 73.33% | 6/46 = 13.04% |
| 0.8D | 199/256 = 77.73% | 5/58 = 8.62% |

在这几轮里，结构代理指标越来越强，Human Value 却没有跟上：Closure 越高，人类有用率反而越低。但各轮分母、gate 和筛选流程不同，这只是描述性趋势，不是普适规律，也不是干净的因果比较。旧报告中的推断统计原样保留；本 README 不把这些经过筛选、跨轮次的比较当作普遍有效性的证明。[恢复后的 Human 评审](reports/history/08-08d-human-review.md)

### 值得保留的工程失败

这些故障与模型质量结论分开记录：

- **JSON response_format 集成 HTTP 400：**原始 Closure 的 47 次尝试失败。恢复请求暴露了 provider 对显式 JSON 指令的要求。响应格式兼容性修复与 Closure 判断逻辑分开记录。[事故记录](reports/history/08-08d-integration-recovery.md)
- **Shortlist Selector Collapse：**0.8D 最初的 2 条 finalists 被标记失效，没有悄悄复用。Deterministic S1 recovery 产生了 58 条 finalists；source-slot 选择效应仍是解释限制。[恢复记录](reports/history/08-08d-selector-recovery.md)
- **Classifier 匹配优先级：**`称为什么` 被其中的 `为什么` 子串误判。针对 route classifier 的局部修复单独版本化，没有伪装成生成能力提升。[模板恢复记录](reports/history/07-08c-template-recovery.md)
- 失败尝试、恢复链路和失效 artifact 都保留在 Local Lab。本仓库只发布经过审计的报告快照，不包含 provider 原始日志。

### 0.9 — Human-Value Autopsy

恢复的数据集包含 **1,999 条统一 candidate/anchor records**，其中 **368 条已评审：81 positive、287 negative**。这些总数包含 11 条 Human anchors，不代表 1,999 次独立 Human 判断。

按最初规则，只能恢复 **25 条 same-setup preference pairs**。这些历史数据不足以支持立刻训练一个可信的 Joke Judge。[数据集摘要](reports/history/09-human-value-dataset.json) · [初始 pair 摘要](reports/history/09-initial-pairwise.json)

### Anchor Re-review 与 Pairwise Recovery

Anchor re-review 完成 **120 条评分：53 SKIP、49 KEEP、18 GOLD**。记录中的精确一致率为 **97/120（80.83%）**。但 Human 随后指出自己记得很多历史题目。因此，test-retest／可靠性解释标记为 **MEMORY_CONTAMINATED**，不能作为偏好稳定性的强独立验证。[原始复评报告](reports/history/10-anchor-rereview.md)

Pairwise Recovery 完成 **120 条评审：20 KEEP、100 SKIP**，得到 **来自 15 个 setup 的 46 条 pairs**。由于旧题记忆污染和偏好富集抽样，这批数据仍为 **AUXILIARY / RESEARCH ONLY**，不能当作干净的新训练数据，也不能用于估计总体接受率。[恢复报告](reports/history/11-pairwise-recovery.md)

### 0.9B — Fresh Preference Arena

**64 个 fresh setups × 4 条 candidates**，得到 **35 个 winner setups、29 个 ALL_BAD、105 条 derived pairs**。

这是第一批 fresh、same-setup Human Preference：没有审美 shortlist，并且**按本地协议**没有历史旧题记忆污染。这不意味着能够检测所有外部记忆或语义近似。

真正产生 ranking preference 的单位是 **35 个 setup**，不是 105 个独立样本。同组 3 条 pairs 共享 winner 和 setup。ALL_BAD 保留为组级拒绝信号，不拆成 4 条独立负标签。[分析报告](reports/history/12-09b-fresh-preference.md)

### 0.9C — Human 主动终止 Scale-Up

Development 计划 **128 个 setup**，但填到 **27 个就停止了：14 winner、13 ALL_BAD**。

状态：**ABORTED_BY_HUMAN_DISTRIBUTION_REJECTION**。大量输出结构正确，却只是普通、安全、轻巧的 generic cleverness。这是对目标分布的拒绝，不是应该藏起来的“没填完”。独立的 64 题 holdout 在评审前取消，不是仍然有效的已验证 evaluation set。未评审样本不能标为负例。[终止记录](reports/history/13-09c-abort-status.json)

原始状态文件同时保留了 Human 最初口述的 26 和实际持久化的 27 条记录；Human 后来确认 26 是口误，实际完成数为 27。

### 题材分布错位与 0.9D-A — Thematic Prior Recovery

修好了结构多样性，并没有修好题材分布。Human 将目标生态位描述为更阴暗、病态、令人不自在、接近禁忌的语义重新解释。但这只是对 taste 的假设，不是生成配方：**黑暗题材不等于地狱笑话。**

0.9D-A 只改变 setup thematic prior，保留 BASELINE Writer。准备了 **24 个 setup / 96 条 candidates**，却在 **4 个 setup 后停止：1 winner、3 ALL_BAD，20 个未评审**。

状态：**ABORTED_BY_THEMATIC_STEREOTYPE_COLLAPSE**。Human 观察到生成迅速退回熟悉的“死刑犯型”原型。后续审计发现，整批有 4 个字面上的死刑犯 setup，其中 3 个集中在最先评审的 4 个位置。这支持 Human 最初的接触体验，不意味着全部 24 题都是同一种题材。[终止记录](reports/history/14-09da-abort-status.json) · [后续审计](reports/history/15-09e-autopsy.md)

### 0.9E — Gold Mechanism Autopsy

逐条拆解了 **11 条 Human Gold** 的 semantic transformation，并明确加入 clever-but-not-target 对照。提出 2 个多样本机制族，6 条仍为 singleton。Ordinary-to-transgressive 假设为 **PARTIAL**，不是全部 Gold 共享的必要条件。

Compression、surprise、frame shift、analogy 和 category substitution 同样存在于非目标对照中。这次剖析产出的是假设，不是已经证明的 taste formula。API 调用为 0，没有训练模型。[剖析报告](reports/history/15-09e-autopsy.md)

### 0.9F — Mechanism Transfer Writer Pilot

**16 个 setup**，每组 **2 条历史 BASELINE control + 2 条 MECHANISM_SEARCH treatment**：

- Winner setups：**2**；ALL_BAD：**14**。
- BASELINE wins：**2**；MECHANISM_SEARCH wins：**0**。
- 在揭示 arm 身份前记录的 Human global feedback：**WORSE**。

正式预注册 verdict 仍为 **INCONCLUSIVE**，因为产生 winner 的 setup 太少。另一个层面的工程决策是 **MECHANISM_SEARCH_V0 = REJECTED_FOR_CONTINUATION**。统计分类与“不再继续投入”的决定不是一回事。没有为了凑到阈值而扩大样本。[分析报告](reports/history/16-09f-analysis.md) · [工程决策](reports/history/16-09f-engineering-decision.json)

### 0.9G — Rare-Hit Search Capacity Pilot

**8 个 fresh setups × 16 条 BASELINE candidates = 128 条 candidates**。Setup Teacher 复用已有的 0.9D-A thematic prior；Writer prompt 与采样配置保持冻结。每个 setup 通过 4 次独立上下文请求、每次 4 条 siblings 生成；不声称这 16 条是 IID 样本。

Human tournament 覆盖所有通过技术验证的候选：**32 次初赛选择**，随后进行适用的决赛比较和最终 winner 目标偏好标注。最终为 **7 个 winner、1 个 FINAL_ALL_BAD**。

为本次公开发布，Human 澄清了历史 `TARGET_HIT` 的实际含义：**WORTH_LEARNING——“值得模型学习，我希望它多产出这样的东西”**，而不是“它此刻真的把我逗笑了”。原始标签和报告保持不变。

| 最终结果 | Setup 数 |
|---|---:|
| TARGET_HIT，解释为 WORTH_LEARNING | **6/8** |
| CLEVER_ONLY | 1/8 |
| FINAL_ALL_BAD | 1/8 |

| 冻结评审顺序的前缀 | 最终确认的 target winner 已位于该前缀的 setup 数 |
|---|---:|
| @4 | 3/8 |
| @8 | 4/8 |
| @12 | 4/8 |
| @16 | 6/8 |

这是最终 winner 的回溯位置曲线。其他早期晋级样本没有 target 标签，不能当作 target 负例。这不是对每个前缀都独立决赛并标注的反事实实验。

**预注册 verdict：INCONCLUSIVE。** 只有 1 个 setup 满足冻结条件“首批 ALL_BAD，后续 TARGET_HIT”，而支持该结论至少需要 2 个。没有因为看到 6 个认可样本就放宽规则。

**观察：**在这批 setup 条件下，冻结的 BASELINE 分布似乎能够产出 Human 认可的目标样本，但本轮没有证明更深搜索是其因果原因。Setup prior 的变化，也使我们不能把与 0.9F 的差异单独归因于搜索深度。API attempts：**50**；technical retries：**2**，均为同 setup 内精确重复。没有训练模型。[报告](reports/history/17-09g-analysis.md) · [机器可读摘要](reports/history/17-09g-analysis.json)

## 哪些尝试失败了

| 实验 | 干预 | 机器／结构结果 | Human 结果 | 本项目中的教训 |
|---|---|---|---|---|
| Controlled Madness | 提高采样随机性 | 采样更随机 | 0/120 positive | 这里缺的不是 entropy |
| Semantic Escape | 跳出第一联想 | 表面行为改变 | 已评分中 0/59 有用；1 条缺失 | 走远了，也可能只是漂移 |
| 0.8A → 0.8B | 平衡粗粒度 route | 修复 WHY 垄断 | BASELINE 18/46 有用 | 结构覆盖改善了这条 pipeline，但没有定义 taste |
| 0.8C | 更强的模板多样性约束 | Template entropy 上升 | 6/46 有用 | Proxy 改善伴随 Human Value 下降 |
| 0.8D | 更强的 Closure／slot 检查 | Closure 77.73% | 5/58 有用 | Closure 没有识别人类真正想要的东西 |
| 0.9D-A | 显式题材 conditioning | 回到熟悉的题材原型 | 4/24 后终止 | 只有黑暗题材还不够 |
| 0.9F | 抽象机制提示 | 未使用机器评分 | Treatment 0 胜；WORSE | 没有支持继续使用该 contract 的正信号 |
| 0.9G | 增加冻结 BASELINE 搜索 | 128 条均进入 Human tournament | 6/8 WORTH_LEARNING | 找到了目标样本；搜索深度的因果作用未解决 |

## 到目前为止学到了什么

在本项目范围内，我们反复看到：

- 不同词语 ≠ 不同语义。
- 不同语义 ≠ 幽默。
- Route diversity ≠ target taste。
- Template diversity ≠ Human Value。
- 更高的 structural closure ≠ 更高的 Human Value。
- 黑暗题材 ≠ 地狱笑话。
- Cleverness ≠ target taste。

对这位 Human evaluator 而言，通过选择与认可表达偏好，比写出一套能可靠指导生成的幽默理论更容易。这些是项目内的经验，不是已经确立的普适规律。

## 当前工作假设

不要试图在 prompt 里完整定义幽默。接下来值得研究的是：

**Writer = mutation · Human = selection · Training = inheritance**

这里的“突变”指提出候选变体，不是说已经实现了遗传算法。未来可能研究：通过 Human curation、SFT 或 preference learning，能否把偶尔出现的 WORTH_LEARNING 样本推向 Writer 分布的中心？目前这些 pilot 既没有确立“低概率”假设，也没有证明分布迁移能够成功。本 README 不意味着自动启动下一轮实验或训练。

## 仓库导航

| 路径 | 实际内容 |
|---|---|
| [app/](app/) | Production Web 页面与 API routes |
| [lib/](lib/) | Writer 集成、服务端 Supabase 访问、session／rate-limit 工具 |
| [supabase/](supabase/) | Schema 与 migrations，不含数据库 dump 或 credential |
| [scripts/gold-rush/](scripts/gold-rush/) | 早期生成和分析工具 |
| [experiments/](experiments/) | 已有的早期 Gold Rush 实验文档；本地 runs 被忽略 |
| [reports/](reports/) | 经过审计、逐字节保持一致的部分 Local Lab 报告与汇总快照 |
| [scripts/publication/](scripts/publication/) | 离线归档、hash、链接与发布安全检查 |

Local Lab 的 `teacher`、`training`、`experiments` 和 corpus 状态位于本 Git 仓库之外。这里没有虚构一个根目录训练 pipeline，也没有上传模型权重。[来源 manifest](reports/source-manifest.json)记录逻辑来源与 hash，不公开本机绝对根路径。

Web 配置见[部署说明](DEPLOYMENT.md)、[环境变量占位示例](.env.example)和[package scripts](package.json)。请使用自己的凭据，不要提交已填入凭据的环境文件。运行 Web 可能调用付费 provider；下面的发布验证为离线检查。

## 可复现性与方法学

本地研究使用冻结 manifest、可用时保存的 SHA-256、API attempts 日志、deterministic display shuffle、明确的失效／终止记录，以及保留的 Human review provenance。历史 artifact 视为不可变，后续纠正另行记录。

本次公开支持的是**审计已发布证据、复算部分汇总结果**，不是从干净 clone 完整重跑 Local Lab。有意排除 provider 原始日志、私人路径、凭据、私有数据库、完整训练语料、权重和缓存。部分旧报告提到的私人支撑文件未包含在内；我们记录这种缺失，不用编造数据填补。

安装 Python 3 后，在仓库根目录执行：

```sh
python scripts/publication/verify.py
python scripts/publication/secret_scan.py
```

检查内容包括快照 hash、README 链接、部分报告计数、0.9G 位置曲线，以及 Git 内容中的 credential 模式。范围与限制见[发布审计](reports/PUBLICATION_AUDIT.md)。

### Limitations / 研究限制

- 当前主要 Human evaluator 只有一人，目标偏好高度个人化，主要研究语境是中文幽默。
- 很多实验样本很小，许多比较属于 exploratory result，不代表普适幽默规律。
- 标签语义在研究中发生过变化；provider model／API 也可能变化。
- 部分历史复评存在旧题记忆污染，同 setup 派生的 pairs 彼此依赖。
- Groupwise winner 不是绝对幽默分数，WORTH_LEARNING 也不是笑声测量。

## License

当前没有 LICENSE 文件。本次发布没有代替作者选择或添加许可证。

---

我们没有解决幽默。但我们确实记录了多得有些离谱的、让模型更不好笑的方法。
