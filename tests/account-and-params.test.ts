import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI, ServerError } from "../src/index";
import type { AccountUsage, ApiResponse } from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const actionResponse = {
  data: { id: "44196397", action: "follow", timestamp: "2026-10-24T00:00:00.000Z", success: true },
};

const usage: AccountUsage = {
  availableUnits: 120500,
  plan: {
    active: true,
    requestLimit: 100000,
    usedUnits: 4500,
    remainingUnits: 95500,
    periodEnd: "2026-11-21T00:00:00.000Z",
  },
  payg: { availableUnits: 25000, expiresAt: "2027-10-21T00:00:00.000Z" },
  rateLimit: { requestsPerMinute: 120 },
};

function lastBody() {
  return JSON.parse(mockFetch.mock.calls.at(-1)![1].body);
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  client = new TweetAPI({
    apiKey: "API_KEY",
    retry: { maxRetries: 3, initialRetryDelay: 1, maxRetryDelay: 1 },
  });
});

describe("Account usage", () => {
  it("returns the typed usage response", () => {
    expectTypeOf(client.account.getUsage).parameters.toEqualTypeOf<[]>();
    expectTypeOf(client.account.getUsage).returns.toEqualTypeOf<Promise<ApiResponse<AccountUsage>>>();
  });

  it("sends GET /tw-v2/account/usage with no query string", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: usage }));
    const result = await client.account.getUsage();

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.tweetapi.com/tw-v2/account/usage");
    expect(init.method).toBe("GET");
    expect(init.headers["X-API-Key"]).toBe("API_KEY");
    expect(result.data).toEqual(usage);
  });

  it("keeps null plan and PAYG fields", async () => {
    const paygOnly = { ...usage, plan: null, payg: null };
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: paygOnly }));
    expect((await client.account.getUsage()).data).toEqual(paygOnly);
  });

  it("retries after a 503 with Retry-After", async () => {
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({ statusCode: 503, message: "unavailable" }, 503, { "Retry-After": "0" }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: usage }));
    expect((await client.account.getUsage()).data).toEqual(usage);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws ServerError once retries run out", async () => {
    const noRetry = new TweetAPI({ apiKey: "API_KEY", retry: false });
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: 503, message: "unavailable" }, 503));
    await expect(noRetry.account.getUsage()).rejects.toBeInstanceOf(ServerError);
  });
});

describe("Optional parameters", () => {
  it("lets community tweets omit sortBy", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ data: [], pagination: { nextCursor: null, prevCursor: null } }));
    await client.community.getTweets({ communityId: "1493446837214187523" });
    expect(new URL(mockFetch.mock.calls[0][0]).search).toBe("?communityId=1493446837214187523");

    await client.community.getTweets({ communityId: "1493446837214187523", sortBy: "Recency" });
    expect(new URL(mockFetch.mock.calls[1][0]).searchParams.get("sortBy")).toBe("Recency");
  });

  it.each(["follow", "unfollow"] as const)("sends username on %s only when set", async (action) => {
    mockFetch.mockImplementation(async () => jsonResponse(actionResponse));
    await client.interaction[action]({ authToken: "AUTH_TOKEN", userId: "44196397", username: "elonmusk" });
    expect(mockFetch.mock.calls[0][0]).toBe(`https://api.tweetapi.com/tw-v2/interaction/${action}`);
    expect(lastBody()).toEqual({ authToken: "AUTH_TOKEN", userId: "44196397", username: "elonmusk" });

    await client.interaction[action]({ authToken: "AUTH_TOKEN", userId: "44196397", username: undefined });
    expect(lastBody()).toEqual({ authToken: "AUTH_TOKEN", userId: "44196397" });
  });

  it("sends the XChat conversation fields only when set", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ data: {} }));
    const base = { authToken: "AUTH_TOKEN", recipientId: "44196397", message: "hi" };
    const conversation = {
      conversationToken: "TOKEN",
      conversationKeyVersion: "1",
      encryptedConversationKey: "KEY",
    };

    await client.xchat.send({ ...base, ...conversation });
    expect(mockFetch.mock.calls[0][0]).toBe("https://api.tweetapi.com/tw-v2/xchat/send");
    expect(lastBody()).toEqual({ ...base, ...conversation });

    await client.xchat.send(base);
    expect(lastBody()).toEqual(base);
  });
});
