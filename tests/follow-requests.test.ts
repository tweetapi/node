import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  TweetAPI,
  AuthenticationError,
  ConnectionError,
  ForbiddenError,
  RateLimitError,
  ServerError,
  ValidationError,
  paginate,
  paginatePages,
} from "../src/index";
import type {
  AcceptFollowRequestParams,
  ActionResponse,
  ActionType,
  DenyFollowRequestParams,
  GetFollowRequestsParams,
  PaginatedResponse,
} from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);
const userId = "9007199254740993123";
const authToken = "AUTH_TOKEN";
const proxy = "host:port@user:pass";
const emptyPage: PaginatedResponse<string> = {
  data: [],
  pagination: { nextCursor: null, prevCursor: null },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function actionResponse(action: ActionType): ActionResponse {
  return {
    data: {
      id: userId,
      action,
      timestamp: "2026-09-14T00:00:00.000Z",
      success: true,
      metadata: { user_id: userId },
    },
  };
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  client = new TweetAPI({
    apiKey: "API_KEY",
    retry: { maxRetries: 3, initialRetryDelay: 1, maxRetryDelay: 1 },
  });
});

describe("Follow-request listing", () => {
  it("exports the exact parameter and response types", () => {
    expectTypeOf<GetFollowRequestsParams>().toEqualTypeOf<{
      authToken: string; proxy?: string; cursor?: string; count?: number;
    }>();
    expectTypeOf<AcceptFollowRequestParams>().toEqualTypeOf<{
      authToken: string; userId: string; proxy?: string;
    }>();
    expectTypeOf<DenyFollowRequestParams>().toEqualTypeOf<AcceptFollowRequestParams>();
    expectTypeOf(client.interaction.getFollowRequests).returns.toEqualTypeOf<Promise<PaginatedResponse<string>>>();
    expectTypeOf(client.interaction.acceptFollowRequest).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.denyFollowRequest).returns.toEqualTypeOf<Promise<ActionResponse>>();
  });

  it("sends the exact GET contract and preserves long IDs and cursors", async () => {
    const response = { data: [userId], pagination: { nextCursor: "18446744073709551615", prevCursor: null } };
    mockFetch.mockResolvedValueOnce(jsonResponse(response));
    const result = await client.interaction.getFollowRequests({ authToken, proxy, cursor: "-1", count: 100 });
    const [url, init] = mockFetch.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://api.tweetapi.com/tw-v2/interaction/follow-requests");
    expect(Object.fromEntries(parsed.searchParams)).toEqual({ authToken, proxy, cursor: "-1", count: "100" });
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(init.headers["X-API-Key"]).toBe("API_KEY");
    expect(result).toEqual(response);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("strips undefined options and leaves defaults to the API", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(emptyPage));
    await expect(client.interaction.getFollowRequests({ authToken, proxy: undefined, cursor: undefined, count: undefined })).resolves.toEqual(emptyPage);
    expect(Object.fromEntries(new URL(mockFetch.mock.calls[0][0]).searchParams)).toEqual({ authToken });
  });

  it.each([1, 100])("serializes numeric count boundary %s", async (count) => {
    mockFetch.mockResolvedValueOnce(jsonResponse(emptyPage));
    await client.interaction.getFollowRequests({ authToken, count });
    expect(new URL(mockFetch.mock.calls[0][0]).searchParams.get("count")).toBe(String(count));
  });

  it("yields an empty terminal page without fetching again", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(emptyPage));
    const pages = [];
    for await (const page of paginatePages((cursor) => client.interaction.getFollowRequests({ authToken, cursor }))) {
      pages.push(page);
    }
    expect(pages).toEqual([emptyPage]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("paginates string IDs through an empty intermediate page until terminal null", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ data: [userId], pagination: { nextCursor: "18446744073709551615", prevCursor: null } }))
      .mockResolvedValueOnce(jsonResponse({ data: [], pagination: { nextCursor: "42", prevCursor: "-1" } }))
      .mockResolvedValueOnce(jsonResponse({ data: ["123"], pagination: { nextCursor: null, prevCursor: "18446744073709551615" } }));
    const ids: string[] = [];
    for await (const id of paginate((cursor) => client.interaction.getFollowRequests({ authToken, cursor, count: 1, proxy }))) ids.push(id);
    expect(ids).toEqual([userId, "123"]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch.mock.calls.map(([url]) => new URL(url).searchParams.get("cursor"))).toEqual([null, "18446744073709551615", "42"]);
    for (const [url] of mockFetch.mock.calls) {
      expect(new URL(url).searchParams.get("authToken")).toBe(authToken);
      expect(new URL(url).searchParams.get("count")).toBe("1");
      expect(new URL(url).searchParams.get("proxy")).toBe(proxy);
    }
  });

  it.each([429, 500, 503, "network"] as const)("keeps normal GET retries after %s", async (failure) => {
    if (failure === "network") mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    else mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: failure, message: "Try later" }, failure));
    mockFetch.mockResolvedValueOnce(jsonResponse(emptyPage));
    await expect(client.interaction.getFollowRequests({ authToken })).resolves.toEqual(emptyPage);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

