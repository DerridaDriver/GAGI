# GAGI 0.8A — Structural Proxy Collapse Autopsy

## A. Executive conclusion

This is an offline descriptive autopsy of the completed Wave 1 lineage. It made **0 API calls**, started no generation, and changed no production/corpus/model state. The governing conclusion is: **WHY is not the enemy; single-route structural monopolization is the failure mode.**

The Wave 1 labels are retained for diagnosis only. `do_not_promote=true` because the human label calibration drifted; 9 KEEP + 1 GOLD are not promoted.

## B. Lineage and integrity

`teacher raw 200 → gate input 208 → gate pass 196 → frozen 100 → raw 800 → deterministic 796 → closure 547 → shortlist 184 → final review 120 → useful 10`

- Frozen SHA-256: `d8b76285c190a12c83342f78f10e54c17500308e399780ad8fd8d47c9db9a57a`; manifest hash match: `True`.
- Shortlist ⊆ closure-pass: `True`; final ⊆ shortlist: `True`; review IDs = final IDs: `True`.

## C. Deterministic structure definitions

- Setup categories: WHY_CAUSAL, WHAT_DEFINITION, HOW_PROCEDURE, WHO_IDENTITY, WHEN_TEMPORAL, WHERE_LOCATION, YES_NO, CONDITIONAL, HYPOTHETICAL, STATEMENT_COMPLETION, DIALOGUE_REPLY, COMPARISON, OBSERVATION, OTHER.
- Exact WHY = literal `为什么`; broader WHY family = `为什么 / 为何 / 怎么会 / 怎么就 / 因何 / 凭什么`.
- Answer categories: BECAUSE_EXPLICIT, DIRECT_NOUN_PHRASE, DIRECT_SENTENCE, DEFINITION_REFRAME, DIALOGUE, PROCEDURAL, WORDPLAY, COMPARISON, OTHER.
- Exact BECAUSE = literal `因为`; broader causal family = `因为 / 由于 / 毕竟 / 所以 / 原因是`.
- Categories are mutually exclusive rule labels; exact/family markers are independent, so the audit remains inspectable.

## D. Setup-stage distribution

| Stage | Total | Exact 为什么 | WHY family | Dominant structure | Dominant share | Norm. entropy | HHI |
|---|---:|---:|---:|---|---:|---:|---:|
| teacher_raw | 200 | 198 (99.00%) | 198 (99.00%) | WHY_CAUSAL | 98.00% | 0.045 | 0.961 |
| setup_gate_input_all_sources | 208 | 205 (98.56%) | 205 (98.56%) | WHY_CAUSAL | 97.60% | 0.055 | 0.953 |
| setup_gate_pass | 196 | 193 (98.47%) | 193 (98.47%) | WHY_CAUSAL | 97.45% | 0.058 | 0.950 |
| frozen_manifest | 100 | 98 (98.00%) | 98 (98.00%) | WHY_CAUSAL | 96.00% | 0.079 | 0.922 |
| raw_candidate_parents | 800 | 784 (98.00%) | 784 (98.00%) | WHY_CAUSAL | 96.00% | 0.079 | 0.922 |
| deterministic_pass_parents | 796 | 780 (97.99%) | 780 (97.99%) | WHY_CAUSAL | 96.11% | 0.078 | 0.924 |
| closure_pass_parents | 547 | 538 (98.35%) | 538 (98.35%) | WHY_CAUSAL | 96.53% | 0.068 | 0.932 |
| shortlist_parents | 184 | 181 (98.37%) | 181 (98.37%) | WHY_CAUSAL | 96.20% | 0.075 | 0.926 |
| final_review_parents | 120 | 117 (97.50%) | 117 (97.50%) | WHY_CAUSAL | 95.83% | 0.082 | 0.919 |
| keep_gold_parents | 10 | 8 (80.00%) | 8 (80.00%) | WHY_CAUSAL | 80.00% | 0.190 | 0.680 |

Full category counts, stage pass rates and prior-stage enrichment factors are in `stage_distribution.csv` and JSON.

## E. Setup Potential Gate bias

- WHY family: n=205, pass=193, pass rate=94.15%.
- Non-WHY: n=3, pass=3, pass rate=100.00%.
- WHY/non-WHY pass-rate ratio: `0.941463`.
- All gate dimensions (`open_semantic_space`, `over_specified`, `already_half_a_joke`, answer pressure) are broken down in JSON.
- Interpretation is deliberately cautious: only 3 of 208 Gate inputs are non-WHY, so this stage cannot provide a strong counterfactual test.

## F. Gate-pass → frozen-100 selection

The Wave 1 runner first included all passing Production topics, seed-8080 shuffled passing teacher setups, grouped them by normalized domain, then used sorted-domain round robin until 100 and shuffled the chosen set before assigning IDs. It balanced declared domains, **not structural routes**. It contained no WHY/WHAT/HOW/etc. quota or anti-monopoly control.

