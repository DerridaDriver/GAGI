# GAGI 0.8D — Recovered Blind Human Review Analysis

Created: `2026-09-09T13:15:22.520632Z`

## Outcome

- Official recovered queue: **58/58 reviewed** (old invalidated 2 excluded).
- SKIP **53**, KEEP **5**, GOLD **0**.
- Useful: **5/58 = 8.62%**; Wilson 95% CI **3.74%–18.64%**.
- Raw useful yield: **5/256 = 1.95%**.

## Comparison

| Metric | 0.8B BASELINE | 0.8C | 0.8D |
|---|---:|---:|---:|
| Human useful rate | 39.13% | 13.04% | 8.62% |
| Raw useful yield | 7.14% | 2.46% | 1.95% |
| GOLD | 2 | 0 | 0 |
| Closure rate | 60.80% | 73.33% | 77.73% |
| Route entropy | 1.000 | 1.000 | 1.000 |
| Mean template entropy | 0.390960 | 0.592168 | 0.597478 |
| Worst template HHI | 1.00000 | 0.34375 | 0.37500 |
| Max dominant template | 100.00% | 37.50% | 50.00% |
| HIGH clarity share | N/A | 80.43% | 100.00% |
| Speech-act fulfilled share | N/A | 71.74% | 80.47% |

0.8D versus 0.8B BASELINE: **-30.51 pp**, Fisher two-sided `p=0.000271`. 0.8D versus 0.8C: **-4.42 pp**, Fisher two-sided `p=0.531272`.

## Route recovery

| Route | 0.8B BASELINE | 0.8C | 0.8D | 0.8D useful |
|---|---:|---:|---:|---:|
| R1_WHY_CAUSAL | 16.67% | 50.00% | 0.00% | 0/6 |
| R2_WHAT_DEFINITION | 60.00% | 0.00% | 28.57% | 2/7 |
| R3_HOW_PROCEDURE | 50.00% | 0.00% | 28.57% | 2/7 |
| R4_WHO_IDENTITY | 20.00% | 33.33% | 0.00% | 0/6 |
| R5_WHEN_WHERE | 33.33% | 0.00% | 0.00% | 0/8 |
| R6_CONDITIONAL_HYPOTHETICAL | 33.33% | 0.00% | 0.00% | 0/8 |
| R7_DIALOGUE_REPLY | 66.67% | 0.00% | 12.50% | 1/8 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 33.33% | 0.00% | 0.00% | 0/8 |

R2, R3, and R7 recovered from 0% to non-zero useful rates, but none returned to its 0.8B BASELINE level. Five routes produced zero useful finalists. This is **partial route recovery without overall value recovery**.

## Answer-slot hypothesis

All 64 frozen setups were HIGH clarity, yet downstream useful rate was only **8.62%**, below both 0.8C overall (**13.04%**) and the 0.8C HIGH-clarity subgroup (**16.22%**). Clear answer slots are therefore **not sufficient** under the current candidate, closure, and S1 selector stack. The design does not retest whether clarity is necessary because no MEDIUM/LOW controls were reviewed.

## Speech-act gate precision

The old closure passed **215/256** candidates; the speech-act-aware closure passed **199/256** and removed **16/215 (7.44%)** of old-pass candidates. Among the 58 one-per-setup new-pass S1 finalists, **5/58 (8.62%)** were useful.

The gate's removal precision is **not identifiable**: the 16 removed candidates were not human-reviewed, so the experiment cannot measure whether they were correctly filtered SKIPs or false-negative KEEP/GOLD items. The 8.62% figure is downstream finalist useful precision, not the precision of all 199 gate passes.

## Selector and incident caveats

- Formal estimates cover the deterministic S1 recovered queue only. The old 2-item LLM shortlist remains invalidated and is excluded.
- S1 selects the lowest stable candidate source slot among new-closure-pass candidates; results therefore include a deterministic source-slot selection effect.
- The full HTTP 400 → JSON-mode compliance recovery → shortlist-selector-collapse lineage remains preserved.

## Decision

0.8D did not restore human value. Keep the result as a negative pilot: structural closure improved, but human utility fell to 8.62%. Do not promote any item automatically, and do not infer gate precision without a labeled shadow/control sample.

## Safety state

`api_attempts=249`, `new_api_calls=0`, `do_not_promote=true`, `promotion_started=false`, `qwen_training_started=false`, `wave2_started=false`.
