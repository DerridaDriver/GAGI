"use client";

import { FormEvent, useState } from "react";
import { getOrCreateSessionId } from "@/lib/browser-session";

const sliderConfig = [
  { key: "darkness", label: "黑度" },
  { key: "absurdity", label: "荒诞度" },
  { key: "vulgarity", label: "恶俗度" },
] as const;

type SliderKey = (typeof sliderConfig)[number]["key"];
type Vote = "A" | "B" | "C" | "D" | "all";
type VoteChoice = "A" | "B" | "C" | "D" | "ALL_BAD";
type RateLimitReason =
  | "SESSION_10M"
  | "SESSION_24H"
  | "IP_10M"
  | "IP_24H"
  | "GLOBAL_24H";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function rateLimitMessage(
  reason: RateLimitReason | undefined,
  retryAfterSeconds: number | undefined,
) {
  const retryHint =
    typeof retryAfterSeconds === "number" &&
    Number.isFinite(retryAfterSeconds) &&
    retryAfterSeconds > 0
      ? `（约 ${Math.max(1, Math.ceil(retryAfterSeconds / 60))} 分钟后可再试）`
      : "";

  switch (reason) {
    case "SESSION_10M":
      return `生成得有点快，过一会儿再试。${retryHint}`;
    case "SESSION_24H":
      return `今天已经生成不少啦，晚些再来。${retryHint}`;
    case "IP_10M":
    case "IP_24H":
      return `当前网络的生成次数已达到临时上限，请稍后再试。${retryHint}`;
    case "GLOBAL_24H":
      return `今天 GAGI 的免费生成额度已经用完了，明天再来。${retryHint}`;
    default:
      return `生成次数已达到临时上限，请稍后再试。${retryHint}`;
  }
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [levels, setLevels] = useState<Record<SliderKey, number>>({
    darkness: 5,
    absurdity: 5,
    vulgarity: 5,
  });
  const [jokes, setJokes] = useState<string[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [pendingVote, setPendingVote] = useState<Vote | null>(null);
  const [voteError, setVoteError] = useState("");
  const [topicError, setTopicError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function generateJokes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    const trimmedTopic = topic.trim();

    if (!trimmedTopic) {
      setTopicError("先给 GAGI 一个题目。");
      return;
    }

    if (Array.from(trimmedTopic).length > 120) {
      setTopicError("题目不能超过 120 个字符。");
      return;
    }

    setTopicError("");
    setRequestError("");
    setSelectedVote(null);
    setPendingVote(null);
    setVoteError("");
    setGenerationId(null);
    setJokes([]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: trimmedTopic,
          darkness: levels.darkness,
          absurdity: levels.absurdity,
          vulgarity: levels.vulgarity,
          sessionId: getOrCreateSessionId(),
        }),
      });

      const data = (await response.json()) as {
        generationId?: unknown;
        jokes?: unknown;
        error?: unknown;
        reason?: unknown;
        retryAfterSeconds?: unknown;
      };

      if (response.status === 429 && data.error === "RATE_LIMITED") {
        throw new Error(
          rateLimitMessage(
            typeof data.reason === "string"
              ? (data.reason as RateLimitReason)
              : undefined,
            typeof data.retryAfterSeconds === "number"
              ? data.retryAfterSeconds
              : undefined,
          ),
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "GAGI 暂时罢工了，请稍后再试。",
        );
      }

      if (
        typeof data.generationId !== "string" ||
        !uuidPattern.test(data.generationId) ||
        !Array.isArray(data.jokes) ||
        data.jokes.length !== 4 ||
        !data.jokes.every((joke) => typeof joke === "string" && joke.trim())
      ) {
        throw new Error("GAGI 生成的内容格式不正确，请再试一次。");
      }

      setGenerationId(data.generationId);
      setJokes(data.jokes as string[]);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "GAGI 暂时罢工了，请稍后再试。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateLevel(key: SliderKey, value: number) {
    setLevels((current) => ({ ...current, [key]: value }));
  }

  async function saveVote(vote: Vote) {
    if (!generationId || pendingVote) return;

    const choice: VoteChoice = vote === "all" ? "ALL_BAD" : vote;

    setPendingVote(vote);
    setVoteError("");

    try {
      const sessionId = getOrCreateSessionId();
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId,
          sessionId,
          choice,
          mode: "ask",
        }),
      });

      const data = (await response.json()) as {
        saved?: unknown;
        error?: unknown;
      };

      if (!response.ok || data.saved !== true) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "投票保存失败，请再试一次。",
        );
      }

      setSelectedVote(vote);
    } catch {
      setVoteError("投票保存失败，请再试一次。");
    } finally {
      setPendingVote(null);
    }
  }

  const feedback = pendingVote
    ? "正在保存投票……"
    : voteError
      ? voteError
      : selectedVote === "all"
        ? "已记录：这一轮全军覆没。"
        : selectedVote
          ? `已记录：你选择了 ${selectedVote}。`
          : "";

  return (
    <main className="page-shell">
      <div className="page-glow" aria-hidden="true" />

      <div className="container">
        <header className="masthead">
          <div className="brand-row">
            <p className="eyebrow">General Artificial Gag Intelligence</p>
            <span className="version">VERSION 0.4</span>
          </div>
          <h1>GAGI<span className="brand-dot">.</span></h1>
          <p className="tagline">
            人类距离 AGI 还很远，但距离会讲烂笑话的 AI 已经不远了。
          </p>
        </header>

        <section className="workbench" aria-labelledby="generator-title">
          <div className="section-heading">
            <span className="step-number">01</span>
            <div>
              <h2 id="generator-title">笑话实验室</h2>
              <p>输入题目，调整配方，然后降低期待。</p>
            </div>
          </div>

          <form onSubmit={generateJokes} noValidate aria-busy={isLoading}>
            <div className="topic-field">
              <label htmlFor="topic">给我一个笑话题目</label>
              <input
                id="topic"
                name="topic"
                type="text"
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  if (topicError) setTopicError("");
                }}
                placeholder="例如：为什么鬼都是白色的？"
                aria-describedby={topicError ? "topic-error" : undefined}
                aria-invalid={Boolean(topicError)}
                disabled={isLoading}
              />
              <p
                id="topic-error"
                className={`error-message ${topicError ? "visible" : ""}`}
                aria-live="polite"
              >
                {topicError || "占位"}
              </p>
            </div>

            <div className="sliders" aria-label="笑话参数">
              {sliderConfig.map(({ key, label }) => (
                <div className="slider-row" key={key}>
                  <div className="slider-label">
                    <label htmlFor={key}>{label}</label>
                    <output htmlFor={key}>{levels[key]}</output>
                  </div>
                  <input
                    id={key}
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={levels[key]}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateLevel(key, Number(event.target.value))
                    }
                    style={{ "--range-value": `${levels[key] * 10}%` } as React.CSSProperties}
                  />
                  <div className="range-ends" aria-hidden="true">
                    <span>0</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="generate-button" type="submit" disabled={isLoading}>
              <span>{isLoading ? "正在生成……" : "生成笑话"}</span>
              <span aria-hidden="true">{isLoading ? "···" : "→"}</span>
            </button>

            <p
              className={`request-message ${requestError ? "error" : ""} ${isLoading || requestError ? "visible" : ""}`}
              aria-live="polite"
            >
              {isLoading
                ? "GAGI 正在思考一些不该思考的东西……"
                : requestError || "生成状态会显示在这里。"}
            </p>
          </form>
        </section>

        {jokes.length === 4 && (
          <section className="results" aria-labelledby="results-title">
            <div className="section-heading results-heading">
              <span className="step-number">02</span>
              <div>
                <h2 id="results-title">候选笑话</h2>
                <p>四名选手，一次实时生成。</p>
              </div>
            </div>

            <div className="joke-grid">
              {jokes.map((joke, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <article className="joke-card" key={letter}>
                    <span className="joke-letter">{letter}</span>
                    <p>{joke}</p>
                  </article>
                );
              })}
            </div>

            <div className="vote-panel">
              <div className="vote-heading">
                <p className="vote-kicker">最终裁决</p>
                <h3>哪个最好笑？</h3>
              </div>

              <div
                className="vote-buttons"
                role="group"
                aria-label="选择最好笑的候选"
                aria-busy={Boolean(pendingVote)}
              >
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className={`${selectedVote === letter ? "selected" : ""} ${pendingVote === letter ? "pending" : ""}`}
                    aria-pressed={selectedVote === letter}
                    disabled={Boolean(pendingVote)}
                    onClick={() => saveVote(letter)}
                  >
                    {letter} <span aria-hidden="true">😂</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`reject-button ${selectedVote === "all" ? "selected" : ""} ${pendingVote === "all" ? "pending" : ""}`}
                  aria-pressed={selectedVote === "all"}
                  disabled={Boolean(pendingVote)}
                  onClick={() => saveVote("all")}
                >
                  全是狗屎
                </button>
              </div>

              <p
                className={`feedback ${feedback ? "visible" : ""} ${voteError ? "error" : ""}`}
                aria-live="polite"
              >
                {feedback || "投票后这里会显示反馈。"}
              </p>
            </div>
          </section>
        )}

        <footer>
          <span>GAGI 0.4</span>
          <span>REAL AI · REAL DATA · ANONYMOUS VOTES</span>
        </footer>
      </div>
    </main>
  );
}
