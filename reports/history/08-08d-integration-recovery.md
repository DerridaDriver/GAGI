# GAGI 0.8D — Pragmatic Slot Preservation Pilot

## Result

- Frozen setups: 64; 8 routes × 8; hash `531350c2bf94d551f1c6722c2c3678e3c368384d88ca346613d5ecc4ab01aa2f`.
- Existing candidates reused: 256; artifact hash `b92d59a851946002a67da72c975004d7c671549d52c5baf3b8af5773a5b51d59`.
- Recovery Closure evaluations: 256.
- OLD closure pass: 215.
- `speech_act_fulfilled=true`: 206.
- NEW closure pass: 199.
- Blind finalists: 2.

## Closure Recovery Incident

- Original hard cap: 224; revised hard cap: 264.
- Original Closure attempts / HTTP 400: 47 / 47.
- Original incident: 47 Closure attempts, all HTTP 400; the old runner did not capture the provider body.
- First recovery hypothesis: `max_tokens=1900` to `1800`; the first recovery still returned HTTP 400.
- The first recovery provider body revealed the missing literal `json` requirement.
- Minimal fix: `provider_json_mode_compliance_fix`; appended `只返回 JSON 对象，并严格遵循上述 schema。`
- Closure schema, judgment logic, expected answer act, speech-act definition, model, thinking mode and candidate artifacts were unchanged.
- Recovery attempts: 64.
- Recovery success: true; HTTP 400 reproduced: false.
- Frozen and candidate hashes remained unchanged.

All formal Closure rows come from `gagi_08d_closure_recovery_json_mode_20260909T112733Z` using `GAGI_08D_CLOSURE_RECOVERY_CONFIG_V2_JSON_MODE` and `GAGI_08D_CLOSURE_SPEECH_ACT_V1_PROVIDER_JSON_MODE_COMPLIANCE_FIX`. Original failed-attempt logs remain unchanged.

## Comparison

| Metric | 0.8B BASELINE | 0.8C | 0.8D |
| --- | ---: | ---: | ---: |
| human_useful_rate | 0.391304 | 0.130435 | pending |
| raw_useful_yield | 0.071429 | 0.024590 | pending |
| GOLD | 2 | 0 | pending |
| closure_rate | 0.608000 | 0.733333 | 0.777344 |
| route_entropy | 1.000000 | 1.000000 | 1.000000 |
| mean_template_entropy | 0.390960 | 0.592168 | 0.597478 |
| worst_template_hhi | 1.000000 | 0.343750 | 0.375000 |
| max_dominant_template | 1.000000 | 0.375000 | 0.500000 |
| HIGH_clarity_share | pending | 0.804348 | 1.000000 |
| speech_act_fulfilled_share | pending | 0.717391 | 0.804688 |

## State

Stopped at blind Human Review. `do_not_promote=true`; `promotion_started=false`; `qwen_training_started=false`; `wave2_started=false`.
