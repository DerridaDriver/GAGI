# GAGI 0.9A Full Candidate Pairwise Recovery

STATUS: COMPLETE. STOP; NO TRAINING.

| Cohort | SKIP | KEEP | GOLD | Within-sample positive | Pairs | Pair-bearing setups |
| --- | --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | 34 | 6 | 0 | 6/40 (15.00%) | 18 | 6/10 |
| 0.8C | 35 | 5 | 0 | 5/40 (12.50%) | 15 | 5/10 |
| 0.8D | 31 | 9 | 0 | 9/40 (22.50%) | 13 | 4/10 |

This station is preference-signal enriched. It is not a population-rate sample. Every run has five historical-positive and five historical-negative setups. These counts cannot replace historical run-level useful rates or establish a generator ranking.

## Candidate-set patterns and productivity

| Pattern | Setup count |
| --- | --- |
| 4 SKIP | 15 |
| 3 SKIP + 1 KEEP | 12 |
| 1 SKIP + 3 KEEP | 2 |
| 2 SKIP + 2 KEEP | 1 |

| Pairs per setup | Setup count (includes zero) |
| --- | --- |
| 0 | 15 |
| 3 | 14 |
| 4 | 1 |

| Cohort | Historical stratum | Setups | Any new positive | New positive candidates | Pairs |
| --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | OBSERVED_POSITIVE | 5 | 5 | 5 | 15 |
| 0.8B BASELINE | OBSERVED_NEGATIVE | 5 | 1 | 1 | 3 |
| 0.8C | OBSERVED_POSITIVE | 5 | 5 | 5 | 15 |
| 0.8C | OBSERVED_NEGATIVE | 5 | 0 | 0 | 0 |
| 0.8D | OBSERVED_POSITIVE | 5 | 4 | 9 | 13 |
| 0.8D | OBSERVED_NEGATIVE | 5 | 0 | 0 | 0 |
## Historical selector under new labels

| Cohort | Strictly best | Tied best | Not best | Top rate | Top-or-tied | All-SKIP ties | Top-or-tied among positive sets | Missed positive sets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | 4 | 4 | 2 | 4/10 (40.00%) | 8/10 (80.00%) | 4 | 4/6 (66.67%) | 2 |
| 0.8C | 4 | 5 | 1 | 4/10 (40.00%) | 9/10 (90.00%) | 5 | 4/5 (80.00%) | 1 |
| 0.8D | 0 | 9 | 1 | 0/10 (0.00%) | 9/10 (90.00%) | 6 | 3/4 (75.00%) | 1 |

Strictly best requires a unique highest ordinal label. Top-or-tied includes all-SKIP sets, which inflate apparent accuracy without identifying a useful candidate. Within-label humor preferences are unobserved. The historical selected identity is held fixed; S1 is not rerun on new human labels. Selected-versus-unselected results are descriptive only:

| Cohort | Selected now positive | Other siblings positive |
| --- | --- | --- |
| 0.8B BASELINE | 4/10 (40.00%) | 2/30 (6.67%) |
| 0.8C | 4/10 (40.00%) | 1/30 (3.33%) |
| 0.8D | 3/10 (30.00%) | 6/30 (20.00%) |

These conditional results can reveal missed value in sampled sets, but cannot quantify how much of the entire historical 0.8D 8.62% is caused by S1 or separate human calibration from selector costs. No significance tests or selector changes.

## Gate false-negative audit

| Cohort | Criterion | Fail count | Positive among fails | Fail fraction of new positives | Pass positive / pass | Unknown |
| --- | --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | closure_pass | 7 | 0/7 (0.00%) | 0/6 (0.00%) | 6/33 | 0 |
| 0.8C | closure_pass | 1 | 0/1 (0.00%) | 0/5 (0.00%) | 5/39 | 0 |
| 0.8D | closure_pass | 3 | 0/3 (0.00%) | 0/9 (0.00%) | 9/37 | 0 |
| 0.8D | speech_act_fulfilled | 3 | 0/3 (0.00%) | 0/9 (0.00%) | 9/37 | 0 |

Zero observed positives among the sampled closure-fails does not establish a zero false-negative rate in the population. D has no sampled old-pass/new-fail removals from the historical 16, so speech-act removal precision and removal loss remain UNKNOWN. speech_act_fulfilled=false is a broader category and must not be substituted for those incremental removals. Gates remain unchanged.

## Slot outcomes within sampled sibling sets

| Cohort | Slot | SKIP | KEEP | GOLD | Positive / reviewed |
| --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | 1 | 9 | 1 | 0 | 1/10 (10.00%) |
| 0.8B BASELINE | 2 | 8 | 2 | 0 | 2/10 (20.00%) |
| 0.8B BASELINE | 3 | 10 | 0 | 0 | 0/10 (0.00%) |
| 0.8B BASELINE | 4 | 7 | 3 | 0 | 3/10 (30.00%) |
| 0.8C | 1 | 8 | 2 | 0 | 2/10 (20.00%) |
| 0.8C | 2 | 8 | 2 | 0 | 2/10 (20.00%) |
| 0.8C | 3 | 10 | 0 | 0 | 0/10 (0.00%) |
| 0.8C | 4 | 9 | 1 | 0 | 1/10 (10.00%) |
| 0.8D | 1 | 7 | 3 | 0 | 3/10 (30.00%) |
| 0.8D | 2 | 7 | 3 | 0 | 3/10 (30.00%) |
| 0.8D | 3 | 9 | 1 | 0 | 1/10 (10.00%) |
| 0.8D | 4 | 8 | 2 | 0 | 2/10 (20.00%) |

Same-setup candidates are correlated. Slot differences in ten enriched sets per run are observations only, not new slot-selection rules.

## Test-retest

| Cohort | Historical vs recovery exact agreement | Upgrades | Downgrades |
| --- | --- | --- | --- |
| 0.8B BASELINE | 9/10 (90.00%) | 0 | 1 |
| 0.8C | 9/10 (90.00%) | 0 | 1 |
| 0.8D | 8/10 (80.00%) | 0 | 2 |

Anchor/recovery overlapping candidates: 20, exact agreement 20/20 (100.00%), upgrades 0, downgrades 0. This is a separate recent retest comparison, not a replacement for historical labels. Consecutive stations may retain recall/context/order effects.

## Pairwise evidence and readiness

46 validated directed pairs from 15 distinct sampled setups. Full pair direction distribution: {"KEEP_OVER_SKIP": 46}. Multiple pairs within a setup are dependent. All pairs preserve setup identity for future weighting; no same-label or cross-setup pairs. Phase1 pair-bearing setup overlap: 3. Do not naively append historical and new preferences as independent evidence.

JUDGE READINESS: NOT YET. Pair-bearing independent setup coverage remains small, this recovery has no GOLD labels and therefore no GOLD preference directions, sampling is case-control enriched, and retest changes remain. No claim of a universal sample-size cutoff. Before training, a separate decision is needed on grouped splits, duplicate/reference leakage, cross-session label handling and wider evidence coverage. No Dataset v1 or model training has been started in this analysis.

## Integrity and stop

120 exports match manifest, CSV, SQLite and audit events. Pair construction was independently recomputed and matched all exported pairs. Anchor confirmation freeze and 601 protected files remain unchanged. API calls: 0. Manifest SHA-256: 297fcc7426bbc83e82c35bd294775ffb98e8d79a7725037a088c24b25889013b.
