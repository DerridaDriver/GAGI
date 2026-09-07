import { createSupabaseServerClient } from "@/lib/supabase-server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedChoices = ["A", "B", "C", "D", "ALL_BAD"] as const;
const allowedModes = ["ask", "arena"] as const;

type VoteChoice = (typeof allowedChoices)[number];
type VoteMode = (typeof allowedModes)[number];

type VoteRequest = {
  generationId?: unknown;
  sessionId?: unknown;
  choice?: unknown;
  mode?: unknown;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isVoteChoice(value: unknown): value is VoteChoice {
  return (
    typeof value === "string" &&
    allowedChoices.includes(value as VoteChoice)
  );
}

function isVoteMode(value: unknown): value is VoteMode {
  return (
    typeof value === "string" &&
    allowedModes.includes(value as VoteMode)
  );
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

  const body = rawBody as VoteRequest;

  if (
    typeof body.generationId !== "string" ||
    !uuidPattern.test(body.generationId)
  ) {
    return errorResponse("generationId 格式不正确。", 400);
  }

  if (
    typeof body.sessionId !== "string" ||
    !uuidPattern.test(body.sessionId)
  ) {
    return errorResponse("sessionId 格式不正确。", 400);
  }

  if (!isVoteChoice(body.choice)) {
    return errorResponse("投票选项不正确。", 400);
  }

  const requestedMode = body.mode ?? "ask";

  if (!isVoteMode(requestedMode)) {
    return errorResponse("投票模式不正确。", 400);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return errorResponse("尚未配置 Supabase 服务端环境变量。", 503);
  }

  try {
    const { data: generation, error: generationError } = await supabase
      .from("generations")
      .select("id")
      .eq("id", body.generationId)
      .maybeSingle();

    if (generationError) {
      console.error("Supabase generation lookup failed", {
        code: generationError.code,
      });
      return errorResponse("投票保存失败，请再试一次。", 502);
    }

    if (!generation) {
      return errorResponse("找不到这轮笑话，请重新生成。", 404);
    }

    const { data: existingVote, error: existingVoteError } = await supabase
      .from("votes")
      .select("id")
      .eq("generation_id", body.generationId)
      .eq("session_id", body.sessionId)
      .maybeSingle();

    if (existingVoteError) {
      console.error("Supabase existing vote lookup failed", {
        code: existingVoteError.code,
      });
      return errorResponse("投票保存失败，请再试一次。", 502);
    }

    if (existingVote) {
      const { error: updateError } = await supabase
        .from("votes")
        .update({ choice: body.choice })
        .eq("id", existingVote.id);

      if (updateError) {
        console.error("Supabase vote update failed", {
          code: updateError.code,
        });
        return errorResponse("投票保存失败，请再试一次。", 502);
      }
    } else {
      const { error: insertError } = await supabase.from("votes").insert({
        generation_id: body.generationId,
        session_id: body.sessionId,
        choice: body.choice,
        mode: requestedMode,
      });

      if (insertError?.code === "23505") {
        const { error: concurrentUpdateError } = await supabase
          .from("votes")
          .update({ choice: body.choice })
          .eq("generation_id", body.generationId)
          .eq("session_id", body.sessionId);

        if (concurrentUpdateError) {
          console.error("Supabase concurrent vote update failed", {
            code: concurrentUpdateError.code,
          });
          return errorResponse("投票保存失败，请再试一次。", 502);
        }
      } else if (insertError) {
        console.error("Supabase vote insert failed", {
          code: insertError.code,
        });
        return errorResponse("投票保存失败，请再试一次。", 502);
      }
    }

    return Response.json({ saved: true, choice: body.choice });
  } catch {
    console.error("Supabase vote request encountered a network error");
    return errorResponse("投票保存失败，请再试一次。", 502);
  }
}
