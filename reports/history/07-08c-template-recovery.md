# GAGI 0.8C Template Diversification Pilot

## Checkpoint A

Status: **PASS**. Frozen setups: 64, exactly 8 per route. Every frozen setup is route-correct, template-family-correct, Setup Potential quality-pass, and deterministic-pass. Every route has at least three template families and dominant share no greater than 37.5%.

| Route | 0.8B dominant | 0.8B HHI | 0.8C families | 0.8C dominant | 0.8C norm. entropy | 0.8C HHI |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| R1_WHY_CAUSAL | 100.0% | 1.000 | 3 | 37.5% | 0.520 | 0.344 |
| R2_WHAT_DEFINITION | 37.5% | 0.344 | 4 | 37.5% | 0.635 | 0.281 |
| R3_HOW_PROCEDURE | 75.0% | 0.625 | 4 | 25.0% | 0.667 | 0.250 |
| R4_WHO_IDENTITY | 75.0% | 0.594 | 4 | 37.5% | 0.635 | 0.281 |
| R5_WHEN_WHERE | 50.0% | 0.375 | 4 | 37.5% | 0.604 | 0.312 |
| R6_CONDITIONAL_HYPOTHETICAL | 75.0% | 0.625 | 3 | 37.5% | 0.520 | 0.344 |
| R7_DIALOGUE_REPLY | 87.5% | 0.781 | 3 | 37.5% | 0.520 | 0.344 |
| R8_STATEMENT_COMPARISON_OBSERVATION | 37.5% | 0.281 | 4 | 37.5% | 0.635 | 0.281 |

Frozen SHA-256: `5a286153fd56feb86617a1c591751590685e9d46ee449473ecdd1d87794dac52`.

## Candidate machine stage

- Candidate prompt: 0.8B BASELINE only.
- Raw candidates: 244 / 256.
- Deterministic pass: 240.
- Closure pass: 176 (73.33% of deterministic pass).
- 0.8B BASELINE closure reference: 152/250 (60.80%).
- Machine shortlist / blind finalists: 46; at most one per setup and never more than 64.

Human Q4/Q5 remain pending blind review. `poetic_quality=NOT_LABELED`. No promotion or training action was taken.


## 0.8C.1 targeted repair cost

| Round | Route | Family | API calls | New raw | New all-pass | Useful for frozen selection |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 1 | R5_WHEN_WHERE | R5_C_CONTEXT_LOCATION | 2 | 4 | 4 | 3 |
| 1 | R7_DIALOGUE_REPLY | R7_C_REQUEST_RESPONSE | 2 | 4 | 3 | 3 |

The repair used 4 API attempts and 8 new raw setups. It did not regenerate R1, R3, R4, R6, or R8. The only evaluator change was the documented R2 `称为什么` precedence bug fix; the template classifier, Setup Potential Gate, quality threshold, candidate prompt, Semantic Closure Gate, and shortlist logic remained unchanged.
