"""Verify byte-identical archives, public links, and selected result summaries."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import collections
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]


def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def main():
    manifest = read("reports/source-manifest.json")
    for artifact in manifest["artifacts"]:
        data = (ROOT / artifact["path"]).read_bytes()
        assert hashlib.sha256(data).hexdigest() == artifact["sha256"], artifact["path"]
        assert len(data) == artifact["bytes"]

    links = 0
    # Inspect the publication narrative and archive index, not inline-code
    # references to intentionally unpublished files in old report snapshots.
    for name in ("README.md", "reports/README.md", "reports/PUBLICATION_AUDIT.md"):
        file = ROOT / name
        text = file.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", text):
            target = target.strip("<>")
            url = urlsplit(target)
            if url.scheme or target.startswith("#"):
                continue
            dest = (file.parent / unquote(url.path)).resolve()
            assert dest.is_relative_to(ROOT) and dest.exists(), (name, target)
            links += 1

    dataset = read("reports/history/09-human-value-dataset.json")
    assert (dataset["total_candidate_anchor_rows"], dataset["reviewed_including_anchors"], dataset["positive_including_anchors"], dataset["negative"]) == (1999, 368, 81, 287)
    factory = read("reports/history/03-teacher-factory-review.json")
    assert factory["decisions"] == {"SKIP": 23, "KEEP": 19, "GOLD": 0}
    checkpoints = read("reports/history/02-gold11-checkpoint-metrics.json")["memorization_curve"]
    assert [checkpoints[x]["exact_count"] for x in ("BASE", "STEP20", "STEP50", "STEP100")] == [0, 1, 11, 11]
    f = read("reports/history/16-09f-analysis.json")
    assert (f["winner_setups"], f["ALL_BAD"], f["baseline_wins"], f["treatment_wins"], f["human_global_feedback"], f["verdict"]) == (2, 14, 2, 0, "WORSE", "INCONCLUSIVE")
    g = read("reports/history/17-09g-analysis.json")
    rows = [json.loads(line) for line in (ROOT / "reports/history/17-09g-setup-outcomes.jsonl").read_text(encoding="utf-8").splitlines()]
    assert len(rows) == len({row["setup_id"] for row in rows}) == 8
    counts = collections.Counter(row["target_alignment"] for row in rows)
    assert counts == {"TARGET_HIT": 6, "CLEVER_ONLY": 1, None: 1}
    curve = {str(k): sum(row["target_alignment"] == "TARGET_HIT" and row["confirmed_winner_preliminary_batch"] <= k // 4 for row in rows) for k in (4, 8, 12, 16)}
    assert curve == g["confirmed_final_TARGET_HIT_location_at_k"] == {"4": 3, "8": 4, "12": 4, "16": 6}
    assert g["verdict"] == "INCONCLUSIVE" and g["deeper_target_after_first_batch_ALL_BAD"] == 1
    print(json.dumps({"status": "PASS", "archive_hashes": len(manifest["artifacts"]), "publication_links": links, "selected_aggregate_checks": "PASS", "09g_curve_recomputed": curve, "full_lab_reproduction": "NOT INCLUDED"}, indent=2))


if __name__ == "__main__":
    main()
