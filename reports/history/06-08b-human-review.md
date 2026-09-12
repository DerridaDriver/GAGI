# GAGI 0.8B Human Review Analysis and Intra-route Template Collapse Audit

## Executive result

All 91 blind decisions passed the post-review integrity checks. Final labels are **SKIP 61 / KEEP 27 / GOLD 3**. Useful is 30/91 (**32.97%**). This is descriptively higher than Wave 1's 10/120 (8.33%) by **24.63 percentage points**, or **3.96×**. Raw useful yield is 30/508 (**5.91%**) versus Wave 1's 10/800 (1.25%), or **4.72×**.

Human preference does not support the current ROUTE_AWARE candidate prompt. BASELINE produced 18/46 useful (39.13%); ROUTE_AWARE produced 12/45 (26.67%). ROUTE_AWARE raised deterministic-to-closure pass rate but did not raise human value, and its raw answer-structure concentration was worse (normalized entropy 0.556 vs 0.583; HHI 0.415 vs 0.365).

**Verdicts:** BASELINE **KEEP**. Current ROUTE_AWARE v1 **REJECT**. Route balancing **KEEP**, with mandatory intra-route surface-template diversification. Intra-route template collapse is **SUPPORTED**. The next priority is **setup surface diversity**, not more coarse routes.

## 1. Human review integrity

Reviewed: 91/91  
SKIP: 61  
KEEP: 27  
GOLD: 3  
Useful: 30  
Useful rate: 32.97%

All decision IDs are unique. Blind, review, provenance, candidate, setup, and hash lineages match. There are no missing or duplicate ratings. The frozen setup manifest remains 64 rows with eight setups per route, and its SHA-256 still matches `frozen_setups.sha256`.

## 2. Human value by arm

| Arm | Raw | Det pass | Closure pass | Shortlist | Reviewed | SKIP | KEEP | GOLD | Useful | Review useful | Raw useful yield |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BASELINE | 252 | 250 | 152 | 52 | 46 | 28 | 16 | 2 | 18 | 39.13% | 7.14% |
| ROUTE_AWARE | 256 | 248 | 169 | 49 | 45 | 33 | 11 | 1 | 12 | 26.67% | 4.69% |

ROUTE_AWARE closure pass is 169/248 (68.15%) versus BASELINE 152/250 (60.80%). That machine advantage reverses at human review. The arm comparison is descriptive because reviewed cell sizes are small, but the direction is clear enough to reject ROUTE_AWARE v1 for the next prompt control.

## 3. Human value by route

| Route | Reviewed | SKIP | KEEP | GOLD | Useful | Useful rate |
| --- | --- | --- | --- | --- | --- | --- |
| R1_WHY_CAUSAL | 12 | 9 | 3 | 0 | 3 | 25.00% |
| R2_WHAT_DEFINITION | 9 | 5 | 4 | 0 | 4 | 44.44% |
| R3_HOW_PROCEDURE | 12 | 9 | 2 | 1 | 3 | 25.00% |
| R4_WHO_IDENTITY | 10 | 8 | 2 | 0 | 2 | 20.00% |
| R5_WHEN_WHERE | 12 | 8 | 2 | 2 | 4 | 33.33% |
| R6_CONDITIONAL_HYPOTHETICAL | 12 | 8 | 4 | 0 | 4 | 33.33% |
| R7_DIALOGUE_REPLY | 12 | 6 | 6 | 0 | 6 | 50.00% |
| R8_STATEMENT_COMPARISON_OBSERVATION | 12 | 8 | 4 | 0 | 4 | 33.33% |

R7 DIALOGUE_REPLY has the highest observed useful rate (50.00%); R2 follows. R4 is lowest. These are small samples and should guide diagnosis, not route-allocation optimization.

### Route × arm

