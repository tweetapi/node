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

/** The /tw-v2 error envelope, with optional response headers. */
function v2Error(
  status: number,
  code?: string,
  headers: Record<string, string> = {},
) {
  return new Response(
    JSON.stringify({ statusCode: status, message: "synthetic", ...(code && { code }) }),
    { status, headers: { "Content-Type": "application/json", ...headers } },
  );
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

  it("should not retry username updates after a retryable failure", async () => {
    const client = new TweetAPI({
      apiKey: "key",
      retry: { maxRetries: 3, initialRetryDelay: 1 },
    });
    const params = {
      authToken: "AUTH_TOKEN",
      password: "PASSWORD",
      username: "NEW_USERNAME",
    };

    mockFetch
      .mockResolvedValueOnce(
        errorResponse(500, "SERVER_ERROR", "Internal error"),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: { username: "NEW_USERNAME" } }),
      );

    await expect(client.profile.updateUsername(params)).rejects.toThrow(
      ServerError,
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await expect(client.profile.updateUsername(params)).resolves.toEqual({
      data: { username: "NEW_USERNAME" },
    });
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

describe("Retry rules", () => {
  const client = new TweetAPI({
    apiKey: "key",
    retry: { maxRetries: 3, initialRetryDelay: 1, maxRetryDelay: 5 },
  });
  const post = { authToken: "AUTH_TOKEN", text: "hello", proxy: "host:8080@user:pass" };

  beforeEach(() => {
    mockFetch.mockReset();
    vi.restoreAllMocks();
  });

  it("does not retry when the caller's proxy failed", async () => {
    for (const [status, code] of [
      [502, "PROXY_ERROR"],
      [504, "PROXY_TIMEOUT"],
    ] as const) {
      mockFetch.mockReset();
      mockFetch.mockResolvedValue(v2Error(status, code));
      const error = await client.user.getByUsername({ username: "test" }).catch((e) => e);
      expect(error).toBeInstanceOf(ServerError);
      expect(error.code).toBe(code);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    }
  });

  it("does not retry a used-up or expired plan", async () => {
    for (const code of ["QUOTA_EXHAUSTED", "SUBSCRIPTION_INACTIVE"]) {
      mockFetch.mockReset();
      mockFetch.mockResolvedValue(v2Error(429, code));
      const error = await client.user.getByUsername({ username: "test" }).catch((e) => e);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.code).toBe(code);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    }
  });

  it("waits for Retry-After before retrying", async () => {
    const waitFor = new TweetAPI({ apiKey: "key", retry: { maxRetries: 1 } });
    for (const status of [429, 503]) {
      mockFetch.mockReset();
      const timers = vi.spyOn(globalThis, "setTimeout");
      mockFetch
        .mockResolvedValueOnce(
          v2Error(status, status === 429 ? "RATE_LIMITED" : undefined, { "Retry-After": "1" }),
        )
        .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

      await waitFor.user.getByUsername({ username: "test" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(timers.mock.calls.some(([, delay]) => delay === 1000)).toBe(true);
      timers.mockRestore();
    }
  });

  it("still retries a 429 without a code, as older API versions send", async () => {
    mockFetch
      .mockResolvedValueOnce(v2Error(429))
      .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));

    await client.user.getByUsername({ username: "test" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not repeat a write after a failure that may have gone through", async () => {
    for (const failure of [
      () => v2Error(500),
      () => v2Error(502),
      () => v2Error(503),
      () => v2Error(504),
      () => Promise.reject(new TypeError("fetch failed")),
    ]) {
      mockFetch.mockReset();
      mockFetch
        .mockImplementationOnce(failure)
        .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));
      await expect(client.post.createPost(post)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    }
  });

  it("repeats a write when Retry-After says it never reached X", async () => {
    for (const status of [429, 503]) {
      mockFetch.mockReset();
      mockFetch
        .mockResolvedValueOnce(
          v2Error(status, status === 429 ? "RATE_LIMITED" : undefined, { "Retry-After": "0" }),
        )
        .mockResolvedValueOnce(jsonResponse({ data: { id: "1" } }));
      await client.post.createPost(post);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }
  });

  it("does not repeat a login that X itself rate limited", async () => {
    mockFetch.mockResolvedValue(v2Error(429, "RATE_LIMITED"));
    const error = await client.auth
      .login({ username: "user", password: "pass", proxy: "host:8080@user:pass", country: "US" })
      .catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries reads sent as POST", async () => {
    mockFetch
      .mockResolvedValueOnce(v2Error(500))
      .mockResolvedValueOnce(jsonResponse({ data: {} }));

    await client.xchat.getHistory({ authToken: "AUTH_TOKEN", conversationId: "1-2" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
