import type { ErrorResponseBody, RetryOptions, RateLimitInfo } from "./types/common";
import {
  TweetAPIError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  ConnectionError,
} from "./errors";

import { UserResource } from "./resources/user";
import { TweetResource } from "./resources/tweet";
import { PostResource } from "./resources/post";
import { InteractionResource } from "./resources/interaction";
import { ListResource } from "./resources/list";
import { ProfileResource } from "./resources/profile";
import { CommunityResource } from "./resources/community";
import { SpaceResource } from "./resources/space";
import { ExploreResource } from "./resources/explore";
import { AuthResource } from "./resources/auth";
import { XChatResource } from "./resources/xchat";
import { UnencryptedDMResource } from "./resources/unencrypted-dm";

export interface TweetAPIOptions {
  /** Your TweetAPI API key */
  apiKey: string;
  /** Base URL for the API (default: https://api.tweetapi.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Retry configuration. Pass `false` to disable retries entirely. */
  retry?: RetryOptions | false;
}

export class TweetAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly backoffMultiplier: number;
  private readonly initialRetryDelay: number;
  private readonly maxRetryDelay: number;
  private _rateLimitInfo: RateLimitInfo | null = null;

  /** User profile data, followers, following, subscriptions */
  readonly user: UserResource;
  /** Tweet details, retweets, quotes, translate */
  readonly tweet: TweetResource;
  /** Create, reply, and delete posts */
  readonly post: PostResource;
  /** Likes, retweets, bookmarks, follows, list members, notifications */
  readonly interaction: InteractionResource;
  /** List details, tweets, members, followers */
  readonly list: ListResource;
  /** Authenticated profile management */
  readonly profile: ProfileResource;
  /** Community details, tweets, members, posts, join/leave */
  readonly community: CommunityResource;
  /** Twitter Spaces details and stream URLs */
  readonly space: SpaceResource;
  /** Search tweets and users */
  readonly explore: ExploreResource;
  /** Twitter account authentication */
  readonly auth: AuthResource;
  /** Encrypted DM (X Chat) messaging */
  readonly xchat: XChatResource;
  /** Unencrypted direct messages */
  readonly dm: UnencryptedDMResource;

  constructor(options: TweetAPIOptions) {
    if (!options.apiKey) {
      throw new Error("TweetAPI: apiKey is required");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.tweetapi.com").replace(
      /\/$/,
      "",
    );
    this.timeout = options.timeout ?? 30000;

    const retryOpts =
      options.retry === false ? { maxRetries: 0 } : (options.retry ?? {});
    this.maxRetries = retryOpts.maxRetries ?? 3;
    this.backoffMultiplier = retryOpts.backoffMultiplier ?? 2;
    this.initialRetryDelay = retryOpts.initialRetryDelay ?? 1000;
    this.maxRetryDelay = retryOpts.maxRetryDelay ?? 30000;

    this.user = new UserResource(this);
    this.tweet = new TweetResource(this);
    this.post = new PostResource(this);
    this.interaction = new InteractionResource(this);
    this.list = new ListResource(this);
    this.profile = new ProfileResource(this);
    this.community = new CommunityResource(this);
    this.space = new SpaceResource(this);
    this.explore = new ExploreResource(this);
    this.auth = new AuthResource(this);
    this.xchat = new XChatResource(this);
    this.dm = new UnencryptedDMResource(this);
  }

  /**
   * Send a GET request to the API.
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              url.searchParams.append(key, String(item));
            }
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }

    return this.request<T>(url.toString(), { method: "GET" });
  }

  /**
   * Send a POST request to the API.
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post_<T>(path: string, body?: Record<string, any>): Promise<T> {
    const cleanBody: Record<string, unknown> = {};
    if (body) {
      for (const [key, value] of Object.entries(body)) {
        if (value !== undefined) {
          cleanBody[key] = value;
        }
      }
    }

    return this.request<T>(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanBody),
    });
  }

  /** Last known rate limit info from a 429 response, or `null`. */
  get rateLimitInfo(): RateLimitInfo | null {
    return this._rateLimitInfo;
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    let lastError: TweetAPIError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            "X-API-Key": this.apiKey,
            ...init.headers,
          },
        });
        clearTimeout(timer);

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timer);
        const normalized = this.normalizeError(error);
        lastError = normalized;

        if (normalized instanceof RateLimitError) {
          this._rateLimitInfo = {
            retryAfter: normalized.retryAfter,
            timestamp: Date.now(),
          };
        }

        if (attempt < this.maxRetries && this.isRetryable(normalized)) {
          await new Promise((r) =>
            setTimeout(r, this.calculateRetryDelay(normalized, attempt)),
          );
          continue;
        }

        throw normalized;
      }
    }

    throw lastError!;
  }

  private normalizeError(error: unknown): TweetAPIError {
    if (error instanceof TweetAPIError) return error;
    if (error instanceof DOMException && error.name === "AbortError") {
      return new ConnectionError(
        `Request timed out after ${this.timeout}ms`,
        error,
      );
    }
    return new ConnectionError(
      `Network error: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  private isRetryable(error: TweetAPIError): boolean {
    if (error instanceof ConnectionError) return true;
    if (error.statusCode === 429) return true;
    if (error.statusCode >= 500) return true;
    return false;
  }

  private calculateRetryDelay(error: TweetAPIError, attempt: number): number {
    if (error instanceof RateLimitError && error.retryAfter > 0) {
      return Math.min(error.retryAfter * 1000, this.maxRetryDelay);
    }
    const baseDelay =
      this.initialRetryDelay * Math.pow(this.backoffMultiplier, attempt);
    const capped = Math.min(baseDelay, this.maxRetryDelay);
    return capped + Math.random() * capped * 0.25;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let body: ErrorResponseBody | null = null;

    try {
      body = (await response.json()) as ErrorResponseBody;
    } catch {
      // Response body is not valid JSON
    }

    const code = body?.error?.code ?? "UNKNOWN_ERROR";
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    const details = body?.error?.details ?? null;

    switch (response.status) {
      case 400:
        throw new ValidationError(message, code, details);
      case 401:
        throw new AuthenticationError(message, code, details);
      case 403:
        throw new ForbiddenError(message, code, details);
      case 404:
        throw new NotFoundError(message, code, details);
      case 429:
        throw new RateLimitError(message, code, details);
      default:
        if (response.status >= 500) {
          throw new ServerError(message, code, response.status, details);
        }
        throw new TweetAPIError(message, code, response.status, details);
    }
  }
}