## G. Candidate answer structures

| Stage | Total | Exact 因为 | Causal family | Dominant structure | Dominant share | Norm. entropy | HHI |
|---|---:|---:|---:|---|---:|---:|---:|
| raw_candidates | 800 | 640 (80.00%) | 640 (80.00%) | BECAUSE_EXPLICIT | 80.00% | 0.272 | 0.672 |
| deterministic_pass | 796 | 636 (79.90%) | 636 (79.90%) | BECAUSE_EXPLICIT | 79.90% | 0.272 | 0.671 |
| closure_pass | 547 | 428 (78.25%) | 428 (78.25%) | BECAUSE_EXPLICIT | 78.25% | 0.279 | 0.652 |
| shortlist | 184 | 147 (79.89%) | 147 (79.89%) | BECAUSE_EXPLICIT | 79.89% | 0.262 | 0.672 |
| final_review | 120 | 87 (72.50%) | 87 (72.50%) | BECAUSE_EXPLICIT | 72.50% | 0.318 | 0.588 |
| keep_gold | 10 | 7 (70.00%) | 7 (70.00%) | BECAUSE_EXPLICIT | 70.00% | 0.278 | 0.580 |

- WHY+causal answer closure rate: 67.89% (427/629).
- All other transitions closure rate: 71.86% (120/167).
- Rate ratio: `0.94474`.

The full setup×answer matrix through raw, deterministic, closure, shortlist, final, and useful is in `transition_matrix.csv`.

## H. Human review four-group outcome

| Group | Reviewed | SKIP | KEEP | GOLD | Useful | Useful rate |
|---|---:|---:|---:|---:|---:|---:|
| WHY+BECAUSE | 87 | 80 | 6 | 1 | 7 | 8.05% |
| WHY+non-BECAUSE | 30 | 29 | 1 | 0 | 1 | 3.33% |
| non-WHY+BECAUSE | 0 | 0 | 0 | 0 | 0 | n/a |
| non-WHY+non-BECAUSE | 3 | 1 | 2 | 0 | 2 | 66.67% |

## I. Structural vs surface diversity

Every candidate stage reports normalized unique-text ratio, setup/answer entropy, dominant share, HHI, and domain entropy/HHI in JSON. Domain diversity is explicitly supplemental: a pool can look domain-diverse while remaining structurally monopolized.

## J. SKIP vs KEEP vs GOLD descriptive profile

| Decision | n | Mean response length | Mean train similarity | Mean parent closure density | Causal-answer rate |
|---|---:|---:|---:|---:|---:|
| SKIP | 110 | 16.172727 | 0.25881 | 5.754545 | 72.73% |
| KEEP | 9 | 16.333333 | 0.259725 | 6 | 66.67% |
| GOLD | 1 | 10 | 0.333333 | 8 | 100.00% |

These are descriptive differences only; n=1 GOLD cannot support causal claims.

## K. Hypothesis verdicts

| Hypothesis | Verdict | Numeric evidence | Primary/secondary stage |
|---|---|---|---|
| H1 Setup Gate preferentially passes WHY | NOT_SUPPORTED | WHY gate pass=0.941463; non-WHY=1.0; ratio=0.941463; WHY share gate input=0.985577 -> pass=0.984694 | setup_gate |
| H2 Teacher raw pool is already WHY-heavy | SUPPORTED | Teacher raw WHY family=198/200 (0.99) | teacher_generation |
| H3 Candidate generation collapses toward explicit causal answers | SUPPORTED | Raw causal-answer family=640/800 (0.8) | candidate_generation |
| H4 Semantic Closure amplifies WHY→BECAUSE | NOT_SUPPORTED | WHY+causal closure pass=0.678855; other=0.718563; rate ratio=0.94474; transition share=0.790201->0.780622 | semantic_closure_gate |
| H5 Shortlist/global selection further amplifies WHY→BECAUSE | NOT_SUPPORTED | WHY+causal share closure=0.780622, shortlist=0.798913, final=0.725; closure-to-final delta=-0.055622 | shortlist_and_global_selection |

## L. Wave 1.1 corrective design and safety

- Keep setup quality gating independent from route balancing.
- Route-balance only among quality-pass setups; satisfy configurable minimums when available, then fill the least-occupied route under maximums.
- Never ban WHY or BECAUSE. Report route shortfalls instead of lowering quality thresholds.
- Do not modify human ranking in 0.8A.
- `do_not_promote=true`; accepted corpus unchanged.
- `pipeline_ready=true`, `generation_started=false`, `api_calls=0` after the companion skeleton dry-run/tests.
- Synthetic dry-run selected 100/100, all route shortfalls were zero, and all selected rows had `quality_pass=true`; 6/6 unit tests passed.
