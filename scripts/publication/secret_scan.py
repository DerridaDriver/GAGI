"""Offline publication scan. Reports locations/types, never matched secret values.

This is a conservative project-specific check, not a claim that regex can prove
the absence of every credential or personal datum. No network calls are made.
"""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
PATTERNS = {
    "provider_token": re.compile(r"(?i)\b(?:sk-[a-z0-9_-]{16,}|gh[pousr]_[a-z0-9]{20,}|github_pat_[a-z0-9_]{20,}|sb_secret_[a-z0-9_-]{15,}|xox[baprs]-[a-z0-9-]{15,})"),
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "jwt": re.compile(r"\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{10,}"),
    "aws_key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "database_connection": re.compile(r"(?i)(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://[^\s\"']+"),
    "private_absolute_path": re.compile(r"(?i)(?:[a-z]:[\\/]+Users[\\/]+[^\s\"'<>`]+|/(?:Users|home)/[^\s\"'<>`]+)"),
}
LITERAL = re.compile(r'''(?im)["']?(?:[A-Z_]*(?:API_KEY|SECRET_KEY|SERVICE_ROLE_KEY|ACCESS_TOKEN|AUTH_TOKEN|PASSWORD|DATABASE_URL)|authorization|cookie)["']?[ \t]*[:=][ \t]*["']([^\r\n"']{8,})["']''')
PRIVATE_SUFFIXES = {".sqlite", ".sqlite3", ".db", ".dump", ".gguf", ".safetensors", ".pt", ".pth", ".ckpt", ".pem", ".key", ".p12", ".pfx", ".bak", ".log"}


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def local_values():
    """Use local credentials only for exact-match detection; never output them."""
    found = []
    for path in ROOT.glob(".env*"):
        if path.name in {".env.example", ".env.local.example"}:
            continue
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if "=" not in line or line.lstrip().startswith("#"):
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            if len(value) >= 12 and any(word in key.upper() for word in ("KEY", "TOKEN", "SECRET", "PASSWORD", "SALT", "URL")):
                found.append(value)
    return found


def placeholder(value):
    value = value.lower()
    return any(x in value for x in ("your-", "your_", "example", "placeholder", "${", "process.env", "os.environ", "required", "missing"))


def findings(data, known):
    text = data.decode("utf-8", errors="replace")
    hits = []
    for kind, pattern in PATTERNS.items():
        for match in pattern.finditer(text):
            if not placeholder(match.group(0)):
                hits.append({"kind": kind, "line": text.count("\n", 0, match.start()) + 1})
    for match in LITERAL.finditer(text):
        if not placeholder(match.group(1)):
            hits.append({"kind": "literal_credential_candidate", "line": text.count("\n", 0, match.start()) + 1})
    for value in known:
        if value in text:
            hits.append({"kind": "exact_local_sensitive_value", "line": text.count("\n", 0, text.index(value)) + 1})
    return hits


def main():
    known = local_values()
    paths = set(git("ls-files", "-z").decode().split("\0"))
    paths.update(git("ls-files", "--others", "--exclude-standard", "-z").decode().split("\0"))
    paths.discard("")
    errors = []
    checked = 0
    for name in sorted(paths):
        path = ROOT / name
        if not path.is_file():
            continue
        if (path.suffix.lower() in PRIVATE_SUFFIXES or
                any(part in {"node_modules", ".next", ".vercel", ".pnpm-store", "private", "checkpoints", "__pycache__"} for part in path.parts) or
                (path.name.startswith(".env") and path.name not in {".env.example", ".env.local.example"})):
            errors.append({"path": name, "kind": "private_or_generated_publication_path"})
        if path.stat().st_size > 10_000_000:
            errors.append({"path": name, "kind": "large_file_requires_explicit_review"})
        hits = findings(path.read_bytes(), known)
        if hits:
            errors.append({"path": name, "findings": hits})
        checked += 1

    # Include unreachable local objects, not just HEAD: deleting a file is not
    # sufficient to remove an older credential from an object database.
    reachable = {line.split(" ", 1)[0] for line in git("rev-list", "--objects", "--all", "--reflog").decode().splitlines()}
    indexed = {line.split()[1] for line in git("ls-files", "-s").decode().splitlines()}
    local_residue = []
    proc = subprocess.Popen(["git", "cat-file", "--batch-all-objects", "--batch"], cwd=ROOT, stdout=subprocess.PIPE)
    object_count = blob_count = 0
    while True:
        header = proc.stdout.readline()
        if not header:
            break
        oid, kind, size = header.decode().split()
        data = proc.stdout.read(int(size))
        assert proc.stdout.read(1) == b"\n"
        object_count += 1
        if kind == "blob":
            blob_count += 1
        if kind in {"blob", "commit", "tag"}:
            hits = findings(data, known)
            if hits:
                entry = {"git_object": oid, "object_type": kind, "findings": hits}
                if oid not in reachable | indexed and all(hit["kind"] == "private_absolute_path" for hit in hits):
                    # Report, never erase: these objects are not transmitted by
                    # the intended branch push. Actual credentials still block,
                    # even when unreachable. Never publish a .git directory.
                    local_residue.append(entry)
                else:
                    errors.append(entry)
    assert proc.wait() == 0
    print(json.dumps({"status": "PASS" if not errors else "REVIEW_REQUIRED", "publication_files_checked": checked, "git_objects_checked": object_count, "git_blobs_checked": blob_count, "exact_local_value_check_available": bool(known), "findings": errors, "unreachable_local_path_blob_count": len(local_residue), "local_residue_note": "Unreachable path-only objects are reported and retained locally; not in refs/reflogs/index. Do not distribute .git. Credentials in any object would block.", "scope": "Publication worktree and all local Git objects; ignored local data is excluded from publication, not certified public-safe."}, indent=2))
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