| Route | Arm | Reviewed | SKIP | KEEP | GOLD | Useful | Useful rate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1_WHY_CAUSAL | BASELINE | 6 | 5 | 1 | 0 | 1 | 16.67% |
| R1_WHY_CAUSAL | ROUTE_AWARE | 6 | 4 | 2 | 0 | 2 | 33.33% |
| R2_WHAT_DEFINITION | BASELINE | 5 | 2 | 3 | 0 | 3 | 60.00% |
| R2_WHAT_DEFINITION | ROUTE_AWARE | 4 | 3 | 1 | 0 | 1 | 25.00% |
| R3_HOW_PROCEDURE | BASELINE | 6 | 3 | 2 | 1 | 3 | 50.00% |
| R3_HOW_PROCEDURE | ROUTE_AWARE | 6 | 6 | 0 | 0 | 0 | 0.00% |
| R4_WHO_IDENTITY | BASELINE | 5 | 4 | 1 | 0 | 1 | 20.00% |
| R4_WHO_IDENTITY | ROUTE_AWARE | 5 | 4 | 1 | 0 | 1 | 20.00% |
| R5_WHEN_WHERE | BASELINE | 6 | 4 | 1 | 1 | 2 | 33.33% |
| R5_WHEN_WHERE | ROUTE_AWARE | 6 | 4 | 1 | 1 | 2 | 33.33% |
| R6_CONDITIONAL_HYPOTHETICAL | BASELINE | 6 | 4 | 2 | 0 | 2 | 33.33% |
| R6_CONDITIONAL_HYPOTHETICAL | ROUTE_AWARE | 6 | 4 | 2 | 0 | 2 | 33.33% |
| R7_DIALOGUE_REPLY | BASELINE | 6 | 2 | 4 | 0 | 4 | 66.67% |
| R7_DIALOGUE_REPLY | ROUTE_AWARE | 6 | 4 | 2 | 0 | 2 | 33.33% |
| R8_STATEMENT_COMPARISON_OBSERVATION | BASELINE | 6 | 4 | 2 | 0 | 2 | 33.33% |
| R8_STATEMENT_COMPARISON_OBSERVATION | ROUTE_AWARE | 6 | 4 | 2 | 0 | 2 | 33.33% |

## 4. Three levels of diversity

Level 1, coarse routes, is perfectly balanced: eight routes, eight frozen setups each, normalized entropy 1.000, dominant share 12.5%, HHI 0.125.

Level 2, surface templates, is not balanced. Frozen setups contain 23 deterministic templates, but within-route concentration remains high:

| Route | Setups | Unique templates | Dominant template | Dominant share | Entropy bits | Normalized entropy | HHI |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1_WHY_CAUSAL | 8 | 1 | WHY_EXACT_WEISHENME | 100.00% | 0.0 | 0.0 | 1.0 |
| R2_WHAT_DEFINITION | 8 | 4 | WHAT_CALLED | 37.50% | 1.811278 | 0.603759 | 0.3125 |
| R3_HOW_PROCEDURE | 8 | 2 | HOW_RUHE_GEI | 75.00% | 0.811278 | 0.270426 | 0.625 |
| R4_WHO_IDENTITY | 8 | 3 | WHO_GENERAL | 50.00% | 1.405639 | 0.468546 | 0.40625 |
| R5_WHEN_WHERE | 8 | 3 | WHERE_ZAINALI | 50.00% | 1.5 | 0.5 | 0.375 |
| R6_CONDITIONAL_HYPOTHETICAL | 8 | 2 | CONDITIONAL_RUOGUO | 75.00% | 0.811278 | 0.270426 | 0.625 |
| R7_DIALOGUE_REPLY | 8 | 2 | DIALOGUE_FACE_REPLY | 87.50% | 0.543564 | 0.181188 | 0.78125 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 8 | 6 | STATEMENT_DIFFERENCE_NOUN | 25.00% | 2.5 | 0.833333 | 0.1875 |

