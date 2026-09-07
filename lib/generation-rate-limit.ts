import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

export const DEFAULT_GENERATION_LIMITS = {
  session10m: 3,
  session24h: 12,
  ip10m: 6,
  ip24h: 30,
  global24h: 300,
} as const;

export const RATE_LIMIT_REASONS = [
  "SESSION_10M",
  "SESSION_24H",
  "IP_10M",
  "IP_24H",
  "GLOBAL_24H",
] as const;

export type RateLimitReason = (typeof RATE_LIMIT_REASONS)[number];
export type GenerationFailureType =
  | "provider_error"
  | "timeout"
  | "invalid_response"
  | "internal_error";

type GenerationLimitConfig = {
  session10m: number;
  session24h: number;
  ip10m: number;
  ip24h: number;
  global24h: number;
};

type ClaimRow = {
  allowed?: unknown;
  reason?: unknown;
  retry_after_seconds?: unknown;
  request_id?: unknown;
};

export type GenerationClaim =
  | { kind: "allowed"; requestId: string }
  | {
      kind: "denied";
      reason: RateLimitReason;
      retryAfterSeconds: number;
    }
  | { kind: "error" };

function readPositiveInteger(
  value: string | undefined,
  fallback: number,
) {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isRateLimitReason(value: unknown): value is RateLimitReason {
  return (
    typeof value === "string" &&
    RATE_LIMIT_REASONS.includes(value as RateLimitReason)
  );
}

export function getGenerationLimitConfig(): GenerationLimitConfig {
  return {
    session10m: readPositiveInteger(
      process.env.GAGI_LIMIT_SESSION_10M,
      DEFAULT_GENERATION_LIMITS.session10m,
    ),
    session24h: readPositiveInteger(
      process.env.GAGI_LIMIT_SESSION_24H,
      DEFAULT_GENERATION_LIMITS.session24h,
    ),
    ip10m: readPositiveInteger(
      process.env.GAGI_LIMIT_IP_10M,
      DEFAULT_GENERATION_LIMITS.ip10m,
    ),
    ip24h: readPositiveInteger(
      process.env.GAGI_LIMIT_IP_24H,
      DEFAULT_GENERATION_LIMITS.ip24h,
    ),
    global24h: readPositiveInteger(
      process.env.GAGI_LIMIT_GLOBAL_24H,
      DEFAULT_GENERATION_LIMITS.global24h,
    ),
  };
}

export function getNormalizedClientIp(request: Request) {
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  const forwardedFor =
    vercelForwardedFor ?? request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  let candidate = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "";

  if (candidate.startsWith("[")) {
    const closingBracket = candidate.indexOf("]");
    candidate =
      closingBracket > 0
        ? candidate.slice(1, closingBracket)
        : candidate;
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.slice(0, candidate.lastIndexOf(":"));
  }

  if (candidate.toLowerCase().startsWith("::ffff:")) {
    candidate = candidate.slice(7);
  }

  const normalized = candidate.trim().toLowerCase();
  return normalized ? normalized.slice(0, 128) : "unknown";
}

export function hashClientIp(normalizedIp: string, salt: string) {
  return createHash("sha256")
    .update(salt, "utf8")
    .update(normalizedIp, "utf8")
    .digest("hex");
}

export async function claimGenerationRequest(
  supabase: SupabaseClient,
  sessionId: string,
  ipHash: string,
): Promise<GenerationClaim> {
  const limits = getGenerationLimitConfig();
  let data: unknown;

  try {
    const result = await supabase.rpc("claim_generation_request", {
      p_session_id: sessionId,
      p_ip_hash: ipHash,
      p_session_10m_limit: limits.session10m,
      p_session_24h_limit: limits.session24h,
      p_ip_10m_limit: limits.ip10m,
      p_ip_24h_limit: limits.ip24h,
      p_global_24h_limit: limits.global24h,
    });

    if (result.error) {
      console.error("Generation quota claim failed", {
        code: result.error.code,
      });
      return { kind: "error" };
    }

    data = result.data;
  } catch {
    console.error("Generation quota claim encountered a network error");
    return { kind: "error" };
  }

  const row = (Array.isArray(data) ? data[0] : data) as ClaimRow | null;

  if (row?.allowed === true && typeof row.request_id === "string") {
    return { kind: "allowed", requestId: row.request_id };
  }

  if (row?.allowed === false && isRateLimitReason(row.reason)) {
    const retryAfterSeconds =
      typeof row.retry_after_seconds === "number" &&
      Number.isFinite(row.retry_after_seconds)
        ? Math.max(1, Math.ceil(row.retry_after_seconds))
        : 60;

    return {
      kind: "denied",
      reason: row.reason,
      retryAfterSeconds,
    };
  }

  console.error("Generation quota claim returned an invalid response");
  return { kind: "error" };
}

export async function completeGenerationRequest(
  supabase: SupabaseClient,
  requestId: string,
  status: "success" | "failed",
  failureType: GenerationFailureType | null,
) {
  try {
    const { error } = await supabase
      .from("generation_requests")
      .update({
        status,
        completed_at: new Date().toISOString(),
        failure_type: failureType,
      })
      .eq("id", requestId)
      .eq("status", "started");

    if (error) {
      console.error("Generation request completion update failed", {
        code: error.code,
      });
      return false;
    }

    return true;
  } catch {
    console.error(
      "Generation request completion update encountered a network error",
    );
    return false;
  }
}
