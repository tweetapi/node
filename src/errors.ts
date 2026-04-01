import type { ErrorDetails } from "./types/common";

/**
 * Base error for all TweetAPI errors.
 * Contains the API error code, HTTP status, and optional details.
 */
export class TweetAPIError extends Error {
  /** API error code, e.g. "NOT_FOUND", "RATE_LIMIT", "ACCOUNT_SUSPENDED" */
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
 * Thrown when you've exceeded rate limits (HTTP 429).
 * Check `retryAfter` for seconds until you can retry.
 */
export class RateLimitError extends TweetAPIError {
  /** Seconds until the rate limit resets */
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
    super(message, "CONNECTION_ERROR", 0, null);
    this.name = "ConnectionError";
    this.cause = cause;
  }
}
