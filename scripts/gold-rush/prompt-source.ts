import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const EXPECTED_PROMPT_HASHES = {
  writer_v1: "554D6769130AF1D3615487A73BB16665D85B3021CC67BCFEC80DF8E7E3F5F124",
  writer_v2: "6F9CA74391BBA88FCF103717697CC77B260DE0AB8F0D52C79E755ABDAC61BE4D",
  "writer_v2.1": "2D753AE4AAC5E3B6C3929F9AD529AFEF016842B0900FD261D9ECAC5BF2931C5B",
} as const;

const promptPatterns = {
  writer_v1: /writer_v1: `([\s\S]*?)`,\r?\n\s*writer_v2:/,
  writer_v2: /writer_v2: `([\s\S]*?)`,\r?\n\s*"writer_v2\.1":/,
  "writer_v2.1": /"writer_v2\.1": `([\s\S]*?)`,\r?\n}\s+as const;/,
} as const;

export type FrozenPromptVersion = keyof typeof EXPECTED_PROMPT_HASHES;

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex").toUpperCase();
}

export function loadFrozenWriterPrompts() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const routePath = resolve(
    scriptDirectory,
    "../../app/api/generate/route.ts",
  );
  const source = readFileSync(routePath, "utf8");
  const prompts = {} as Record<FrozenPromptVersion, string>;

  for (const version of Object.keys(
    EXPECTED_PROMPT_HASHES,
  ) as FrozenPromptVersion[]) {
    const match = source.match(promptPatterns[version]);

    if (!match?.[1]) {
      throw new Error(`无法从正式路由读取 ${version}。`);
    }

    const hash = sha256(match[1]);
    if (hash !== EXPECTED_PROMPT_HASHES[version]) {
      throw new Error(
        `${version} SHA-256 不匹配；已停止实验以防 Prompt 漂移。`,
      );
    }

    prompts[version] = match[1];
  }

  return prompts;
}
