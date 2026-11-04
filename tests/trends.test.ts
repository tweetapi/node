import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI, TrendsResource } from "../src/index";
import type { ApiResponse, TrendLocation, TrendsByPlace } from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const trends: TrendsByPlace = {
  location: { woeid: 23424977, name: "United States" },
  asOf: "2026-10-28T10:02:56Z",
  createdAt: "2026-10-26T21:57:22Z",
  trends: [
    { name: "#SampleTag", query: "#SampleTag", url: "http://twitter.com/search?q=%23SampleTag", promoted: false, tweetVolume: null },
  ],
};

const locations: TrendLocation[] = [
  { woeid: 1, name: "Worldwide", placeType: { code: 19, name: "Supername" }, country: null, countryCode: null, parentId: null },
  { woeid: 23424977, name: "United States", placeType: { code: 12, name: "Country" }, country: "United States", countryCode: "US", parentId: 1 },
];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function lastUrl() {
  return new URL(mockFetch.mock.calls.at(-1)![0]);
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockImplementation(async () => jsonResponse({ data: trends }));
  client = new TweetAPI({ apiKey: "API_KEY" });
});

describe("Trends", () => {
  it("is available as client.trends", () => {
    expect(client.trends).toBeInstanceOf(TrendsResource);
  });

  it("types the params so country and woeid cannot be combined", () => {
    expectTypeOf(client.trends.get).toBeCallableWith();
    expectTypeOf(client.trends.get).toBeCallableWith({ country: "US" });
    expectTypeOf(client.trends.get).toBeCallableWith({ woeid: 23424977 });
    expectTypeOf(client.trends.get).toBeCallableWith({ woeid: "1" });
    // @ts-expect-error country and woeid are mutually exclusive
    expectTypeOf(client.trends.get).toBeCallableWith({ country: "US", woeid: 1 });
    expectTypeOf(client.trends.get).returns.toEqualTypeOf<Promise<ApiResponse<TrendsByPlace>>>();
    expectTypeOf(client.trends.getLocations).returns.toEqualTypeOf<Promise<ApiResponse<TrendLocation[]>>>();
  });

  it("sends GET /tw-v2/trends with no query for worldwide trends", async () => {
    await expect(client.trends.get()).resolves.toEqual({ data: trends });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.tweetapi.com/tw-v2/trends");
    expect(init.method).toBe("GET");
    expect(init.headers["X-API-Key"]).toBe("API_KEY");
  });

  it("sends country as query", async () => {
    await client.trends.get({ country: "US" });
    expect(lastUrl().pathname).toBe("/tw-v2/trends");
    expect(Object.fromEntries(lastUrl().searchParams)).toEqual({ country: "US" });
  });

  it.each([23424977, "23424977"])("sends woeid %j as query", async (woeid) => {
    await client.trends.get({ woeid });
    expect(lastUrl().pathname).toBe("/tw-v2/trends");
    expect(Object.fromEntries(lastUrl().searchParams)).toEqual({ woeid: "23424977" });
  });

  it("drops an unset country", async () => {
    await client.trends.get({ country: undefined });
    expect(lastUrl().search).toBe("");
  });

  it("sends GET /tw-v2/trends/locations with no query string", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ data: locations }));
    await expect(client.trends.getLocations()).resolves.toEqual({ data: locations });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.tweetapi.com/tw-v2/trends/locations");
    expect(init.method).toBe("GET");
  });
});
