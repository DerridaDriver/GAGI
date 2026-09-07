"use client";

import { useEffect, useState } from "react";
import { getOrCreateSessionId } from "@/lib/browser-session";

const DISPLAY_SLOTS = ["A", "B", "C", "D"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DisplaySlot = (typeof DISPLAY_SLOTS)[number];
type VoteChoice = DisplaySlot | "ALL_BAD";
type ArenaStatus = "loading" | "ready" | "no-data" | "exhausted" | "error";

type ArenaItem = {
  generationId: string;
  topic: string;
  jokes: Record<DisplaySlot, string>;
};

type ArenaNextResult =
  | { kind: "item"; item: ArenaItem }
  | { kind: "no-data" }
  | { kind: "exhausted" };

function isArenaItem(value: unknown): value is ArenaItem {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const item = value as Partial<ArenaItem>;

  return (
    typeof item.generationId === "string" &&
    uuidPattern.test(item.generationId) &&
    typeof item.topic === "string" &&
    item.topic.trim().length > 0 &&
    typeof item.jokes === "object" &&
    item.jokes !== null &&
    DISPLAY_SLOTS.every(
      (slot) =>
        typeof item.jokes?.[slot] === "string" &&
        item.jokes[slot].trim().length > 0,
    )
  );
}

async function requestNextArenaItem(
  sessionId: string,
): Promise<ArenaNextResult> {
  const response = await fetch("/api/arena/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const data = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error("获取下一题失败");
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    data.status === "NO_ARENA_ITEMS"
  ) {
    return { kind: "no-data" };
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    data.status === "NO_MORE_ARENA_ITEMS"
  ) {
    return { kind: "exhausted" };
  }

  if (!isArenaItem(data)) {
    throw new Error("竞技场题目格式不正确");
  }

  return { kind: "item", item: data };
}

export default function ArenaPage() {
  const [status, setStatus] = useState<ArenaStatus>("loading");
  const [item, setItem] = useState<ArenaItem | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<VoteChoice | null>(null);
  const [pendingChoice, setPendingChoice] = useState<VoteChoice | null>(null);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialItem() {
      try {
        const result = await requestNextArenaItem(getOrCreateSessionId());

        if (!active) return;

        if (result.kind === "item") {
          setItem(result.item);
          setStatus("ready");
        } else {
          setStatus(result.kind);
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    }

    void loadInitialItem();

    return () => {
      active = false;
    };
  }, []);

  async function loadNextItem() {
    if (status === "loading") return;

    setStatus("loading");
    setItem(null);
    setSelectedChoice(null);
    setPendingChoice(null);
    setVoteError("");

    try {
      const result = await requestNextArenaItem(getOrCreateSessionId());

      if (result.kind === "item") {
        setItem(result.item);
        setStatus("ready");
      } else {
        setStatus(result.kind);
      }
    } catch {
      setStatus("error");
    }
  }

  async function saveVote(choice: VoteChoice) {
    if (!item || pendingChoice) return;

    setPendingChoice(choice);
    setVoteError("");

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: item.generationId,
          sessionId: getOrCreateSessionId(),
          choice,
          mode: "arena",
        }),
      });
      const data = (await response.json()) as {
        saved?: unknown;
      };

      if (!response.ok || data.saved !== true) {
        throw new Error("投票保存失败");
      }

      setSelectedChoice(choice);
    } catch {
      setVoteError("投票失败，请重试。");
    } finally {
      setPendingChoice(null);
    }
  }

  const feedback = pendingChoice
    ? "正在保存投票……"
    : voteError
      ? voteError
      : selectedChoice === "ALL_BAD"
        ? "已记录：这一轮全是狗屎。"
        : selectedChoice
          ? `已记录：你选择了 ${selectedChoice}。`
          : "";

  return (
    <main className="page-shell arena-shell">
      <div className="page-glow" aria-hidden="true" />

      <div className="container compact-container">
        <section className="arena-panel" aria-labelledby="arena-title">
          <div className="brand-row">
            <p className="eyebrow">BLIND JOKE ARENA</p>
            <span className="version">GAGI 0.4</span>
          </div>

          <p className="arena-kicker">HUMAN VOTE MODE</p>
          <h1 className="arena-title" id="arena-title">
            笑话竞技场<span className="brand-dot">.</span>
          </h1>
          <p className="arena-description">
            系统会随机给出一个题目和四个匿名答案，你只需要选最好笑的一个。
          </p>

          <div className="arena-stage">
            {status === "loading" ? (
              <div className="arena-state" role="status">
                <span className="arena-placeholder-mark">···</span>
                <div>
                  <strong>正在加载题目</strong>
                  <p>正在从现有实验结果中随机挑选。</p>
                </div>
              </div>
            ) : null}

            {status === "no-data" ? (
              <div className="arena-state" role="status">
                <span className="arena-placeholder-mark">00</span>
                <div>
                  <strong>当前还没有竞技场题目</strong>
                  <p>等题库准备好后再来看看。</p>
                </div>
              </div>
            ) : null}

            {status === "exhausted" ? (
              <div className="arena-state" role="status">
                <span className="arena-placeholder-mark">✓</span>
                <div>
                  <strong>你已经投完当前竞技场题目</strong>
                  <p>新的匿名候选加入后，还可以继续投票。</p>
                </div>
              </div>
            ) : null}

            {status === "error" ? (
              <div className="arena-state arena-state-error" role="alert">
                <span className="arena-placeholder-mark">!</span>
                <div>
                  <strong>获取下一题失败，请重试</strong>
                  <button
                    className="secondary-button"
                    onClick={loadNextItem}
                    type="button"
                  >
                    重新加载
                  </button>
                </div>
              </div>
            ) : null}

            {status === "ready" && item ? (
              <div className="arena-round">
                <div className="arena-topic">
                  <p className="vote-kicker">CURRENT TOPIC</p>
                  <h2>{item.topic}</h2>
                </div>

                <div className="joke-grid">
                  {DISPLAY_SLOTS.map((slot) => (
                    <article
                      className={`joke-card${selectedChoice === slot ? " selected" : ""}`}
                      key={slot}
                    >
                      <span className="joke-letter">{slot}</span>
                      <p>{item.jokes[slot]}</p>
                    </article>
                  ))}
                </div>

                <div className="vote-panel">
                  <div className="vote-heading">
                    <p className="vote-kicker">YOUR VOTE</p>
                    <h3>哪一个最好笑？</h3>
                  </div>

                  <div className="vote-buttons">
                    {DISPLAY_SLOTS.map((slot) => (
                      <button
                        className={`${pendingChoice === slot ? "pending " : ""}${
                          selectedChoice === slot ? "selected" : ""
                        }`}
                        disabled={pendingChoice !== null}
                        key={slot}
                        onClick={() => saveVote(slot)}
                        type="button"
                      >
                        {slot}
                      </button>
                    ))}
                    <button
                      className={`reject-button ${
                        pendingChoice === "ALL_BAD" ? "pending " : ""
                      }${selectedChoice === "ALL_BAD" ? "selected" : ""}`}
                      disabled={pendingChoice !== null}
                      onClick={() => saveVote("ALL_BAD")}
                      type="button"
                    >
                      全是狗屎
                    </button>
                  </div>

                  <p
                    className={`feedback${voteError ? " error" : ""}`}
                    aria-live="polite"
                  >
                    {feedback}
                  </p>

                  {selectedChoice ? (
                    <button
                      className="next-button"
                      disabled={pendingChoice !== null}
                      onClick={loadNextItem}
                      type="button"
                    >
                      下一题
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <footer>
          <span>GAGI 0.4</span>
          <span>BLIND JOKE ARENA</span>
        </footer>
      </div>
    </main>
  );
}
