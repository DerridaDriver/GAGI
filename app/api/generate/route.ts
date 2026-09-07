import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  claimGenerationRequest,
  completeGenerationRequest,
  getNormalizedClientIp,
  hashClientIp,
  type GenerationFailureType,
  type RateLimitReason,
} from "@/lib/generation-rate-limit";
import {
  buildWriterUserPrompt,
  generateWithWriter,
  WRITER_MODEL as MODEL,
  WRITER_PROVIDER as PROVIDER,
  WRITER_THINKING_MODE as THINKING_MODE,
} from "@/lib/deepseek-writer";
import { randomInt } from "node:crypto";

const MAX_TOPIC_LENGTH = 120;
const DISPLAY_SLOTS = ["A", "B", "C", "D"] as const;
const ARENA_PROMPT_VERSIONS = ["writer_v1", "writer_v2.1"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Candidate rows carry the real provenance; this only satisfies the legacy field.
const ARENA_GENERATION_VERSION = "arena_v1_vs_v2.1";

const writerPrompts = {
  writer_v1: `你是 GAGI，一个实验性的中文笑话生成器。

你的任务不是回答问题，而是围绕用户给出的题目创作简短笑话。

创作要求：
1. 一次生成四个明显不同的候选笑话。
2. 尽可能短，不解释笑点。
3. 不添加“哈哈”“😂”等笑声，不评价自己的笑话，也不写“这是一个笑话”。
4. 四个版本不能只是同一句话改几个字。
5. 优先制造预期落差、语义转向、反高潮、荒诞因果、黑色幽默或语言错位。
6. 尽量让笑点发生在最后。
7. 不要输出前言或结语。

参数说明：
- 黑度 0：基本不涉及死亡、灾难、痛苦等黑色幽默；黑度 10：允许强烈的黑色幽默倾向。
- 荒诞度 0：逻辑相对现实；荒诞度 10：允许极端跳跃、疯狂和不合常理的逻辑。
- 恶俗度 0：语言相对克制；恶俗度 10：可以更加粗俗、低俗、恶趣味和不体面。

参数只是创作方向，不必强行把每个维度都塞进笑话。优先级始终是：好笑 > 符合参数 > 内容复杂。参数很高也不要写成长段。仍然遵守你必须遵守的安全规则。

只输出 JSON，格式必须严格为：
{"jokes":["笑话一","笑话二","笑话三","笑话四"]}`,
  writer_v2: `你是 GAGI 的笑话生成器。

你的任务不是解释一个问题，而是为这个问题寻找突然、短促、意外但可以瞬间理解的笑点。

生成 4 个中文笑话候选。

最重要的原则：

1. 优先“重新解释问题”，而不是正常回答问题。

答案最好能让题目中的某个词、对象、关系或前提突然获得第二种意义。

2. 优先寻找隐藏的第二语义。

可以使用：

- 一词多义
- 双关
- 谐音，但不要只为了谐音硬造答案
- 字面意义与惯用意义切换
- 角色身份错位
- 社会语境错位
- 历史语境错位
- 日常生活语境错位
- 身体语境
- 职业语境
- 媒介 / 技术语境
- 荒谬的字面化
- 框架切换
- 自执行笑点

3. 主动寻找较远的语义跳跃。

不要总是在题目附近寻找最合理的答案。

允许从题目突然跳到完全不同的语境。

但是跳跃之后，听众必须能够在很短时间内自己补上连接。

4. 不要把推理全部解释出来。

笑点成立以后立刻停止。

把最后一步推理留给听众。

不要在 punchline 后：

- 解释为什么好笑
- 补充设定
- 总结
- 继续抖机灵
- 加“因为……所以……”
- 加第二个无必要的笑点

如果一句话已经成立，就不要写第二句话。

5. punchline 尽可能短。

短不是绝对要求，但删除一句话以后如果仍然能成立，就删除。

6. 允许逻辑断裂。

笑话不需要像作文一样拥有完整因果链。

局部荒谬是允许的。

只要那个荒谬连接能够瞬间被听众恢复。

7. 允许愚蠢。

不要努力表现作者聪明。

一个非常蠢但精准的连接，可以比复杂精巧的解释更好笑。

8. 四个候选必须尽量使用不同的思考路径。

不要生成：

A：同一个点子的第一种说法
B：同一个点子的第二种说法
C：同一个点子的第三种说法
D：同一个点子的第四种说法

尽量让四个候选来自不同机制。

例如可以分别尝试：

- 词义重解释
- 框架切换
- 字面化
- 远距离语境跳跃

但不要机械规定 A/B/C/D 必须对应固定类型。

9. 不要为了一个低质量谐音硬造逻辑。

只有声音相似、却没有真正重新解释整个问题的谐音，不足以构成好笑话。

好的双关应该让一个词同时属于两个语义世界，或者让答案出现后重新改变题目的理解方式。

10. 避免“为答案制造问题”的冷笑话感。

不要让用户明显感觉：“你先想到一个谐音，然后为了它硬编了这个答案。”

优先使用题目本身已经存在的信息和隐含结构。

11. 避免标准 AI 幽默模板。

尤其减少“X 为什么很伤心？因为……”或“X 为什么不做 Y？因为……”再接普通拟人化双关的写法。

不要批量生产日历焦虑、数学书问题太多、电脑窗口太多这一类模板。

12. 不要解释真实事实以后再硬加一句俏皮话。

如果前半句已经只是正常知识答案，后面再补一句网络梗，通常不是好笑话。

13. 黑度、荒诞度、恶俗度必须参考用户给出的参数。

黑度较高时，可以更加接近死亡、灾难、失败、疾病、社会禁忌等黑色幽默语境。

荒诞度较高时，可以允许更大的框架跳跃和不合理连接。

恶俗度较高时，可以更粗俗、更身体化、更低俗。

但不要认为“黑色幽默 = 单纯攻击某个群体”。

禁忌只是可能使用的材料，不是笑点本身。

真正重要的是认知错位、压缩、重新解释和突然成立。

14. 优先考虑以下几类机制：

A. Frame Switch：框架切换。
B. Double Meaning：一词双挂，让同一个词同时属于两个语义世界。
C. Literalization：字面化，把惯用表达突然按照字面意义执行。
D. Self-Executing Joke：自执行笑点，让题目中的规则、疾病、动作或语言在 punchline 本身真正发生。
E. Distant Semantic Jump：远距离语义跳跃，把通常完全不同的语境突然连接；不要解释完整，让听众自己完成最后一步。

15. 每个候选在输出前进行一次内部检查：

- 我是不是在正常回答问题？
- 我是不是解释太多？
- punchline 后是不是还能删？
- 这个笑点是不是只有低质量谐音？
- 用户是不是在答案出来前就很容易猜到？
- 四条是不是本质上同一个梗？
- 答案是否让题目发生了重新解释？

如果存在明显问题，重新寻找一个更突然的方向。

参数说明：
- 黑度 0：基本不涉及死亡、灾难、痛苦等黑色幽默；黑度 10：允许强烈的黑色幽默倾向。
- 荒诞度 0：逻辑相对现实；荒诞度 10：允许极端跳跃、疯狂和不合常理的逻辑。
- 恶俗度 0：语言相对克制；恶俗度 10：可以更加粗俗、低俗、恶趣味和不体面。

参数只是创作方向，不必强行把每个维度都塞进笑话。优先级始终是：好笑 > 符合参数 > 内容复杂。参数很高也不要写成长段。仍然遵守你必须遵守的安全规则。

最终只输出规定格式中的四个笑话，不输出分析过程、前言或结语。

只输出 JSON，格式必须严格为：
{"jokes":["笑话一","笑话二","笑话三","笑话四"]}`,
  "writer_v2.1": `你是 GAGI 的中文笑话生成器。

根据用户给出的题目，以及黑度、荒诞度、恶俗度，生成 4 个不同的短笑话候选。

核心目标：

答案出现之前不容易猜到；
答案出现之后，可以迅速理解那个荒谬连接。

最重要的规则：

1. 直接给 punchline，不解释笑点。

2. 每条优先只写一句话。

3. 每条尽可能控制在 30 个中文字符左右。
确实无法成立时可以略长，但不要写成段落或小故事。

这是创作要求，不要通过程序截断字符串。

4. 笑点一旦成立，立即停止。

不要在 punchline 后：
- 解释
- 总结
- 补设定
- 再抖一个机灵
- 告诉用户为什么好笑

5. 不要优先正常回答“为什么”。

在构造因果解释之前，先尝试重新理解题目中的：
- 某个词
- 某个对象
- 某个动作
- 某种关系
- 某个默认前提

优先寻找第二种理解方式。

6. 可以优先尝试：

- 一词多义
- 框架切换
- 字面化
- 错误理解
- 身份错位
- 语境错位
- 远距离但能瞬间恢复的连接
- 语言本身执行题目中的动作
- 答案出现后让题目获得第二种意义

7. 谐音可以使用，但不要只因为两个词读音相似就认为它好笑。

如果只是低质量谐音，并且题目明显像为了谐音硬造出来的，放弃这个方向。

8. 避免完整因果作文。

如果一个答案的结构只是：

“因为发生了 X，所以变成了 Y。”

优先重新想一个方向。

特别是对于“为什么……”类题目，不要四条全部制造四种荒诞原因。

9. 四个候选尽量来自不同思路。

不要生成同一个笑点的四种改写。

10. 允许逻辑断裂。

不用把中间所有步骤讲完。

让听众自己补最后一步。

11. 允许愚蠢。

非常简单、非常蠢但准确的连接，可以比复杂解释更好笑。

不要努力表现聪明。

12. 黑度、荒诞度、恶俗度只改变内容方向和大胆程度。

黑度越高：
可以更接近死亡、失败、灾难、疾病、禁忌等黑色幽默材料。

荒诞度越高：
可以进行更远、更不合理的语境跳跃。

恶俗度越高：
可以更粗俗、更身体化、更低俗。

但是：

参数越高，不代表句子越长。

无论数值是 0 还是 10：
都不要增加解释长度、背景设定或故事长度。

数值越高 = 更大胆。
不是 = 更啰嗦。

13. 不要输出创作分析、幽默类型标签或推理过程。

仍然遵守你必须遵守的安全规则。

最终只按照现有 API 要求输出四个笑话候选。

只输出 JSON，格式必须严格为：
{"jokes":["笑话一","笑话二","笑话三","笑话四"]}`,
} as const;

type ArenaPromptVersion = (typeof ARENA_PROMPT_VERSIONS)[number];
type DisplaySlot = (typeof DISPLAY_SLOTS)[number];

type SelectedCandidate = {
  text: string;
  promptVersion: ArenaPromptVersion;
  sourceSlot: DisplaySlot;
};

type ArenaCandidate = SelectedCandidate & {
  displaySlot: DisplaySlot;
};

type GenerateRequest = {
  topic?: unknown;
  darkness?: unknown;
  absurdity?: unknown;
  vulgarity?: unknown;
  sessionId?: unknown;
};

function isValidLevel(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 10
  );
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function rateLimitedResponse(
  reason: RateLimitReason,
  retryAfterSeconds: number,
) {
  return Response.json(
    {
      error: "RATE_LIMITED",
      reason,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

function classifyGenerationFailure(error: unknown): GenerationFailureType {
  if (error instanceof Error && error.name === "AbortError") {
    return "timeout";
  }

  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("invalid JSON") ||
    message.includes("invalid jokes array") ||
    message.includes("empty content")
  ) {
    return "invalid_response";
  }

  if (
    message.includes("DeepSeek") ||
    message.toLowerCase().includes("fetch failed")
  ) {
    return "provider_error";
  }

  return "internal_error";
}

function shuffleInPlace<T>(items: T[]) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1);
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }

  return items;
}

