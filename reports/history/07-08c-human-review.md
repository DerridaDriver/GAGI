# GAGI 0.8C — Human Review Analysis + Semantic Disconnection Autopsy

Generated: `2026-09-09T07:08:35.062992Z`. This is an offline descriptive analysis. No generation, promotion, training, deployment, or database write was performed.

## Executive verdict

0.8C produced **40 SKIP / 6 KEEP / 0 GOLD**. Useful was **6/46 = 13.04%**. Raw useful yield was **6/244 = 2.46%**.

Against 0.8B BASELINE, human useful rate fell from **39.13%** to **13.04%** (-26.09 pp). Raw useful yield fell from **7.14%** to **2.46%** (-4.68 pp). GOLD fell from **2** to **0**.

Structural diversity improved, but human value did not. Mean within-route normalized template entropy rose while the worst dominant share fell to 37.5%; nevertheless useful rate dropped by two thirds. The tradeoff is therefore observed in this pilot, though the small sample does not establish causality.

**H6 — Answer-Slot Dilution: PARTIAL.** All reviewed MEDIUM/LOW-clarity candidates were SKIP, and the closure gate admitted deterministic speech-act mismatches. But multiple HIGH-clarity non-WHY routes also produced zero useful items, so slot dilution is not the whole failure mechanism.

## Human Review integrity

All **46/46** decisions are present. IDs, hashes, finalist provenance, candidate/setup lineage, shortlist membership, closure pass state, and the frozen SHA-256 all reconcile. Frozen route counts remain 8 × 8. Source artifacts were unchanged during analysis: **True**.

## 0.8B BASELINE versus 0.8C

| Metric | 0.8B BASELINE | 0.8C |
|---|---:|---:|
| Reviewed | 46 | 46 |
| SKIP | 28 | 40 |
| KEEP | 16 | 6 |
| GOLD | 2 | 0 |
| Human useful rate | 39.13% | 13.04% |
| Raw useful yield | 7.14% | 2.46% |
| Raw candidates | 252 | 244 |
| Deterministic pass | 250 | 240 |
| Closure pass / deterministic pass | 152/250 (60.80%) | 176/240 (73.33%) |
| Finalists | 46 | 46 |
| Mean within-route normalized template entropy | 0.341 | 0.592 |
| Mean within-route HHI | 0.578 | 0.305 |
| Maximum dominant-template share | 100.00% | 37.50% |
| Raw dominant answer structure | DIRECT_SENTENCE 53.97% | DIRECT_SENTENCE 61.48% |

Closure improved from 60.8% to 73.33% while human value fell from 39.13% to 13.04%. This is direct evidence that machine closure and human-perceived alignment/value diverged in 0.8C.

## Human value by route

| Route | Reviewed | SKIP | KEEP | GOLD | Useful rate | 0.8B BASELINE | Delta | Clarity H/M/L/U | Fulfilled / Not / Unresolved |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| R1_WHY_CAUSAL | 8 | 4 | 4 | 0 | 50.00% | 16.67% | +33.33 pp | 8/0/0/0 | 8/0/0 |
| R2_WHAT_DEFINITION | 4 | 4 | 0 | 0 | 0.00% | 60.00% | -60.00 pp | 4/0/0/0 | 3/1/0 |
| R3_HOW_PROCEDURE | 6 | 6 | 0 | 0 | 0.00% | 50.00% | -50.00 pp | 6/0/0/0 | 5/1/0 |
| R4_WHO_IDENTITY | 6 | 4 | 2 | 0 | 33.33% | 20.00% | +13.33 pp | 6/0/0/0 | 3/3/0 |
| R5_WHEN_WHERE | 6 | 6 | 0 | 0 | 0.00% | 33.33% | -33.33 pp | 6/0/0/0 | 3/3/0 |
| R6_CONDITIONAL_HYPOTHETICAL | 5 | 5 | 0 | 0 | 0.00% | 33.33% | -33.33 pp | 1/4/0/0 | 5/0/0 |
| R7_DIALOGUE_REPLY | 5 | 5 | 0 | 0 | 0.00% | 66.67% | -66.67 pp | 5/0/0/0 | 5/0/0 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 6 | 6 | 0 | 0 | 0.00% | 33.33% | -33.33 pp | 1/3/2/0 | 1/0/5 |

