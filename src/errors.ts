import type { ErrorDetails } from "./types/common";

/**
 * Error codes the API returns in `TweetAPIError.code`. Errors without a specific
 * code use `UNKNOWN_ERROR`; newer API versions may add codes.
 */
export const ErrorCode = {
  /** Per-minute limit reached. `RateLimitError.retryAfter` says when it resets. */
  RATE_LIMITED: "RATE_LIMITED",
  /** Plan allowance or prepaid balance used up. Retrying does not help. */
  QUOTA_EXHAUSTED: "QUOTA_EXHAUSTED",
  /** Plan expired or inactive. Retrying does not help. */
  SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",
  /** The Twitter account behind `authToken` is suspended. */
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  /** The Twitter account behind `authToken` is locked. */
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  /** Your `proxy` refused or could not be reached. */
  PROXY_ERROR: "PROXY_ERROR",
  /** Your `proxy` timed out. */
  PROXY_TIMEOUT: "PROXY_TIMEOUT",
  /** Login: wrong username or password. */
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  /** Login: the account needs `twoFactorSecret`. */
  TWO_FACTOR_REQUIRED: "TWO_FACTOR_REQUIRED",
  /** Login: the two-factor code was rejected. */
  INVALID_TWO_FACTOR_CODE: "INVALID_TWO_FACTOR_CODE",
  /** Login: the account must verify its email first. */
  EMAIL_VERIFICATION_REQUIRED: "EMAIL_VERIFICATION_REQUIRED",
  /** Login: X could not be reached; try again later. */
  LOGIN_RUNTIME_UNAVAILABLE: "LOGIN_RUNTIME_UNAVAILABLE",
  /** No response was received (network failure or timeout). */
  CONNECTION_ERROR: "CONNECTION_ERROR",
  /** The response did not include a specific code. */
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Base error for all TweetAPI errors.
 * Contains the API error code, HTTP status, and optional details.
 */
export class TweetAPIError extends Error {
  /** API error code, such as "ACCOUNT_LOCKED" or "RATE_LIMITED". See `ErrorCode`. */
  readonly code: string;
  /** HTTP status code from the response */
  readonly statusCode: number;
  /** Additional error details (field, reason, retryAfter, etc.) */
  readonly details: ErrorDetails | null;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details: ErrorDetails | null = null,
  ) {
    super(message);
    this.name = "TweetAPIError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Thrown when the API key or auth token is invalid or missing (HTTP 401).
 */
export class AuthenticationError extends TweetAPIError {
  constructor(message: string, code: string, details: ErrorDetails | null = null) {
    super(message, code, 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when the request is forbidden (HTTP 403).
 */
export class ForbiddenError extends TweetAPIError {
  constructor(message: string, code: string, details: ErrorDetails | null = null) {
    super(message, code, 403, details);
    this.name = "ForbiddenError";
  }
}

/**
 * Thrown when the requested resource is not found (HTTP 404).
 */
export class NotFoundError extends TweetAPIError {
  constructor(message: string, code: string, details: ErrorDetails | null = null) {
    super(message, code, 404, details);
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when the request parameters are invalid (HTTP 400).
 */
export class ValidationError extends TweetAPIError {
  constructor(message: string, code: string, details: ErrorDetails | null = null) {
    super(message, code, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Thrown on HTTP 429. Check `code`: `RATE_LIMITED` clears after `retryAfter` seconds,
 * while `QUOTA_EXHAUSTED` and `SUBSCRIPTION_INACTIVE` need a plan change.
 */
export class RateLimitError extends TweetAPIError {
  /** Seconds until you can retry: the API's `Retry-After`, or 60 when it sends none */
  readonly retryAfter: number;

  constructor(message: string, code: string, details: ErrorDetails | null = null) {
    super(message, code, 429, details);
    this.name = "RateLimitError";
    this.retryAfter = details?.retryAfter ?? 60;
  }
}

/**
 * Thrown when the API encounters a server error (HTTP 5xx).
 */
export class ServerError extends TweetAPIError {
  constructor(message: string, code: string, statusCode: number, details: ErrorDetails | null = null) {
    super(message, code, statusCode, details);
    this.name = "ServerError";
  }
}

/**
 * Thrown when a network error occurs (DNS failure, timeout, connection refused).
 * No HTTP response was received.
 */
export class ConnectionError extends TweetAPIError {
  /** The original error that caused the connection failure */
  readonly cause: Error;

  constructor(message: string, cause: Error) {
    super(message, ErrorCode.CONNECTION_ERROR, 0, null);
    this.name = "ConnectionError";
    this.cause = cause;
  }
}
