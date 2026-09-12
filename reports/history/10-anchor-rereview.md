# GAGI 0.9A Anchor Recalibration

STATUS: COMPLETE. STOP BEFORE PAIRWISE.

120/120 exported human ratings verified against frozen content, original metadata, CSV, SQLite decisions and final audit events.

| Metric | Observed |
| --- | --- |
| New SKIP | 53 |
| New KEEP | 49 |
| New GOLD | 18 |
| Exact agreement | 97/120 (80.83%) |
| Positive retention | 64/81 (79.01%) |
| Negative-control upgrade | 3/39 (7.69%) |

## Historical positive cohorts

| Cohort | Original positive | New SKIP | New KEEP | New GOLD | Positive retention |
| --- | --- | --- | --- | --- | --- |
| Human Gold11 | 11 | 0 | 0 | 11 | 11/11 (100.00%) |
| Teacher Silver19 | 19 | 4 | 12 | 3 | 15/19 (78.95%) |
| Wave 1 | 10 | 2 | 7 | 1 | 8/10 (80.00%) |
| 0.8B BASELINE | 18 | 4 | 12 | 2 | 14/18 (77.78%) |
| 0.8B ROUTE_AWARE | 12 | 4 | 7 | 1 | 8/12 (66.67%) |
| 0.8C | 6 | 1 | 5 | 0 | 5/6 (83.33%) |
| 0.8D | 5 | 2 | 3 | 0 | 3/5 (60.00%) |

## Normalized label transitions

| Old / new | SKIP | KEEP | GOLD |
| --- | --- | --- | --- |
| SKIP | 36 | 3 | 0 |
| KEEP | 17 | 46 | 3 |
| GOLD | 0 | 0 | 15 |

## Negative controls

| Cohort | Controls | New SKIP | New KEEP | New GOLD | Upgrade rate |
| --- | --- | --- | --- | --- | --- |
| 0.8B BASELINE | 7 | 7 | 0 | 0 | 0/7 (0.00%) |
| 0.8C | 6 | 5 | 1 | 0 | 1/6 (16.67%) |
| Teacher Factory v0 | 6 | 5 | 1 | 0 | 1/6 (16.67%) |
| Wave 1 | 6 | 6 | 0 | 0 | 0/6 (0.00%) |
| 0.8B ROUTE_AWARE | 7 | 6 | 1 | 0 | 1/7 (14.29%) |
| 0.8D | 7 | 7 | 0 | 0 | 0/7 (0.00%) |

## Observation

All 15 historical GOLD observations remained GOLD, including all Human Gold11. Of 66 historical KEEP observations, 46 remained KEEP, 3 became GOLD and 17 became SKIP. All 3 KEEP-to-GOLD upgrades are Teacher Silver. Three of 39 historical SKIP controls became KEEP, none GOLD. Recommended derived tiers: ANCHOR_A=18, ANCHOR_B=49, REJECTED_ANCHOR=53. No corpus promotion.

## Interpretation

Gold anchors are stable in this retest; disagreement is concentrated at the KEEP/SKIP boundary. The results do not distinguish temporal calibration drift from test-retest noise, recall or order/context effects. Small cohort retention differences, especially D n=5 and C n=6, do not establish generator rankings. No significance screening or new humor proxy is used.

The 67/120 new positives are from an enriched station, not a natural run-level useful rate. Negative-control false-positive rate means upgrade relative to an old SKIP observation, not an objective error in the new human judgment. Historical 0.8B 18/46=39.13% remains unchanged; this retest does not replace historical labels or metrics.

## Recommendation and stopping point

Review these calibration results before authorizing Pairwise review. Pairwise remains 0/120 and has not been activated. Judge readiness is not reassessed as ready solely from this retest. No Dataset v1, training, promotion or pipeline changes. Original and recalibrated labels are separate observations.

## Integrity

Manifest SHA-256: b8c025ac33b1d4420d1c4fa53c7310eb7c1f33f5ddb66f524ec35ccfe9f907d6

Protected files verified: 601. Modified: 0. API calls: 0.