The largest direct route losses were R7 DIALOGUE_REPLY, R2 WHAT_DEFINITION, and R3 HOW_PROCEDURE. R5, R6, and R8 also fell to zero useful. Only R1 and R4 produced any useful items.

## Answer-slot clarity × Human Value

| Clarity | Reviewed | SKIP | KEEP | GOLD | Useful rate | SKIP rate |
|---|---:|---:|---:|---:|---:|---:|
| HIGH | 37 | 31 | 6 | 0 | 16.22% | 83.78% |
| LOW | 2 | 2 | 0 | 0 | 0.00% | 100.00% |
| MEDIUM | 7 | 7 | 0 | 0 | 0.00% | 100.00% |

This does not imply WHY is intrinsically superior. The useful items include R4 identity slots, and many HIGH-clarity R2/R3/R5/R7 items still failed. The defensible claim is narrower: vague pragmatic targets performed badly, and clear slots were necessary but not sufficient in this pilot.

## Speech-act fulfillment audit

| Proxy label | Reviewed | SKIP | KEEP | GOLD | Useful rate |
|---|---:|---:|---:|---:|---:|
| FULFILLED | 33 | 27 | 6 | 0 | 18.18% |
| NOT_FULFILLED | 8 | 8 | 0 | 0 | 0.00% |
| UNRESOLVED | 5 | 5 | 0 | 0 | 0.00% |

The audit is deliberately conservative. Open R8 statements remain UNRESOLVED rather than being forced into pass/fail. The detailed per-item rule evidence is in `speech_act_fulfillment_audit.csv`.

## Why Closure did not stop the disconnections

The gate records seven labels, but its programmatic hard condition uses only `answers_setup`, `semantic_relation_complete`, `bridge_is_understandable`, and the three negative flags. `introduces_second_domain` is recorded but is not a hard condition. More importantly, there is no `speech_act_fulfilled` field, and the gate receives only the setup text—not the frozen route/template contract or the expected speech act.

As a result, a response can be interpreted as broadly relevant and complete while failing to name, identify, locate, time, or operationally answer what the setup requested. All 46 finalists had every required closure bit in the passing state, yet the deterministic audit still found speech-act mismatches and unresolved open completions.

## Template family findings

Type A evidence: non-dominant R1_A_EVENT_CAUSE and R4_A_IDENTIFY_ENTITY produced useful items without relying on the route's dominant/tied family. Type C evidence: R1_B/R1_C and R4_B were dominant or tied-dominant yet still produced useful items, so template regularity alone is not grounds for deletion. Type B risk concentrates in families with zero useful plus weak/unclear fulfillment, especially R2_A naming misses, R4 identity-inference misses, R5 time/location misses, and open R8 contrast/relation families.

Full family counts, clarity distributions, fulfillment rates, and Type A/B/C proxy tags are in `human_value_by_template_family.csv`.

## Counterfactual Frozen audit

| Selection | Quality pass | Mean setup quality | Clarity H/M/L/U | Mean clarity | Mean norm. entropy | Mean HHI | Max dominant share |
|---|---:|---:|---:|---:|---:|---:|---:|
| CF_A_STRICT_ACTUAL | 64/64 | 0.971 | 52/9/3/0 | 0.883 | 0.592 | 0.305 | 37.50% |
| CF_B_ROUTE_BALANCED_NO_CAP | 64/64 | 0.990 | 52/9/3/0 | 0.883 | 0.500 | 0.379 | 50.00% |
| CF_C_SOFT_TEMPLATE_DIVERSITY | 64/64 | 0.990 | 54/8/2/0 | 0.906 | 0.517 | 0.359 | 50.00% |

