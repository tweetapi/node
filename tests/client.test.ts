import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TweetAPI,
  TweetAPIError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ConnectionError,
} from "../src/index";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function lastFetchCall() {
  const call = mockFetch.mock.calls.at(-1);
  if (!call) throw new Error("Expected fetch to be called");
  return call;
}

function lastRequestBody() {
  const [, options] = lastFetchCall();
  return JSON.parse(options.body);
}

describe("TweetAPI Client", () => {
  let client: TweetAPI;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new TweetAPI({ apiKey: "test-api-key" });
  });

  it("should throw if apiKey is missing", () => {
    expect(() => new TweetAPI({ apiKey: "" })).toThrow("apiKey is required");
  });

  it("should set default base URL", () => {
    const c = new TweetAPI({ apiKey: "key" });
    expect(c).toBeDefined();
  });

  it("should allow custom base URL", () => {
    const c = new TweetAPI({
      apiKey: "key",
      baseUrl: "https://custom.api.com",
    });
    expect(c).toBeDefined();
  });
});

describe("GET requests", () => {
  let client: TweetAPI;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new TweetAPI({ apiKey: "test-key" });
  });

  it("should send GET with API key header", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "123", username: "testuser", name: "Test" } }),
    );

    await client.user.getByUsername({ username: "testuser" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/tw-v2/user/by-username");
    expect(url).toContain("username=testuser");
    expect(options.headers["X-API-Key"]).toBe("test-key");
    expect(options.method).toBe("GET");
  });

  it("should omit undefined params from query string", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: [], pagination: { nextCursor: null, prevCursor: null } }),
    );

    await client.user.getFollowers({ userId: "123", cursor: undefined });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("userId=123");
    expect(url).not.toContain("cursor");
  });

  it("should parse successful JSON response", async () => {
    const userData = {
      data: {
        id: "123",
        username: "elonmusk",
        name: "Elon Musk",
        followerCount: 180000000,
      },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(userData));

    const result = await client.user.getByUsername({ username: "elonmusk" });
    expect(result.data.username).toBe("elonmusk");
    expect(result.data.followerCount).toBe(180000000);
  });
});

describe("POST requests", () => {
  let client: TweetAPI;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new TweetAPI({ apiKey: "test-key" });
  });

  it("should send POST with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "456", action: "like", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.interaction.favoritePost({
      authToken: "auth123",
      tweetId: "789",
      proxy: "host:port@user:pass",
    });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.authToken).toBe("auth123");
    expect(body.tweetId).toBe("789");
  });

  it("should strip undefined values from POST body", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "1", action: "create_tweet", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.post.createPost({
      authToken: "auth123",
      text: "Hello",
      proxy: "host:port@user:pass",
      disableLinkPreview: undefined,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("disableLinkPreview");
  });

  it("should send login credentials with the proxy egress country", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        data: {
          cookies: { auth_token: "auth", ct0: "csrf", twid: "u=1", kdt: "kdt", __cf_bm: "cf" },
          user: { id: "1", username: "testuser", name: "Test User" },
          timestamp: "2026-07-27T00:00:00.000Z",
        },
      }),
    );

    await client.auth.login({
      username: "testuser",
      password: "secret",
      proxy: "host:port@user:pass",
      country: "US",
      twoFactorSecret: "ABCDEFGHIJKLMNOP",
    });

    const [url, options] = lastFetchCall();
    expect(url).toContain("/tw-v2/auth/login");
    expect(options.method).toBe("POST");
    expect(lastRequestBody()).toEqual({
      username: "testuser",
      password: "secret",
      proxy: "host:port@user:pass",
      country: "US",
      twoFactorSecret: "ABCDEFGHIJKLMNOP",
    });
  });

  it("should send canonical list create request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "list123", name: "Research" } }),
    );

    await client.list.create({
      authToken: "auth123",
      name: "Research",
      description: "Markets",
      isPrivate: true,
    });

    const [url, options] = lastFetchCall();
    expect(url).toContain("/tw-v2/list/create");
    expect(options.method).toBe("POST");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      name: "Research",
      description: "Markets",
      isPrivate: true,
    });
  });

  it("should send canonical list add member request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "list123", action: "add_list_member", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.list.addMember({
      authToken: "auth123",
      listId: "123",
      userId: "456",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/list/add-member");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      listId: "123",
      userId: "456",
    });
  });

  it("should send canonical list remove member request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "list123", action: "remove_list_member", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.list.removeMember({
      authToken: "auth123",
      listId: "123",
      userId: "456",
      proxy: "host:port@user:pass",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/list/remove-member");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      listId: "123",
      userId: "456",
      proxy: "host:port@user:pass",
    });
  });

  it("should send profile update request and strip undefined fields", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "user123", username: "test", name: "Updated" } }),
    );

    await client.profile.update({
      authToken: "auth123",
      name: "Updated",
      bio: undefined,
      website: "",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/profile/update");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      name: "Updated",
      website: "",
    });
  });

  it("should send profile avatar request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "user123", username: "test", name: "Test" } }),
    );

    await client.profile.avatar({
      authToken: "auth123",
      media: { url: "https://example.com/avatar.jpg", type: "image/jpeg" },
      proxy: "host:port@user:pass",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/profile/avatar");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      media: { url: "https://example.com/avatar.jpg", type: "image/jpeg" },
      proxy: "host:port@user:pass",
    });
  });

  it("should send profile banner request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "user123", username: "test", name: "Test" } }),
    );

    await client.profile.banner({
      authToken: "auth123",
      media: { data: "base64-image", type: "image/png" },
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/profile/banner");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      media: { data: "base64-image", type: "image/png" },
    });
  });

  it("should send profile banner removal request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: { id: "user123", username: "test", name: "Test", banner: null } }),
    );

    await client.profile.removeBanner({
      authToken: "auth123",
      proxy: "host:port@user:pass",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/profile/remove-banner");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      proxy: "host:port@user:pass",
    });
  });

  it("should send profile privacy request and preserve false", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { isPrivate: false } }));

    await client.profile.setPrivacy({
      authToken: "auth123",
      isPrivate: false,
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/profile/privacy");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      isPrivate: false,
    });
  });

  it("should send community quote request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "tweet123", action: "create_community_quote", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.community.createQuote({
      authToken: "auth123",
      text: "Community quote",
      attachmentUrl: "https://x.com/example/status/TWEET_ID",
      communityId: "COMMUNITY_ID",
      proxy: "host:port@user:pass",
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/interaction/create-community-quote");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      text: "Community quote",
      attachmentUrl: "https://x.com/example/status/TWEET_ID",
      communityId: "COMMUNITY_ID",
      proxy: "host:port@user:pass",
    });
  });

  it("should send community quote with media request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: {
          id: "tweet123",
          action: "create_community_quote_with_media",
          timestamp: "2025-01-01",
          success: true,
        },
      }),
    );

    await client.community.createQuoteWithMedia({
      authToken: "auth123",
      text: "Community quote",
      attachmentUrl: "https://x.com/example/status/TWEET_ID",
      communityId: "COMMUNITY_ID",
      media: [{ media_id: "TWITTER_MEDIA_ID" }],
      proxy: "host:port@user:pass",
      disableLinkPreview: undefined,
    });

    const [url] = lastFetchCall();
    expect(url).toContain("/tw-v2/interaction/create-community-quote-with-media");
    expect(lastRequestBody()).toEqual({
      authToken: "auth123",
      text: "Community quote",
      attachmentUrl: "https://x.com/example/status/TWEET_ID",
      communityId: "COMMUNITY_ID",
      media: [{ media_id: "TWITTER_MEDIA_ID" }],
      proxy: "host:port@user:pass",
    });
  });

  it("should preserve replyOption in create post body", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "tweet123", action: "create_tweet", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.post.createPost({
      authToken: "auth123",
      text: "Regions only",
      proxy: "host:port@user:pass",
      replyOption: { mode: "regions", regions: ["NAM", "EUR"] },
    });

    const body = lastRequestBody();
    expect(body.replyOption).toEqual({ mode: "regions", regions: ["NAM", "EUR"] });
  });

  it("should preserve direct media_id in create post with media body", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        data: { id: "tweet123", action: "create_tweet", timestamp: "2025-01-01", success: true },
      }),
    );

    await client.post.createPostWithMedia({
      authToken: "auth123",
      text: "Media",
      media: [{ media_id: "TWITTER_MEDIA_ID" }],
      proxy: "host:port@user:pass",
    });

    const body = lastRequestBody();
    expect(body.media).toEqual([{ media_id: "TWITTER_MEDIA_ID" }]);
  });
});

