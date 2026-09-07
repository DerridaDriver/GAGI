import { createSupabaseServerClient } from "@/lib/supabase-server";
import { randomInt } from "node:crypto";

const ARENA_GENERATION_VERSION = "arena_v1_vs_v2.1";
const DISPLAY_SLOTS = ["A", "B", "C", "D"] as const;
const PAGE_SIZE = 1_000;
const GENERATION_CHUNK_SIZE = 100;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ArenaRequest = {
  sessionId?: unknown;
};

type ArenaGeneration = {
  id: string;
  topic: string;
};

type ArenaCandidate = {
  generation_id: string;
  display_slot: string;
  text: string;
  prompt_version: string;
};

type ArenaJokes = Record<(typeof DISPLAY_SLOTS)[number], string>;

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function chunk<T>(values: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function validateCandidates(
  candidates: ArenaCandidate[],
): ArenaJokes | null {
  if (candidates.length !== DISPLAY_SLOTS.length) {
    return null;
  }

  const writerV1Count = candidates.filter(
    (candidate) => candidate.prompt_version === "writer_v1",
  ).length;
  const writerV21Count = candidates.filter(
    (candidate) => candidate.prompt_version === "writer_v2.1",
  ).length;

  if (writerV1Count !== 2 || writerV21Count !== 2) {
    return null;
  }

  const jokes = {} as ArenaJokes;

  for (const slot of DISPLAY_SLOTS) {
    const matchingCandidates = candidates.filter(
      (candidate) =>
        candidate.display_slot === slot &&
        typeof candidate.text === "string" &&
        candidate.text.trim().length > 0,
    );

    if (matchingCandidates.length !== 1) {
      return null;
    }

    jokes[slot] = matchingCandidates[0].text;
  }

  return jokes;
}

export async function POST(request: Request) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return errorResponse("请求格式不正确。", 400);
  }

  if (
    typeof rawBody !== "object" ||
    rawBody === null ||
    Array.isArray(rawBody)
  ) {
    return errorResponse("请求格式不正确。", 400);
  }

  const body = rawBody as ArenaRequest;

  if (
    typeof body.sessionId !== "string" ||
    !uuidPattern.test(body.sessionId)
  ) {
    return errorResponse("sessionId 格式不正确。", 400);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return errorResponse("尚未配置 Supabase 服务端环境变量。", 503);
  }

  try {
    const generations: ArenaGeneration[] = [];

    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("generations")
        .select("id,topic")
        .eq("prompt_version", ARENA_GENERATION_VERSION)
        .order("id")
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error("Supabase Arena generation lookup failed", {
          code: error.code,
        });
        return errorResponse("获取下一题失败，请重试。", 502);
      }

      const page = (data ?? []) as ArenaGeneration[];
      generations.push(...page);

      if (page.length < PAGE_SIZE) {
        break;
      }
    }

    if (generations.length === 0) {
      return Response.json({ status: "NO_ARENA_ITEMS" });
    }

    const candidatesByGeneration = new Map<string, ArenaCandidate[]>();

    for (const generationIds of chunk(
      generations.map((generation) => generation.id),
      GENERATION_CHUNK_SIZE,
    )) {
      const { data, error } = await supabase
        .from("candidates")
        .select("generation_id,display_slot,text,prompt_version")
        .in("generation_id", generationIds);

      if (error) {
        console.error("Supabase Arena candidate lookup failed", {
          code: error.code,
        });
        return errorResponse("获取下一题失败，请重试。", 502);
      }

      for (const candidate of (data ?? []) as ArenaCandidate[]) {
        const current =
          candidatesByGeneration.get(candidate.generation_id) ?? [];
        current.push(candidate);
        candidatesByGeneration.set(candidate.generation_id, current);
      }
    }

    const eligible = generations.flatMap((generation) => {
      const jokes = validateCandidates(
        candidatesByGeneration.get(generation.id) ?? [],
      );

      return jokes ? [{ generation, jokes }] : [];
    });

    if (eligible.length === 0) {
      return Response.json({ status: "NO_ARENA_ITEMS" });
    }

    const votedGenerationIds = new Set<string>();

    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("votes")
        .select("generation_id")
        .eq("session_id", body.sessionId)
        .order("generation_id")
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error("Supabase Arena vote lookup failed", {
          code: error.code,
        });
        return errorResponse("获取下一题失败，请重试。", 502);
      }

      const page = (data ?? []) as { generation_id: string }[];

      for (const vote of page) {
        votedGenerationIds.add(vote.generation_id);
      }

      if (page.length < PAGE_SIZE) {
        break;
      }
    }

    const available = eligible.filter(
      ({ generation }) => !votedGenerationIds.has(generation.id),
    );

    if (available.length === 0) {
      return Response.json({ status: "NO_MORE_ARENA_ITEMS" });
    }

    const selected = available[randomInt(available.length)];

    return Response.json({
      generationId: selected.generation.id,
      topic: selected.generation.topic,
      jokes: selected.jokes,
    });
  } catch {
    console.error("Supabase Arena request encountered a network error");
    return errorResponse("获取下一题失败，请重试。", 502);
  }
}