The strict quota selected lower-clarity setups than the soft-diversity counterfactual: **True**. It selected lower Setup Potential proxy quality: **True**. This is setup-layer evidence only; no counterfactual candidates or human labels exist.

The 37.5% cap and >=3-family minimum should both be **SOFTENED**, not silently removed or changed in this analysis. They achieved the intended entropy target, but the pilot provides no human-value benefit and the counterfactual shows whether the quota displaced clearer setups. Route balancing remains **KEEP** because it is orthogonal to the template quota and preserved coarse-route coverage.

## Non-dominant template hypothesis

0.8C dominant/tied: **3/30 = 10.00%**. Non-dominant: **3/16 = 18.75%**.

**0.8B non-dominant advantage did NOT replicate as an optimization effect.** The direction may remain slightly positive inside 0.8C, but the non-dominant rate is far below the earlier 44.44%, and deliberately increasing non-dominant exposure coincided with a major fall in overall human value. The 0.8B signal should remain descriptive, not an optimization target.

## All KEEP / GOLD

`poetic_quality = NOT_LABELED` for every item.

| ID | Rating | Topic | Response | Route | Template family | Answer structure | Clarity | Speech act | Closure labels | Train similarity |
|---|---|---|---|---|---|---|---|---|---|---:|
| TFV12-002 | KEEP | 是什么让老式收音机在雷雨夜自行换台？ | 它在用磁棒偷听闪电的调频 | R1_WHY_CAUSAL | R1_B_CAUSATIVE_AGENT | DIRECT_SENTENCE | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.285714 |
| TFV12-013 | KEEP | 为什么老屋的木门总在午夜发出吱呀声？ | 那是门轴在给自己上发条，怕时间停了它就没活干。 | R1_WHY_CAUSAL | R1_A_EVENT_CAUSE | DIRECT_SENTENCE | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.206897 |
| TFV12-015 | KEEP | 哪位员工最适合负责保密？ | 负责剪彩的那位，因为秘密要封条 | R4_WHO_IDENTITY | R4_B_BEST_CANDIDATE | BECAUSE_EXPLICIT | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.190476 |
| TFV12-017 | KEEP | 谁会最先发现地球其实在绕着一只猫转？ | 给猫剪指甲的人 | R4_WHO_IDENTITY | R4_A_IDENTIFY_ENTITY | PROCEDURAL | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.142857 |
| TFV12-034 | KEEP | 为什么古城墙的砖缝里会钻出青苔？ | 因为那是城墙在给历史写备注 | R1_WHY_CAUSAL | R1_A_EVENT_CAUSE | BECAUSE_EXPLICIT | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.285714 |
| TFV12-036 | KEEP | 深海的水母怎么会发光？ | 它们在给海底的夜店打工当氛围灯 | R1_WHY_CAUSAL | R1_C_UNEXPECTED_STATE | DIRECT_SENTENCE | HIGH | FULFILLED | A=True C=True D=True B=True R=False W=False M=False | 0.250000 |

## Representative Semantic Disconnection SKIP

Every item below passed machine closure and final shortlist. They are selected because the deterministic speech-act proxy is NOT_FULFILLED/UNRESOLVED or the setup clarity is LOW/MEDIUM.