const mutations = [
  { method: "acceptFollowRequest", path: "accept-follow-request", action: "accept_follow_request" },
  { method: "denyFollowRequest", path: "deny-follow-request", action: "deny_follow_request" },
] as const;

describe.each(mutations)("$method", ({ method, path, action }) => {
  it.each([undefined, proxy])("sends the exact POST contract with optional proxy %s", async (proxyValue) => {
    const response = actionResponse(action);
    mockFetch.mockResolvedValueOnce(jsonResponse(response));
    await expect(client.interaction[method]({ authToken, userId, proxy: proxyValue })).resolves.toEqual(response);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`https://api.tweetapi.com/tw-v2/interaction/${path}`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-API-Key": "API_KEY", "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ authToken, userId, ...(proxyValue === undefined ? {} : { proxy: proxyValue }) });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([429, 500, 502, 503, 504])("makes exactly one POST attempt on HTTP %s with global retries enabled", async (status) => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: status, message: "Mutation failed" }, status))
      .mockResolvedValueOnce(jsonResponse(actionResponse(action)));
    const request = client.interaction[method]({ authToken, userId });
    await expect(request).rejects.toBeInstanceOf(status === 429 ? RateLimitError : ServerError);
    await expect(request).rejects.toMatchObject({ statusCode: status, message: "Mutation failed", code: "UNKNOWN_ERROR", details: null });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    new TypeError("fetch failed"),
    new DOMException("The operation was aborted", "AbortError"),
  ])("makes exactly one POST attempt on $name", async (error) => {
    mockFetch.mockRejectedValueOnce(error).mockResolvedValueOnce(jsonResponse(actionResponse(action)));
    await expect(client.interaction[method]({ authToken, userId })).rejects.toBeInstanceOf(ConnectionError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed JSON without retrying or manufacturing success", async () => {
    mockFetch.mockResolvedValueOnce(new Response("not JSON", { status: 200 }));
    await expect(client.interaction[method]({ authToken, userId })).rejects.toBeInstanceOf(ConnectionError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("Customer error envelopes", () => {
  // Production /tw-v2 middleware emits { statusCode, message }, not the V3 envelope.
  it.each([
    { status: 400, error: ValidationError, message: "userId must contain only digits" },
    { status: 401, error: AuthenticationError, message: "Invalid auth token" },
    { status: 403, error: ForbiddenError, message: "Account suspended" },
  ])("preserves legacy HTTP $status messages and error classes", async ({ status, error, message }) => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: status, message }, status));
    const request = client.interaction.acceptFollowRequest({ authToken, userId });
    await expect(request).rejects.toBeInstanceOf(error);
    await expect(request).rejects.toMatchObject({ message, statusCode: status, code: "UNKNOWN_ERROR", details: null });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid list parameters using the legacy validation envelope", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: 400, message: "count must be between 1 and 100" }, 400));
    await expect(client.interaction.getFollowRequests({ authToken, count: 101 })).rejects.toMatchObject({ name: "ValidationError", statusCode: 400, message: "count must be between 1 and 100" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("preserves nested V3 code, message, details, and rate-limit information", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { code: "RATE_LIMIT", message: "Nested message", details: { retryAfter: 12 } },
      message: "Top-level message must not override V3",
    }, 429));
    await expect(client.interaction.denyFollowRequest({ authToken, userId })).rejects.toMatchObject({ name: "RateLimitError", code: "RATE_LIMIT", message: "Nested message", details: { retryAfter: 12 }, retryAfter: 12 });
    expect(client.rateLimitInfo?.retryAfter).toBe(12);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([null, {}, { message: { invalid: true } }, { statusCode: 200, message: 42 }])("falls back to the HTTP status for malformed error bodies: %j", async (body) => {
    mockFetch.mockResolvedValueOnce(jsonResponse(body, 502));
    await expect(client.interaction.denyFollowRequest({ authToken, userId })).rejects.toMatchObject({ name: "ServerError", statusCode: 502, code: "UNKNOWN_ERROR", message: "HTTP 502" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects an upstream HTML error without manufacturing success", async () => {
    mockFetch.mockResolvedValueOnce(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(client.interaction.acceptFollowRequest({ authToken, userId })).rejects.toMatchObject({ name: "ServerError", statusCode: 502, message: "HTTP 502" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