function selectTwoRandomCandidates(
  jokes: string[],
  promptVersion: ArenaPromptVersion,
) {
  const candidates = jokes.map((text, index) => ({
    text,
    promptVersion,
    sourceSlot: DISPLAY_SLOTS[index],
  }));

  return shuffleInPlace(candidates).slice(0, 2) as SelectedCandidate[];
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

  const body = rawBody as GenerateRequest;

  if (typeof body.topic !== "string" || !body.topic.trim()) {
    return errorResponse("先给 GAGI 一个题目。", 400);
  }

  const topic = body.topic.trim();

  if (Array.from(topic).length > MAX_TOPIC_LENGTH) {
    return errorResponse("题目不能超过 120 个字符。", 400);
  }

  if (
    !isValidLevel(body.darkness) ||
    !isValidLevel(body.absurdity) ||
    !isValidLevel(body.vulgarity)
  ) {
    return errorResponse("笑话参数必须是 0 到 10 之间的数字。", 400);
  }

  if (
    typeof body.sessionId !== "string" ||
    !uuidPattern.test(body.sessionId)
  ) {
    return errorResponse("sessionId 格式不正确。", 400);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return errorResponse("尚未配置 DEEPSEEK_API_KEY。", 503);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return errorResponse("尚未配置 Supabase 服务端环境变量。", 503);
  }

  const rateLimitSalt = process.env.GAGI_RATE_LIMIT_SALT;

  if (!rateLimitSalt) {
    return errorResponse("尚未配置生成额度保护。", 503);
  }

  let claim;

  try {
    claim = await claimGenerationRequest(
      supabase,
      body.sessionId,
      hashClientIp(getNormalizedClientIp(request), rateLimitSalt),
    );
  } catch {
    console.error("Generation quota claim encountered a network error");
    return errorResponse("生成额度检查失败，请稍后再试。", 503);
  }

  if (claim.kind === "error") {
    return errorResponse("生成额度检查失败，请稍后再试。", 503);
  }

  if (claim.kind === "denied") {
    return rateLimitedResponse(claim.reason, claim.retryAfterSeconds);
  }

  const generationRequestId = claim.requestId;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 80_000);
  const deepSeekStartedAt = Date.now();
  const userPrompt = buildWriterUserPrompt({
    topic,
    darkness: body.darkness,
    absurdity: body.absurdity,
    vulgarity: body.vulgarity,
  });
  let arenaCandidates: ArenaCandidate[] = [];
  let latencyMs = 0;

  try {
    const [writerV1Jokes, writerV21Jokes] = await Promise.all([
      generateWithWriter(
        apiKey,
        ARENA_PROMPT_VERSIONS[0],
        writerPrompts[ARENA_PROMPT_VERSIONS[0]],
        userPrompt,
        controller.signal,
      ),
      generateWithWriter(
        apiKey,
        ARENA_PROMPT_VERSIONS[1],
        writerPrompts[ARENA_PROMPT_VERSIONS[1]],
        userPrompt,
        controller.signal,
      ),
    ]);

    const selectedCandidates = [
      ...selectTwoRandomCandidates(writerV1Jokes, ARENA_PROMPT_VERSIONS[0]),
      ...selectTwoRandomCandidates(writerV21Jokes, ARENA_PROMPT_VERSIONS[1]),
    ];

    arenaCandidates = shuffleInPlace(selectedCandidates).map(
      (candidate, index) => ({
        ...candidate,
        displaySlot: DISPLAY_SLOTS[index],
      }),
    );
    latencyMs = Date.now() - deepSeekStartedAt;
  } catch (error) {
    await completeGenerationRequest(
      supabase,
      generationRequestId,
      "failed",
      classifyGenerationFailure(error),
    );
    console.error("Blind Writer Arena generation failed", {
      reason:
        error instanceof Error && error.name === "AbortError"
          ? "DeepSeek requests timed out"
          : error instanceof Error
            ? error.message
            : "Unknown error",
    });
    return errorResponse("GAGI 暂时罢工了，请稍后再试。", 502);
  } finally {
    clearTimeout(timeout);
  }

  const generatedJokes = arenaCandidates.map((candidate) => candidate.text);

  try {
    const { data: generation, error: generationError } = await supabase
      .from("generations")
      .insert({
        topic,
        darkness: body.darkness,
        absurdity: body.absurdity,
        vulgarity: body.vulgarity,
        joke_a: generatedJokes[0],
        joke_b: generatedJokes[1],
        joke_c: generatedJokes[2],
        joke_d: generatedJokes[3],
        provider: PROVIDER,
        model: MODEL,
        thinking_mode: THINKING_MODE,
        prompt_version: ARENA_GENERATION_VERSION,
        latency_ms: latencyMs,
      })
      .select("id")
      .single();

    if (generationError || !generation?.id) {
      await completeGenerationRequest(
        supabase,
        generationRequestId,
        "failed",
        "internal_error",
      );
      console.error("Supabase generation insert failed", {
        code: generationError?.code,
      });
      return errorResponse(
        "笑话生成成功，但实验记录保存失败，请重试。",
        502,
      );
    }

    const { error: candidatesError } = await supabase
      .from("candidates")
      .insert(
        arenaCandidates.map((candidate) => ({
          generation_id: generation.id,
          display_slot: candidate.displaySlot,
          text: candidate.text,
          provider: PROVIDER,
          model: MODEL,
          thinking_mode: THINKING_MODE,
          prompt_version: candidate.promptVersion,
          source_slot: candidate.sourceSlot,
        })),
      );

    if (candidatesError) {
      console.error("Supabase candidates insert failed", {
        code: candidatesError.code,
      });

      const { error: cleanupError } = await supabase
        .from("generations")
        .delete()
        .eq("id", generation.id);

      if (cleanupError) {
        console.error("Incomplete Arena generation cleanup failed", {
          generationId: generation.id,
          code: cleanupError.code,
        });
      }

      await completeGenerationRequest(
        supabase,
        generationRequestId,
        "failed",
        "internal_error",
      );
      return errorResponse(
        "笑话生成成功，但实验记录保存失败，请重试。",
        502,
      );
    }

    await completeGenerationRequest(
      supabase,
      generationRequestId,
      "success",
      null,
    );
    return Response.json({
      generationId: generation.id,
      jokes: generatedJokes,
    });
  } catch {
    await completeGenerationRequest(
      supabase,
      generationRequestId,
      "failed",
      "internal_error",
    );
    console.error("Supabase generation insert encountered a network error");
    return errorResponse(
      "笑话生成成功，但实验记录保存失败，请重试。",
      502,
    );
  }
}
