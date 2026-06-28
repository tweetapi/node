// ─── Response Wrappers ───────────────────────────────────────────────────────

/** Standard single-item API response */
export interface ApiResponse<T> {
  data: T;
}

/** Paginated list response with cursor-based navigation */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/** Action response for interactions (like, retweet, follow, etc.) */
export interface ActionResponse {
  data: {
    id: string;
    action: ActionType;
    timestamp: string;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
  };
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface Pagination {
  nextCursor: string | null;
  prevCursor: string | null;
}

// ─── Retry & Rate Limit ─────────────────────────────────────────────────

/** Configuration for automatic retry with exponential backoff. */
export interface RetryOptions {
  /** Maximum number of retry attempts. Set to 0 to disable retries. Default: 3 */
  maxRetries?: number;
  /** Multiplier for exponential backoff. Default: 2 */
  backoffMultiplier?: number;
  /** Initial retry delay in milliseconds. Default: 1000 */
  initialRetryDelay?: number;
  /** Maximum retry delay in milliseconds (cap). Default: 30000 */
  maxRetryDelay?: number;
}

/** Rate limit information captured from a 429 response. */
export interface RateLimitInfo {
  /** Seconds until the rate limit resets */
  retryAfter: number;
  /** Timestamp (ms) when this info was captured */
  timestamp: number;
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface ErrorDetails {
  reason?: string;
  field?: string;
  value?: unknown;
  traceId?: string;
  retryAfter?: number;
  helpUrl?: string;
}

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details: ErrorDetails | null;
  };
}

// ─── Action Types ────────────────────────────────────────────────────────────

export type ActionType =
  | "bookmark"
  | "unbookmark"
  | "like"
  | "unlike"
  | "retweet"
  | "unretweet"
  | "follow"
  | "unfollow"
  | "enable_notifications"
  | "disable_notifications"
  | "mute"
  | "unmute"
  | "block"
  | "unblock"
  | "create_tweet"
  | "create_community_post"
  | "create_community_post_with_media"
  | "create_community_quote"
  | "create_community_quote_with_media"
  | "delete_tweet"
  | "reply"
  | "reply_community_post"
  | "reply_community_post_with_media"
  | "quote"
  | "create_list"
  | "delete_list"
  | "add_list_member"
  | "remove_list_member"
  | "add_to_list"
  | "remove_from_list"
  | "join_community"
  | "leave_community"
  | "pin_tweet"
  | "unpin_tweet"
  | "accept_conversation";
