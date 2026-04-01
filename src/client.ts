import type { ErrorResponseBody } from "./types/common";
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
}

export class TweetAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

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

    this.user = new UserResource(this);
    this.tweet = new TweetResource(this);
    this.post = new PostResource(this);
    this.interaction = new InteractionResource(this);
    this.list = new ListResource(this);
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

  private async request<T>(url: string, init: RequestInit): Promise<T> {
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

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TweetAPIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ConnectionError(
          `Request timed out after ${this.timeout}ms`,
          error,
        );
      }

      throw new ConnectionError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      clearTimeout(timer);
    }
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
