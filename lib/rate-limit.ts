import { eq, and, gte, lt, sql } from "drizzle-orm";
import db from "@/db/config";
import { aiRequests } from "@/db/models/ai-requests";

const RATE_LIMIT_PER_HOUR = 25;
const CLEANUP_AGE_HOURS = 24;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

/**
 * Check if user has exceeded rate limit for AI endpoints
 * @param userId - Clerk user ID
 * @param endpoint - AI endpoint name ('parse-subscription' | 'budget-recommendations')
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count requests in the last hour (shared across all AI endpoints)
    const recentRequests = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiRequests)
      .where(
        and(
          eq(aiRequests.userId, userId),
          gte(aiRequests.requestedAt, oneHourAgo)
        )
      );

    const requestCount = Number(recentRequests[0]?.count || 0);
    const allowed = requestCount < RATE_LIMIT_PER_HOUR;
    const remaining = Math.max(0, RATE_LIMIT_PER_HOUR - requestCount);

    // Calculate reset time (1 hour from oldest request in window, or now if no requests)
    const resetAt = new Date(oneHourAgo.getTime() + 60 * 60 * 1000);

    // Cleanup old records (non-blocking)
    cleanupOldRecords().catch((error) => {
      console.error("Error cleaning up old AI request records:", error);
    });

    return {
      allowed,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // Fail open - allow request if rate limit check fails
    // This prevents legitimate users from being blocked due to database issues
    return {
      allowed: true,
      remaining: RATE_LIMIT_PER_HOUR,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

/**
 * Record an AI request for rate limiting
 * @param userId - Clerk user ID
 * @param endpoint - AI endpoint name
 * @param inputLength - Length of input text (for monitoring)
 */
export async function recordAiRequest(
  userId: string,
  endpoint: string,
  inputLength?: number
): Promise<void> {
  try {
    await db.insert(aiRequests).values({
      userId,
      endpoint,
      inputLength: inputLength || null,
    });
  } catch (error) {
    // Non-blocking - don't fail request if logging fails
    console.error("Error recording AI request:", error);
  }
}

/**
 * Cleanup old AI request records (older than CLEANUP_AGE_HOURS)
 * This is called automatically during rate limit checks
 */
async function cleanupOldRecords(): Promise<void> {
  try {
    const cutoffDate = new Date(
      Date.now() - CLEANUP_AGE_HOURS * 60 * 60 * 1000
    );

    await db
      .delete(aiRequests)
      .where(lt(aiRequests.requestedAt, cutoffDate));
  } catch (error) {
    console.error("Error cleaning up old AI request records:", error);
    // Don't throw - cleanup failures shouldn't break the app
  }
}