| ID | Setup | Response | Route | Family | Clarity | Speech act | Closure labels |
|---|---|---|---|---|---|---|---|
| TFV12-040 | 独自旅行的键盘叫什么？ | 它的Q键会自己孤独地亮着 | R2_WHAT_DEFINITION | R2_A_NAMING | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=False; bridge=True; random=False; word=False; missing=False |
| TFV12-004 | 怎样让一滴水从云层回到太平洋？ | 每滴都下海，因为它是水循环的个体工商户。 | R3_HOW_PROCEDURE | R3_C_TRANSPORT | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-005 | 谁会是最后一个被蚊子咬醒的人？ | 蚊子也有就业压力 | R4_WHO_IDENTITY | R4_A_IDENTIFY_ENTITY | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-010 | 哪位行星最适合当夜灯？ | 因为地球替它挡了闹钟 | R4_WHO_IDENTITY | R4_B_BEST_CANDIDATE | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-026 | 根据配方里多了一味苦草，熬药的陌生人会是谁？ | 他在熬制遗忘的剂量 | R4_WHO_IDENTITY | R4_D_IDENTITY_INFERENCE | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-007 | 在哪种场景下，程序员会主动拔掉自己的网线？ | 为了体验一次真正的断点 | R5_WHEN_WHERE | R5_C_CONTEXT_LOCATION | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-016 | 在无人认领的火车站，无数雪白的信封在哪里像候鸟一样反复起飞又落下？ | 它们在等一场不会到来的雪。 | R5_WHEN_WHERE | R5_B_WHERE_EVENT | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-023 | 雨停了之后，什么时候出现彩虹？ | 那是光子在坠落前说的最后一句话 | R5_WHEN_WHERE | R5_A_WHEN_EVENT | HIGH | NOT_FULFILLED | answers=True; complete=True; domain2=False; bridge=True; random=False; word=False; missing=False |
| TFV12-025 | 广告牌每天对路人微笑，但没人认真回应它的表情 | 路人怕一回应，它就开始推销 | R8_STATEMENT_COMPARISON_OBSERVATION | R8_C_CONTRAST | LOW | UNRESOLVED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-028 | 河流总想给大海写信，却从没收到过回信 | 大海只收漂流瓶，不收文字 | R8_STATEMENT_COMPARISON_OBSERVATION | R8_C_CONTRAST | LOW | UNRESOLVED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-001 | 一旦船长与灯塔交换角色，夜航的船会怎样？ | 灯塔若是船长，海浪就得在公文包里翻腾。 | R6_CONDITIONAL_HYPOTHETICAL | R6_C_ROLE_REVERSAL | MEDIUM | FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-009 | 如果天气预报能兑现，会怎样？ | 股市就永远没有熊市了 | R6_CONDITIONAL_HYPOTHETICAL | R6_A_IF_CONSEQUENCE | MEDIUM | FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-019 | 一旦剪刀与尺子交换角色，裁缝量的布会怎样？ | 量出的布都成了直角的奴隶 | R6_CONDITIONAL_HYPOTHETICAL | R6_C_ROLE_REVERSAL | MEDIUM | FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-031 | 如果白蚁学会记账，会怎样？ | 账本最后一页会写着：‘按年化复利计算，这栋房子归我们了。’ | R6_CONDITIONAL_HYPOTHETICAL | R6_A_IF_CONSEQUENCE | MEDIUM | FULFILLED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |
| TFV12-033 | 情书与止疼药之间最奇怪的关系 | 剂量按页码算，副作用是眼眶发红 | R8_STATEMENT_COMPARISON_OBSERVATION | R8_D_UNFINISHED_RELATION | MEDIUM | UNRESOLVED | answers=True; complete=True; domain2=True; bridge=True; random=False; word=False; missing=False |

## Final decisions

- Template diversification: **SOFTEN**. Keep structural breadth as a preference under a clear answer slot.
- 37.5% dominant-template hard cap: **SOFTEN**. Do not let it displace clearer all-pass setups.
- >=3 family hard minimum: **SOFTEN**. Treat it as a diagnostic/preference, not a pass/fail quota.
- Route balancing: **KEEP**. It is not the same intervention as template diversification.
- BASELINE candidate prompt: **KEEP AS CONTROL, UNCHANGED**.
- Next-stage priority: **answer-slot clarity first**, then an explicit closure speech-act fulfillment check. Ranking comes after those structural fixes; soft template diversity should be a constraint, not the objective.

Recommended design principle for a future, separately authorized stage: `Open Semantic Setup + Clear Pragmatic Slot + Structural Diversity`. Do not maximize template entropy directly.

## State boundary

```text
No new API calls were made during analysis.
No samples were promoted.
Accepted corpus was unchanged.
No Qwen training was started.
No Wave 2 was started.
Production/Web/Supabase were unchanged.
do_not_promote = true
promotion_started = false
qwen_training_started = false
wave2_started = false
```
