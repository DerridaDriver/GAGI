# GAGI 0.9G Rare-Hit Search Capacity Pilot

SETUPS: 8

CANDIDATES: 128; 16/setup. Four independent fresh-context BASELINE requests per setup, with four jointly generated siblings each. No IID claim for all individual candidates.

PRELIMINARY: 32 decisions; survivors = 12; ALL_BAD groups = 20; setups with >=1 survivor = 7.

FINAL: winner setups = 7; ALL_BAD setups = 1.

TARGET ALIGNMENT: TARGET_HIT = 6; CLEVER_ONLY = 1.

PRIMARY OUTCOME: TARGET_HIT / 8 = 6 / 8 (75.0%).

| Search depth | ANY_SURVIVOR | Confirmed final TARGET_HIT located within prefix |
|---|---:|---:|
| 4 | 6 / 8 | 3 / 8 |
| 8 | 6 / 8 | 4 / 8 |
| 12 | 7 / 8 | 4 / 8 |
| 16 | 7 / 8 | 6 / 8 |

The TARGET curve is retrospective: only final winners receive target labels. It locates those confirmed winners in the frozen review order; it does not label earlier survivors as non-target or estimate complete counterfactual target@k. Review groups randomly mix generation batches. No post-hoc order optimization.

Deeper confirmed TARGET_HIT after first review batch ALL_BAD: 1 setups.

| Route | Any survivor | Final winner | TARGET_HIT | CLEVER_ONLY | FINAL_ALL_BAD |
|---|---:|---:|---:|---:|---:|
| R1_WHY_CAUSAL | 1 | 1 | 1 | 0 | 0 |
| R2_WHAT_DEFINITION | 1 | 1 | 1 | 0 | 0 |
| R3_HOW_PROCEDURE | 1 | 1 | 1 | 0 | 0 |
| R4_WHO_IDENTITY | 1 | 1 | 0 | 1 | 0 |
| R5_WHEN_WHERE | 1 | 1 | 1 | 0 | 0 |
| R6_CONDITIONAL_HYPOTHETICAL | 1 | 1 | 1 | 0 | 0 |
| R7_DIALOGUE_REPLY | 0 | 0 | 0 | 0 | 1 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 1 | 1 | 1 | 0 | 0 |

VERDICT: INCONCLUSIVE

GENERAL_CLEVERNESS_PRESENT operational case: False.

The preregistered A/B/C thresholds and their precedence are unchanged. TARGET_DISTRIBUTION_ABSENT, if triggered, is a diagnostic tag for sparse target evidence in this pilot, not proof of zero probability. This is a capability diagnostic with setup as the unit; no p-values or pair-count success criterion. A different setup prior prevents attributing cross-experiment differences to search depth alone.

API ATTEMPTS: 50

TECHNICAL RETRIES (API attempts caused by technical failure): 2

CANDIDATE SLOT TECHNICAL FAILURES: 2

HUMAN ACTIONS: 43 (32 preliminary, 4 final comparisons, 7 target labels). Automatic final records: 4; these are not Human labels.

MANIFEST SHA: 0d098c74387f8c17adb2a0bc1c97adcc8805f127db5926c0a1e9bb2edd0aa0c7

PROTOCOL SHA: 95b747fd962b8f452756fd1275ecfeec431c2ad05469e1baec7842211458d6a8

HISTORICAL FILES MODIFIED: 0 (2227 protected files verified).

MODEL TRAINED: NO

0.9F retains INCONCLUSIVE statistically and MECHANISM_SEARCH_V0 = REJECTED_FOR_CONTINUATION as a separate engineering decision. No historical labels, accepted corpus or production state were changed. ALL_BAD remains group-level; unlabeled candidates are not assigned absolute negatives. This pilot produces comparison provenance, not a promoted Judge training corpus.

STOP. No model/Judge training, no Writer changes, no scale-up, no next prompt experiment. Await Human decision.