The worst route is **R1_WHY_CAUSAL** with HHI **1.000** and normalized template entropy **0.000**. Primary collapsed routes are: R1_WHY_CAUSAL, R7_DIALOGUE_REPLY, R3_HOW_PROCEDURE, R6_CONDITIONAL_HYPOTHETICAL.

Level 3, answer mechanism, also remains concentrated. BASELINE raw candidates are dominated by DIRECT_SENTENCE (53.97%); ROUTE_AWARE by DIRECT_SENTENCE (59.77%). ROUTE_AWARE lowered causal-family share from 23.81% to 21.88%, but increased concentration in DIRECT_SENTENCE and reduced overall answer entropy.

## 5. Where template fixation occurs

- T1 teacher route-conditioned generation: **SUPPORTED**. Raw route pools already have either no more than two detected templates or ≥75% dominant-template share in 2 route(s): R1_WHY_CAUSAL, R6_CONDITIONAL_HYPOTHETICAL.
- T2 route/quality gates: **PARTIAL**. The largest within-route dominant-share increase from route-correct to quality-pass is 0.055.
- T3 frozen selection: **SUPPORTED**. The largest dominant-share increase from quality-pass to frozen is 0.250.
- T4 machine shortlist/final selection: **NOT_SUPPORTED**. The final dominant template's candidate-to-final share delta is 0.006.

The primary source is teacher generation, with downstream selection acting as a secondary modifier. Route balancing corrected coarse buckets but had no within-route template quota.

## 6. R2/R7 repair side effects

| Route | Prompt | Generated | Route compliance | Quality pass | Templates | Dominant template | Dominant share | Norm. entropy | HHI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R2_WHAT_DEFINITION | prompt_v1 | 16 | 25.00% | 81.25% | 4 | WHY_EXACT_WEISHENME | 56.25% | 0.405639 | 0.390625 |
| R2_WHAT_DEFINITION | contract_v2 | 16 | 87.50% | 100.00% | 5 | WHAT_IS | 31.25% | 0.545009 | 0.234375 |
| R7_DIALOGUE_REPLY | prompt_v1 | 16 | 37.50% | 87.50% | 2 | WHY_EXACT_WEISHENME | 62.50% | 0.238609 | 0.53125 |
| R7_DIALOGUE_REPLY | contract_v2 | 16 | 100.00% | 100.00% | 2 | DIALOGUE_FACE_REPLY | 50.00% | 0.25 | 0.5 |

R2 compliance changed by +0.625; compliance-up/diversity-down is **False**. R7 compliance changed by +0.625; compliance-up/diversity-down is **False**. The detailed count, entropy, dominance, and HHI values are preserved in `human_review_analysis.json` and `route_template_distribution.csv`.

## 7. Human value by surface template and answer structure

Dominant or tied-dominant parent templates produced 18/64 useful (28.12%). Non-dominant parent templates produced 12/27 (44.44%). This does not establish that deviation causes quality; route mix and small cells confound the comparison.

Among templates with at least four reviewed candidates, `DIALOGUE_FACE_REPLY`, `WHAT_IS`, and `HOW_RUHE_BA` each reached 50% useful in this sample, while `STATEMENT_DIFFERENT_PREDICATE` was 0/4, `HOW_RUHE_GEI` was 1/8, and `WHO_GENERAL` was 1/6. The complete subgroup tables are in `human_value_by_template.csv` and `human_value_by_answer_structure.csv`, including ALL, BASELINE, and ROUTE_AWARE answer-structure rows. These differences are descriptive because many cells are small.

## 8. All KEEP/GOLD items

`poetic_quality` is **NOT_LABELED** for every item. The analysis does not infer poetry or quality beyond the recorded human decision.

