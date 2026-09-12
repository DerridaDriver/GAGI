# Semantic Escape Experiment v1 — Human Rating Analysis

Generated: 2026-09-08T00:21:49.287Z

评分来源为人工填写的 `blind_rating.csv`；本分析没有使用模型评分，也没有改写原盲评文件。

## Data quality

- Expected rows：60
- Rated rows：59
- Unrated rows：1
- CSV quote residues normalized for analysis：2
- Non-empty notes：0
- Unrated：B053 / DS-T1-S303 / DIVERGE_SYNTH / 为什么鬼都是白色的？ / seed 303

## Human ratings by group

| Group | Scheduled | Rated | HIT | MAYBE | BAD | UNRATED | Accepted among rated |
|---|---:|---:|---:|---:|---:|---:|---:|
| OLD_DRUNK | 30 | 30 | 0 | 0 | 30 | 0 | 0.0% |
| FORBID_DIRECT | 30 | 30 | 0 | 0 | 30 | 0 | 0.0% |
| DIVERGE_SYNTH | 30 | 29 | 0 | 0 | 29 | 1 | 0.0% |

Accepted = HIT + MAYBE。缺失评分不计作 BAD。

## By topic

| Topic | FD HIT/MAYBE/BAD/U | DS HIT/MAYBE/BAD/U |
|---|---:|---:|
| 为什么鬼都是白色的？ | 0/0/5/0 | 0/0/4/1 |
| 为什么程序员喜欢黑色？ | 0/0/5/0 | 0/0/5/0 |
| 为什么猫看不起人？ | 0/0/5/0 | 0/0/5/0 |
| 世界末日为什么总在晚上？ | 0/0/5/0 | 0/0/5/0 |
| 为什么死人从来不迟到？ | 0/0/5/0 | 0/0/5/0 |
| 为什么老板总是最后一个下班？ | 0/0/5/0 | 0/0/5/0 |

## Paired comparison

- Scheduled topic/seed pairs：30
- Complete rated pairs：29
- FD wins：0
- DS wins：0
- Ties：29
- Incomplete pairs：1

## Interpretation

- 已评分的 59 条全部是 BAD，没有观察到 HIT 或 MAYBE。
- FD 和 DS 确实改变了长度与开头模板等表面结构，但没有转化为已观察到的人工质量提升。
- 29 个完整配对全部是 BAD/BAD，因此评分数据没有提供 FD 与 DS 谁更好的方向性信号。
- B053 属于 DS。如果补评为 BAD，则 DS 为 0/30 accepted；如果补评为 HIT 或 MAYBE，则为 1/30（3.3%）。这个缺失值不改变当前“没有稳定改善证据”的结论。
- 这些评分回答的是笑话质量，不能单独证明是否完成 conceptual escape。结合结构统计，更符合“搜索路径发生变化，但 4B 模型没有把变化合成为有效笑话”。
