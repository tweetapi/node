import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI } from "../src/index";
import type { List, PaginatedResponse, Tweet, User } from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const authToken = "AUTH_TOKEN";
const proxy = "host:port@user:pass";
const emptyPage = { data: [], pagination: { nextCursor: null, prevCursor: null } };

type Method = (params: Record<string, unknown>) => Promise<unknown>;

const reads = [
  { resource: "user", method: "getPhotos", path: "/tw-v2/user/photos", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getVideos", path: "/tw-v2/user/videos", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getAffiliates", path: "/tw-v2/user/affiliates", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getLists", path: "/tw-v2/user/lists", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getListMemberships", path: "/tw-v2/user/list-memberships", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "interaction", method: "getBookmarks", path: "/tw-v2/interaction/bookmarks", required: { authToken }, optional: { cursor: "CURSOR", proxy } },
  { resource: "interaction", method: "getLikes", path: "/tw-v2/interaction/likes", required: { authToken, userId: "44196397" }, optional: { cursor: "CURSOR", proxy } },
  { resource: "user", method: "getHighlights", path: "/tw-v2/user/highlights", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getArticles", path: "/tw-v2/user/articles", required: { userId: "44196397" }, optional: { cursor: "CURSOR" } },
  { resource: "user", method: "getSimilarAccounts", path: "/tw-v2/user/similar-accounts", required: { userId: "44196397" }, optional: {} },
  { resource: "tweet", method: "getHiddenReplies", path: "/tw-v2/tweet/hidden-replies", required: { tweetId: "1234567890" }, optional: { cursor: "CURSOR" } },
  { resource: "list", method: "search", path: "/tw-v2/list/search", required: { query: "crypto" }, optional: { cursor: "CURSOR" } },
  { resource: "community", method: "getMedia", path: "/tw-v2/community/media", required: { communityId: "1493446837214187523" }, optional: { cursor: "CURSOR" } },
  { resource: "interaction", method: "getBlockedAccounts", path: "/tw-v2/interaction/blocked-accounts", required: { authToken }, optional: { cursor: "CURSOR", proxy } },
  { resource: "interaction", method: "getMutedAccounts", path: "/tw-v2/interaction/muted-accounts", required: { authToken }, optional: { cursor: "CURSOR", proxy } },
];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function methodOf(client: TweetAPI, resource: string, method: string): Method | undefined {
  const target = (client as unknown as Record<string, Record<string, Method>>)[resource];
  return target[method]?.bind(target);
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async () => jsonResponse(emptyPage));
  client = new TweetAPI({ apiKey: "API_KEY" });
});

describe.each(reads)("$resource.$method", ({ resource, method, path, required, optional }) => {
  it("exists on the resource", () => {
    expect(methodOf(client, resource, method)).toBeTypeOf("function");
  });

  it(`sends GET ${path} with every parameter as query`, async () => {
    await expect(methodOf(client, resource, method)!({ ...required, ...optional })).resolves.toEqual(emptyPage);

    const [url, init] = mockFetch.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(`https://api.tweetapi.com${path}`);
    expect(Object.fromEntries(parsed.searchParams)).toEqual({ ...required, ...optional });
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(init.headers["X-API-Key"]).toBe("API_KEY");
  });

  it("drops unset optional parameters", async () => {
    const unset = Object.fromEntries(Object.keys(optional).map((key) => [key, undefined]));
    await methodOf(client, resource, method)!({ ...required, ...unset });
    expect(Object.fromEntries(new URL(mockFetch.mock.calls[0][0]).searchParams)).toEqual(required);
  });
});

describe("Read return types", () => {
  it("returns paginated tweets, users and lists", () => {
    expectTypeOf(client.user.getPhotos).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.user.getVideos).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.user.getAffiliates).returns.toEqualTypeOf<Promise<PaginatedResponse<User>>>();
    expectTypeOf(client.user.getLists).returns.toEqualTypeOf<Promise<PaginatedResponse<List>>>();
    expectTypeOf(client.user.getListMemberships).returns.toEqualTypeOf<Promise<PaginatedResponse<List>>>();
    expectTypeOf(client.interaction.getBookmarks).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.interaction.getLikes).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.user.getHighlights).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.user.getArticles).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.user.getSimilarAccounts).returns.toEqualTypeOf<Promise<PaginatedResponse<User>>>();
    expectTypeOf(client.tweet.getHiddenReplies).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.list.search).returns.toEqualTypeOf<Promise<PaginatedResponse<List>>>();
    expectTypeOf(client.community.getMedia).returns.toEqualTypeOf<Promise<PaginatedResponse<Tweet>>>();
    expectTypeOf(client.interaction.getBlockedAccounts).returns.toEqualTypeOf<Promise<PaginatedResponse<User>>>();
    expectTypeOf(client.interaction.getMutedAccounts).returns.toEqualTypeOf<Promise<PaginatedResponse<User>>>();
  });
});
