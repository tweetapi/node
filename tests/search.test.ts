import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI } from "../src/index";
import type { PaginatedResponse, SearchTopResult, Tweet, User } from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// The API answers a search with data and pagination only.
const page = { data: [], pagination: { nextCursor: "NEXT", prevCursor: null } };

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async () => jsonResponse(page));
  client = new TweetAPI({ apiKey: "API_KEY" });
});

describe("explore.search", () => {
  it("sends GET /tw-v2/search with query, type and cursor", async () => {
    const result = await client.explore.search({ query: "bitcoin", type: "Latest", cursor: "C1" });

    const [url, init] = mockFetch.mock.calls[0];
    const sent = new URL(url);
    expect(init.method).toBe("GET");
    expect(sent.pathname).toBe("/tw-v2/search");
    expect(Object.fromEntries(sent.searchParams)).toEqual({ query: "bitcoin", type: "Latest", cursor: "C1" });
    expect(result).toEqual(page);
  });

  it("leaves out an unset cursor", async () => {
    await client.explore.search({ query: "bitcoin", type: "Top" });

    const sent = new URL(mockFetch.mock.calls[0][0]);
    expect(Object.fromEntries(sent.searchParams)).toEqual({ query: "bitcoin", type: "Top" });
  });

  it("types the results by search type", () => {
    const search = (type: string) => client.explore.search({ query: "q", type });

    expectTypeOf(client.explore.search({ query: "q", type: "Latest" })).resolves.toEqualTypeOf<PaginatedResponse<Tweet>>();
    expectTypeOf(client.explore.search({ query: "q", type: "Photos" })).resolves.toEqualTypeOf<PaginatedResponse<Tweet>>();
    expectTypeOf(client.explore.search({ query: "q", type: "Videos" })).resolves.toEqualTypeOf<PaginatedResponse<Tweet>>();
    expectTypeOf(client.explore.search({ query: "q", type: "People" })).resolves.toEqualTypeOf<PaginatedResponse<User>>();
    expectTypeOf(client.explore.search({ query: "q", type: "Top" })).resolves.toEqualTypeOf<PaginatedResponse<SearchTopResult>>();
    expectTypeOf(search).returns.resolves.toEqualTypeOf<PaginatedResponse<Tweet | User | SearchTopResult>>();
  });

  it("labels Top results with their type", () => {
    expectTypeOf<SearchTopResult>().toEqualTypeOf<{ type: "tweet"; content: Tweet } | { type: "user"; content: User }>();
  });
});
