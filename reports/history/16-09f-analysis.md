# GAGI 0.9F Mechanism Transfer Writer Pilot v0

SETUPS: 16 / 16

CONTROL: 0.8B BASELINE, 2 candidates/setup; exact historical recovery.

TREATMENT: MECHANISM_SEARCH, 2 independent candidates/setup.

HUMAN: winner setups = 2; ALL_BAD = 14; winner rate = 12.50%.

ARM WINS: BASELINE = 2; MECHANISM_SEARCH = 0.

HUMAN GLOBAL FEEDBACK: WORSE; persisted before arm reveal.

| Route | Setups | Baseline wins | Treatment wins | ALL_BAD |
|---|---:|---:|---:|---:|
| R1_WHY_CAUSAL | 2 | 0 | 0 | 2 |
| R2_WHAT_DEFINITION | 2 | 0 | 0 | 2 |
| R3_HOW_PROCEDURE | 2 | 0 | 0 | 2 |
| R4_WHO_IDENTITY | 2 | 0 | 0 | 2 |
| R5_WHEN_WHERE | 2 | 0 | 0 | 2 |
| R6_CONDITIONAL_HYPOTHETICAL | 2 | 1 | 0 | 1 |
| R7_DIALOGUE_REPLY | 2 | 0 | 0 | 2 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 2 | 1 | 0 | 1 |

Source-slot wins: {'BASELINE': {'1': 1, '2': 1, '3': 0, '4': 0}, 'MECHANISM_SEARCH': {'1': 0, '2': 0}}

Source-slot exposures: {'BASELINE': {'1': 8, '2': 9, '3': 10, '4': 5}, 'MECHANISM_SEARCH': {'1': 16, '2': 16}}

Display-position wins: {'A': 2, 'B': 0, 'C': 0, 'D': 0}; exposures are 16 per position.

NEW API CALLS: 32

TECHNICAL RETRIES: 0; API technical failures: 0.

CONTROL HISTORICAL RECOVERY: PASS

MODEL TRAINING: 0; JUDGE TRAINING: 0; QLoRA: 0

HISTORICAL FILES MODIFIED: 0 (2030 protected files verified).

CANDIDATE MANIFEST SHA: 69fe6f506cc6a4d2038589ad6d1db73740234011b0611b5c02424b99d4d87894

VERDICT: INCONCLUSIVE

Explicit Human pattern-collapse report recorded: False. No report is not proof of absence. CLOSER/SAME/WORSE/UNSURE is one batch-level judgment, not a candidate label or an automatic collapse diagnosis. Later unsolicited feedback requires an additive verdict note.

Analysis unit is 2 winner-producing setups out of 16, not 64 candidates or 6 derived pairs. Three pairs from one setup are dependent; ALL_BAD creates zero pairs and no absolute candidate negatives. No p-values or efficacy claim. A promising result would only suggest a preference signal worth validating on this small batch; it would not establish a taste formula. Control reuse and the exploratory mechanism contract are intentional features of this pilot.

0.9C remains ABORTED_BY_HUMAN_DISTRIBUTION_REJECTION, 27/128 reviewed. 0.9D-A remains ABORTED_BY_THEMATIC_STEREOTYPE_COLLAPSE. No holdout labels used.

STOP. No scale-up, no Writer revision, no Joke Judge training. Await Human decision.
