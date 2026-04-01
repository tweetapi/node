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

/** Search response with metadata */
export interface SearchResponse<T> {
  data: T[];
  pagination: Pagination;
  meta: {
    query: string;
    resultType: "tweets" | "users" | "media" | "all";
    resultCount: number;
    completedIn: number;
  };
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
