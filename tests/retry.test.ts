import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TweetAPI,
  RateLimitError,
  ServerError,
  ConnectionError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
} from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, code: string, message: string, details: Record<string, unknown> | null = null) {
  return jsonResponse({ error: { code, message, details } }, status);
}

describe("Retry with backoff", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.restoreAllMocks();
  });

  it("should retry on 500 and succeed on second attempt", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });

    mockFetch
      .mockResolvedValueOnce(errorResponse(500, "SERVER_ERROR", "Internal error"))
      .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

    const result = await client.user.getByUsername({ username: "test" });
    expect(result.data).toEqual({ id: "1" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should retry on 429 and respect retryAfter", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 1, initialRetryDelay: 1 },
    });

    mockFetch
      .mockResolvedValueOnce(
        errorResponse(429, "RATE_LIMIT", "Too many requests", { retryAfter: 1 }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

    const result = await client.user.getByUsername({ username: "test" });
    expect(result.data).toEqual({ id: "1" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should exhaust retries and throw the last error", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 2, initialRetryDelay: 1 },
    });

    mockFetch.mockResolvedValue(
      errorResponse(500, "SERVER_ERROR", "Internal error"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ServerError);
    expect(mockFetch).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("should NOT retry on 400", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(400, "VALIDATION_ERROR", "Bad request"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ValidationError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should NOT retry on 401", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(401, "UNAUTHORIZED", "Invalid key"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(AuthenticationError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should NOT retry on 403", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(403, "FORBIDDEN", "Forbidden"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ForbiddenError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should NOT retry on 404", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(404, "NOT_FOUND", "Not found"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(NotFoundError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should retry on network error", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 1, initialRetryDelay: 1 },
    });

    mockFetch
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

    const result = await client.user.getByUsername({ username: "test" });
    expect(result.data).toEqual({ id: "1" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should disable retries with retry: false", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: false,
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(500, "SERVER_ERROR", "Internal error"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ServerError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should disable retries with maxRetries: 0", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 0 },
    });

    mockFetch.mockResolvedValueOnce(
      errorResponse(500, "SERVER_ERROR", "Internal error"),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ServerError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should populate rateLimitInfo after 429", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 1, initialRetryDelay: 1, maxRetryDelay: 10 },
    });

    expect(client.rateLimitInfo).toBeNull();

    mockFetch
      .mockResolvedValueOnce(
        errorResponse(429, "RATE_LIMIT", "Too many requests", { retryAfter: 1 }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

    await client.user.getByUsername({ username: "test" });

    expect(client.rateLimitInfo).not.toBeNull();
    expect(client.rateLimitInfo!.retryAfter).toBe(1);
    expect(client.rateLimitInfo!.timestamp).toBeGreaterThan(0);
  });
});
