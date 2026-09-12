# Publication safety audit — 2026-09-12

## Release boundary

Target: the already-configured `origin` repository, `DerridaDriver/GAGI`, branch `main`. No new remote, force push, history rewrite, or credential rotation was performed by this documentation task.

The publication adds the root narrative, this archive/index, 27 byte-identical existing reports/aggregates, a source/hash manifest, and offline publication checks. It strengthens ignore rules and preserves snapshot line endings. Application code, database schemas, historical ratings and original Local Lab experiment files are unchanged. No model generation or training is part of publication.

## Credential and privacy findings

- A populated local environment file contains real provider/deployment credentials and other sensitive configuration. It is **untracked and ignored**, is not included in any archive snapshot, and is not being published. Values are never printed in this report.
- The two pre-publication commits and their 41 reachable blobs were inspected. No real credential or private machine path was detected in that reachable history. Empty environment-example values and runtime Authorization interpolation were reviewed as false positives, not deleted to cosmetically pass a scanner.
- The broader object audit inspected 174 local Git objects, including 136 blobs. **43 unreachable blobs contain machine-specific absolute paths.** They are absent from refs, reflogs and the index at audit time. These local historical/staging residues are not part of the intended branch push. They were not pruned or rewritten. No credential was detected in them. Do not distribute a copy/archive of the local `.git` directory.
- First-party working files and local experiment records were screened, including ignored run outputs and readable generated build files. Private paths occur in ignored local run/mapping material. Build outputs are excluded regardless of scanner findings. Dependency/package-store contents and a large binary build-cache file were not certified safe for publication; these directories are excluded wholesale.
- An additional exact-match check compares locally available sensitive environment values against publication files and Git objects without printing the values. Credential patterns cover provider/GitHub tokens, JWTs, private keys, database connection strings, and literal credential assignments.
- The published snapshot allowlist contains reports and aggregates only. No database dump, cookies, authorization-header log, raw provider request/response, user/session/IP table, complete reference corpus, or credential-bearing configuration is included. The selected report examples and experiment-level Human judgments are intentionally public research material.

The all-object counts above describe the initial audit, before this publication commit creates new objects. Rerunning the scanner will naturally report different total counts. Any newly reachable private-path object or any detected credential, including in an unreachable object, blocks its check.

## Historical evidence handling

[Source manifest](source-manifest.json) records original SHA-256, byte length and logical source locator for every copied artifact. No user-specific source root is published. The copies are exact, not edited to improve outcomes. Original Local Lab files remain read-only.

Archive-only Git attributes preserve original CRLFs and Markdown trailing spaces rather than editing historical bytes to satisfy whitespace lint. New documentation/code remains subject to ordinary diff whitespace checks; archive integrity is enforced by SHA-256.

The archive deliberately preserves obsolete recommendations, pending-stage reports and original field names. The [README](../README.md) and [archive notes](README.md) identify later memory-contamination findings, aborts, engineering rejection, and the evaluator's WORTH_LEARNING clarification. Semantic Escape's one missing rating remains missing.

## Intentionally excluded

- Populated environment files, deployment metadata, tokens and credentials.
- Private/local database files and dumps; public Supabase schema/migrations remain.
- Raw provider logs, request caches, full corpora and original review databases.
- Weights, adapters/checkpoints, downloads, virtual environments and compiled caches.
- `node_modules`, package stores, Next.js/build outputs and generated run directories.
- Reports containing machine-specific roots: safe existing aggregates were selected instead of rewriting the originals.

## Checks and limits

Run `python scripts/publication/verify.py` to validate 27 original-byte hashes, publication links, selected historical totals and the 0.9G final-winner location curve. This is partial analytic reproducibility, not a complete generation/training reproduction package.

Run `python scripts/publication/secret_scan.py` to inspect publication worktree files and all local Git objects. It reports locations/types, never matched secrets. Ignored runtime material is not certified public-safe. Pattern scanning cannot prove the absence of every possible secret or private datum; the explicit file allowlist and manual report review are additional controls. No third-party secret-scanner binary was installed in this environment.

Git integrity checking found local dangling trees, with no object corruption reported. These were retained, not hidden. Both pre-publication commits contain an ordinary author email rather than a GitHub noreply address; those commits already exist on the configured remote's `main`. Existing author metadata and the configured commit identity are retained; no author/history rewriting is performed.

Pre-staging checks passed: 27 archive hashes, 74 publication-relative links, selected aggregate calculations including the 0.9G curve, credential/publication scan, and the existing `pnpm lint` task. A read-only remote check matched the pre-publication local `main` SHA. An unauthenticated GitHub repository-metadata request returned HTTP 403, so that request did not establish repository visibility; this task does not change visibility settings.

Before commit/push, run Git status/diff/whitespace checks, publication checks and the existing Web lint task. Stage only the named publication files/directories; never blanket-stage ignored local data. Push only the existing `main` branch after checks pass. Do not include local cache directories to make a build or scan look reproducible.

## Remaining publication limits

- **No LICENSE file exists.** No license was selected or added. Licensing remains an owner decision.
- The full Local Lab and its raw provenance are not in this release. Some historical report references name intentionally unpublished files.
- Results come from small exploratory experiments and one primary evaluator. Endorsement is not an objective humor label or a laughter measurement.
- Provider behavior may change. Bit-for-bit generation reproduction is not promised.
- Local ignored credentials and unreachable path-bearing Git objects remain private on disk. This audit does not establish whether they were ever copied outside this machine by some other process; it establishes the examined publication/ref boundary.
