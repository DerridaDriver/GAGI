# GAGI 0.8 — Teacher Scale-Up Wave 1 Human Review Analysis

Human review is complete. This report analyzes the saved decisions only; it does not promote samples or train Qwen.

## A. Review integrity

- Reviewed: 120 / 120
- Unique decision IDs: 120
- Hash mismatches: 0
- Session elapsed: 581.425 seconds (9.69 minutes)
- Mean interval per decision: 4.886 seconds

## B. Outcome

- SKIP: 110 (91.67%)
- KEEP: 9 (7.50%)
- GOLD: 1 (0.83%)
- Useful (KEEP + GOLD): 10 / 120 (8.33%)
- Useful yield from 800 raw candidates: 10 / 800 (1.25%)
- Unique setups producing a useful reviewed item: 9

If later promoted with explicit authorization, this review would add 9 silver_teacher and 1 gold_teacher samples, taking canonical accepted from 30 to 40. No promotion has been performed.

## C. Accepted items

- **GOLD** | 为什么手机在坟场没有信号？ → 因为地下都是飞行模式 | source `teacher_generated`, domain `通讯`, len 10
- **KEEP** | 为什么幼儿园老师从不怕鬼？ → 因为她们每天都在办理小鬼入园手续。 | source `teacher_generated`, domain `教育/传说`, len 17
- **KEEP** | 为什么钢琴调音师从不在晚上工作？ → 因为夜曲的调性不稳定，调了也白调。 | source `teacher_generated`, domain `职业`, len 17
- **KEEP** | 为什么冬天的被子总比夏天的厚？ → 因为冬天被子要装下两个人的冷战 | source `teacher_generated`, domain `天气/家庭`, len 15
- **KEEP** | 为什么家里的沙发总在半夜挪动？ → 它得趁夜找信号，白天你老压着Wi-Fi | source `teacher_generated`, domain `日常/家居`, len 19
- **KEEP** | 为什么毕业证书从不说再见？ → 因为它怕一开口就暴露了水分 | source `teacher_generated`, domain `教育/礼仪`, len 13
- **KEEP** | 字典被审问时说了什么？ → 它坚持自己没有观点，只有注音。 | source `teacher_generated`, domain `出版`, len 15
- **KEEP** | 为什么Wi-Fi信号在雨天会变差？ → 因为天气域名解析到了乌云服务器上。 | source `teacher_generated`, domain `科技`, len 17
- **KEEP** | 字典被审问时说了什么？ → 最后它用页码当保释金，把自己从索引里赎了出来。 | source `teacher_generated`, domain `出版`, len 23
- **KEEP** | 为什么电梯在墓地迷路？ → 因为每层都写着“已满” | source `teacher_generated`, domain `建筑`, len 11

## D. Setup source

- `production_ask`: reviewed 2, useful 0 (0.00%), KEEP 0, GOLD 0
- `teacher_generated`: reviewed 118, useful 10 (8.47%), KEEP 9, GOLD 1

Production topics were not excluded by category. Their reviewed finalists simply received no KEEP/GOLD in this human pass; this is an observed outcome, not a local safety decision.

## E. Closure density versus human value

- `1-2` closure-pass candidates/setup: reviewed 10, useful 0 (0.00%)
- `3-4` closure-pass candidates/setup: reviewed 29, useful 3 (10.34%)
- `5+` closure-pass candidates/setup: reviewed 81, useful 7 (8.64%)

All 120 finalists already passed the hard closure rule. Nevertheless, 110 were SKIP. Semantic closure successfully removes incomplete structures but has weak precision for actual training value. More closure-passing candidates per setup did not by itself guarantee human acceptance.

## F. Length and novelty

- SKIP response length: mean 16.1727, median 16.0
- KEEP response length: mean 16.3333, median 17
- GOLD response length: 10
- SKIP max-training-similarity mean: 0.2588
- KEEP max-training-similarity mean: 0.2597
- GOLD max-training-similarity: 0.3333

These are descriptive with very small positive samples. They do not justify a new mechanical length or similarity threshold.

## G. Descriptive comparison with Teacher Factory v0

| Run | Raw | Human finalists | KEEP | GOLD | Useful | Finalist useful rate | Raw useful yield |
|---|---:|---:|---:|---:|---:|---:|---:|
| v0 | 180 | 42 | 19 | 0 | 19 | 45.24% | 10.56% |
| v1 | 800 | 120 | 9 | 1 | 10 | 8.33% | 1.25% |

This is not a controlled A/B test: setup distribution, prompts, gates, scale, and selection changed. Descriptively, v1 processed 4.44× more raw candidates but produced 9 fewer useful decisions. Finalist precision fell to 18.42% of v0, and raw useful yield fell to 11.84% of v0. The one GOLD is meaningful but does not offset the precision loss.

## H. Answer to the Wave 1 research question

**Partial, inefficient success.** Gold/Silver anchors plus open setups and a closure gate can produce short, complete, cross-domain items at scale: the user retained 10, including 1 GOLD. But the current factory does not yet scale efficiently. Setup Potential Gate passed 196/208 eligible inputs, closure passed 547/796 deterministic-pass candidates, and the final machine-selected queue was still 91.67% SKIP.

The central bottleneck has moved from semantic incompleteness to human-value ranking. Closure remains a necessary structural gate, but the shortlist/global-selection stage is poorly calibrated to GAGI taste. The evidence does not support starting Qwen training or Wave 2 automatically. The next decision should be either: promote these 10 reviewed items, or first inspect the 110 SKIPs versus 10 positives to design a ranking-error analysis. Do not lower the GOLD/KEEP standard.
