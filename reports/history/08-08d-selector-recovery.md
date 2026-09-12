# GAGI 0.8D — Shortlist Selector Recovery

## Outcome

- Closure Recovery remained successful: 199 NEW Closure-pass candidates across 58/64 setups.
- The old 2 finalists are `INVALIDATED_BY_SHORTLIST_SELECTOR_COLLAPSE` and are excluded from formal Human Review.
- S1 and S2 were compared offline without Human labels or API calls.
- Selected recovery selector: `GAGI_08D_DETERMINISTIC_LOCAL_SELECTOR_S1_MINIMAL_V1`.
- Recovered blind finalists: 58; exactly one for every setup with at least one NEW Closure-pass candidate.
- New API calls: 0; total attempts remain 249.

## Selector decision

Every eligible candidate already satisfies the same Closure and speech-act hard conditions. S2 demonstrated no validated reduction in structural anomalies; it only preferred lower training similarity. S1 therefore preserves the neutral separation: Structural Gate validates, deterministic selector samples, Human Review judges value.

## Frozen assets

- Frozen manifest SHA-256: `531350c2bf94d551f1c6722c2c3678e3c368384d88ca346613d5ecc4ab01aa2f`.
- Candidate artifact SHA-256: `b92d59a851946002a67da72c975004d7c671549d52c5baf3b8af5773a5b51d59`.
- Closure artifact SHA-256: `ca7f9e13f87873bbd5a8a389c65243142faaf6c752e1ab388e9d0d2871e688ed`.

## State

Waiting for recovered blind Human Review. `do_not_promote=true`; `promotion_started=false`; `qwen_training_started=false`; `wave2_started=false`.