describe("Error handling", () => {
  let client: TweetAPI;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new TweetAPI({ apiKey: "test-key", retry: false });
  });

  it("should throw ValidationError on 400", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "VALIDATION_ERROR", message: "Required - query,username", details: null } },
        400,
      ),
    );

    await expect(
      client.user.getByUsername({ username: "" }),
    ).rejects.toThrow(ValidationError);
  });

  it("should throw AuthenticationError on 401", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "UNAUTHORIZED", message: "Invalid token", details: null } },
        401,
      ),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("should throw NotFoundError on 404", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "NOT_FOUND", message: "User not found", details: null } },
        404,
      ),
    );

    try {
      await client.user.getByUsername({ username: "nonexistent" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect((e as NotFoundError).code).toBe("NOT_FOUND");
      expect((e as NotFoundError).statusCode).toBe(404);
      expect((e as NotFoundError).message).toBe("User not found");
    }
  });

  it("should throw RateLimitError on 429 with retryAfter", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: "RATE_LIMIT",
            message: "Rate limit exceeded",
            details: { retryAfter: 30 },
          },
        },
        429,
      ),
    );

    try {
      await client.user.getByUsername({ username: "test" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      expect((e as RateLimitError).retryAfter).toBe(30);
    }
  });

  it("should throw ServerError on 500", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong", details: null } },
        500,
      ),
    );

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ServerError);
  });

  it("should throw ConnectionError on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fetch failed"));

    await expect(
      client.user.getByUsername({ username: "test" }),
    ).rejects.toThrow(ConnectionError);
  });

  it("should handle malformed error response gracefully", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("not json", { status: 500 }),
    );

    try {
      await client.user.getByUsername({ username: "test" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ServerError);
      expect((e as ServerError).code).toBe("UNKNOWN_ERROR");
    }
  });

  it("should preserve error code from API response", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "ACCOUNT_SUSPENDED", message: "Account suspended", details: null } },
        403,
      ),
    );

    try {
      await client.user.getByUsername({ username: "suspended" });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(TweetAPIError);
      expect((e as TweetAPIError).code).toBe("ACCOUNT_SUSPENDED");
    }
  });
});

describe("Resource classes exist", () => {
  const client = new TweetAPI({ apiKey: "key" });

  it("should have all 12 resource classes", () => {
    expect(client.user).toBeDefined();
    expect(client.tweet).toBeDefined();
    expect(client.post).toBeDefined();
    expect(client.interaction).toBeDefined();
    expect(client.list).toBeDefined();
    expect(client.profile).toBeDefined();
    expect(client.community).toBeDefined();
    expect(client.space).toBeDefined();
    expect(client.explore).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.xchat).toBeDefined();
    expect(client.dm).toBeDefined();
  });
});