| ID | Rating | Arm | Route | Setup template | Answer structure | Topic | Response | Answers setup | Complete | Second domain | Bridge clear | Random | Mere word | Missing explanation | Closure | Train sim | Poetic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TFV11-052 | GOLD | ROUTE_AWARE | R5_WHEN_WHERE | WHERE_ZAINALI | DIRECT_SENTENCE | 在哪里，蛋糕永远切不完？ | 在数学书里的聚会上 | True | True | True | True | False | False | False | True | 0.272727 | NOT_LABELED |
| TFV11-058 | GOLD | BASELINE | R3_HOW_PROCEDURE | HOW_RUHE_BA | PROCEDURAL | 如何把河流折叠起来？ | 用等高线给它打个蝴蝶结 | True | True | True | True | False | False | False | True | 0.117647 | NOT_LABELED |
| TFV11-064 | GOLD | BASELINE | R5_WHEN_WHERE | WHERE_PLACE | DIRECT_SENTENCE | 在什么地方，钱包里的钱会自己变多？ | 在许愿池里捞零钱的时候。 | True | True | True | True | False | False | False | True | 0.200000 | NOT_LABELED |
| TFV11-001 | KEEP | BASELINE | R7_DIALOGUE_REPLY | DIALOGUE_FACE_REPLY | DIRECT_SENTENCE | 面对考古学家的提问，恐龙化石会怎么回答？ | 我们只是换了个更持久的工作 | True | True | True | True | False | False | False | True | 0.200000 | NOT_LABELED |
| TFV11-002 | KEEP | ROUTE_AWARE | R4_WHO_IDENTITY | WHO_NAWEI | DIRECT_SENTENCE | 哪位历史人物最适合当代社交媒体运营？ | 每天置顶一条‘急急如律令’ | True | True | True | True | False | False | False | True | 0.266667 | NOT_LABELED |
| TFV11-003 | KEEP | BASELINE | R1_WHY_CAUSAL | WHY_EXACT_WEISHENME | BECAUSE_EXPLICIT | 为什么第二杯饮料总比第一杯快喝完？ | 因为第一杯是解渴，第二杯是解馋。 | True | True | True | True | False | False | False | True | 0.250000 | NOT_LABELED |
| TFV11-004 | KEEP | ROUTE_AWARE | R1_WHY_CAUSAL | WHY_EXACT_WEISHENME | BECAUSE_EXPLICIT | 为什么星星只在晚上出现？ | 因为太阳系酒吧包场，星星们只能在夜班时上岗 | True | True | True | True | False | False | False | True | 0.258065 | NOT_LABELED |
| TFV11-006 | KEEP | BASELINE | R5_WHEN_WHERE | WHERE_ZAINALI | DIRECT_SENTENCE | 在哪里，手机的信号永远满格？ | 在反诈APP的雷达上。 | True | True | True | True | False | False | False | True | 0.210526 | NOT_LABELED |
| TFV11-017 | KEEP | ROUTE_AWARE | R1_WHY_CAUSAL | WHY_EXACT_WEISHENME | BECAUSE_EXPLICIT | 为什么钥匙总在最后才找到？ | 因为钥匙也有自己的时区 | True | True | True | True | False | False | False | True | 0.333333 | NOT_LABELED |
| TFV11-021 | KEEP | BASELINE | R2_WHAT_DEFINITION | WHAT_COUNTS_AS | DIRECT_SENTENCE | 电影院里最贵的座位算哪类？ | 那种座位其实卖的不是视野，是逃生通道的优先权。 | True | True | True | True | False | False | False | True | 0.181818 | NOT_LABELED |
| TFV11-029 | KEEP | BASELINE | R4_WHO_IDENTITY | WHO_GENERAL | DIRECT_NOUN_PHRASE | 谁拥有最贵的眼泪？ | 假装爱你的骗子 | True | True | True | True | False | False | False | True | 0.250000 | NOT_LABELED |
| TFV11-037 | KEEP | BASELINE | R7_DIALOGUE_REPLY | DIALOGUE_FACE_REPLY | DIRECT_SENTENCE | 面对评委的提问，彩虹会怎么回答？ | 它反问评委：你是在问没下雨的那部分吗？ | True | True | True | True | False | False | False | True | 0.230769 | NOT_LABELED |
| TFV11-038 | KEEP | ROUTE_AWARE | R5_WHEN_WHERE | WHEN_SHENME | DIRECT_SENTENCE | 什么时候，河马才会出席化妆舞会？ | 当天色暗到没人能看见它的大板牙 | True | True | True | True | False | False | False | True | 0.166667 | NOT_LABELED |
| TFV11-041 | KEEP | ROUTE_AWARE | R7_DIALOGUE_REPLY | DIALOGUE_FACE_REPLY | DIRECT_SENTENCE | 面对小偷的威胁，监控摄像头会怎么回答？ | 请对着镜头微笑，这是您的入狱纪念照。 | True | True | True | True | False | False | False | True | 0.173913 | NOT_LABELED |
| TFV11-042 | KEEP | BASELINE | R3_HOW_PROCEDURE | HOW_RUHE_BA | DIRECT_SENTENCE | 如何把灵感种进土里？ | 在土里加一勺咖啡渣，灵感就学会熬夜长。 | True | True | True | True | False | False | False | True | 0.133333 | NOT_LABELED |
| TFV11-044 | KEEP | BASELINE | R7_DIALOGUE_REPLY | DIALOGUE_WHEN_REPLY | DIRECT_NOUN_PHRASE | 当影子对主人说“我要辞职”时，主人说了什么？ | 那谁照亮你的黑呢？ | True | True | True | True | False | False | False | True | 0.235294 | NOT_LABELED |
| TFV11-045 | KEEP | BASELINE | R2_WHAT_DEFINITION | WHAT_IS | DIRECT_SENTENCE | 医生写的处方单是什么？ | 一张通往药房的单程票 | True | True | True | True | False | False | False | True | 0.142857 | NOT_LABELED |
| TFV11-047 | KEEP | BASELINE | R3_HOW_PROCEDURE | HOW_RUHE_GEI | DIRECT_SENTENCE | 如何给回声写信？ | 回信地址写了个逗号，让它在停顿处等我。 | True | True | True | True | False | False | False | True | 0.153846 | NOT_LABELED |
| TFV11-048 | KEEP | ROUTE_AWARE | R8_STATEMENT_COMPARISON_OBSERVATION | STATEMENT_STRATEGY | DIRECT_SENTENCE | 冰箱的冷藏室和冷冻室的温度控制策略 | 冷藏室是犹豫，冷冻室是决定 | True | True | True | True | False | False | False | True | 0.100000 | NOT_LABELED |
| TFV11-055 | KEEP | BASELINE | R6_CONDITIONAL_HYPOTHETICAL | CONDITIONAL_RUOGUO | DIRECT_SENTENCE | 如果路灯会在夜晚悄悄聊天，它们会抱怨什么？ | 嫌自己一辈子没见过白天，却天天看人加班 | True | True | True | True | False | False | False | True | 0.090909 | NOT_LABELED |
| TFV11-057 | KEEP | BASELINE | R8_STATEMENT_COMPARISON_OBSERVATION | STATEMENT_COMPARATIVE_MORE | BECAUSE_EXPLICIT | 台风眼区的风势比周围要平静 | 因为它在攒大招的读条 | True | True | True | True | False | False | False | True | 0.400000 | NOT_LABELED |
| TFV11-059 | KEEP | ROUTE_AWARE | R2_WHAT_DEFINITION | WHAT_IS | DIRECT_SENTENCE | 医生写的处方单是什么？ | 应该叫上帝的信封，打开才知道里面装的是什么。 | True | True | True | True | False | False | False | True | 0.125000 | NOT_LABELED |
| TFV11-067 | KEEP | BASELINE | R2_WHAT_DEFINITION | WHAT_IS | DIRECT_SENTENCE | 古代信使的职业病是什么？ | 梦里都在跑接力 | True | True | True | True | False | False | False | True | 0.266667 | NOT_LABELED |
| TFV11-079 | KEEP | ROUTE_AWARE | R7_DIALOGUE_REPLY | DIALOGUE_FACE_REPLY | DIRECT_SENTENCE | 面对考古学家的提问，恐龙化石会怎么回答？ | 我的简历上写着，曾担任过地壳板块的首席顾问 | True | True | True | True | False | False | False | True | 0.148148 | NOT_LABELED |
| TFV11-081 | KEEP | ROUTE_AWARE | R6_CONDITIONAL_HYPOTHETICAL | CONDITIONAL_JIASHE | DIRECT_SENTENCE | 假设鱼缸里的金鱼有政治抱负，它会如何拉选票？ | 它会在水草上贴满标语：选我，让每一片鳞都有自己的选区。 | True | True | False | True | False | False | False | True | 0.181818 | NOT_LABELED |
| TFV11-083 | KEEP | BASELINE | R7_DIALOGUE_REPLY | DIALOGUE_FACE_REPLY | DIRECT_SENTENCE | 面对法官的问题，AI会怎么回答？ | 反对，此问题超出我的训练分布 | True | True | False | True | False | False | False | True | 0.117647 | NOT_LABELED |
| TFV11-084 | KEEP | ROUTE_AWARE | R8_STATEMENT_COMPARISON_OBSERVATION | STATEMENT_COMPARATIVE_MORE | DIRECT_SENTENCE | 台风眼区的风势比周围要平静 | 它在攒大招 | True | True | True | True | False | False | False | True | 0.285714 | NOT_LABELED |
| TFV11-087 | KEEP | ROUTE_AWARE | R6_CONDITIONAL_HYPOTHETICAL | CONDITIONAL_RUOGUO | DIRECT_SENTENCE | 如果咖啡渣能够预测未来，它们会预言什么？ | 咖啡渣会预言你将再次失眠，于是它们提前在杯底拼出安眠药的分子式。 | True | True | True | True | False | False | False | True | 0.195122 | NOT_LABELED |
| TFV11-090 | KEEP | BASELINE | R8_STATEMENT_COMPARISON_OBSERVATION | STATEMENT_BUSY_WHAT | PROCEDURAL | 激光打印机在打印黑白文件时，到底在忙什么 | 给0和1办集体婚礼 | True | True | True | True | False | False | False | True | 0.125000 | NOT_LABELED |
| TFV11-091 | KEEP | BASELINE | R6_CONDITIONAL_HYPOTHETICAL | CONDITIONAL_RUOGUO | DIRECT_SENTENCE | 如果咖啡渣能够预测未来，它们会预言什么？ | 你将遇见一场没有奶的会议，然后沉默五分钟 | True | True | True | True | False | False | False | True | 0.214286 | NOT_LABELED |

## 9. Wave 1 comparison

| Metric | Wave 1 | GAGI 0.8B |
| --- | ---: | ---: |
| Human useful rate | 10/120 (8.33%) | 30/91 (32.97%) |
| Raw useful yield | 10/800 (1.25%) | 30/508 (5.91%) |
| GOLD | 1 | 3 |
| Frozen dominant route share | 96.00% | 12.50% |
| Frozen route HHI | 0.922 | 0.125 |
| Raw causal-answer family | 80.00% | 22.83% |

The improvement is large descriptively, but not a clean causal estimate because the setup pool and selection distribution changed together. Structural route collapse was repaired. Template-machine behavior was reduced, not eliminated.

## 10. Next-stage proposal only

Propose **GAGI 0.8C — Intra-route Template Diversification**. Keep the existing eight-route balance, define deterministic surface-template contracts and per-route template caps/minima, retain BASELINE as the candidate-prompt control, and freeze a new setup checkpoint before any candidate generation. Do not add more routes yet. Do not execute this proposal in the current stage.

## Final state

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

Perfect route entropy does not imply real structural diversity. Eight different buckets can still contain eight families of clones.
