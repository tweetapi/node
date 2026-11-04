import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI, ConnectionError } from "../src/index";
import type {
  ActionResponse,
  ApiResponse,
  MediaStatus,
  MediaUploadInput,
  PollInput,
  UploadedMedia,
} from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const authToken = "AUTH_TOKEN";
const proxy = "host:port@user:pass";
const media = [{ media_id: "2100000000000000001" }];

const uploaded: UploadedMedia = {
  mediaId: "2100000000000000002",
  mediaKey: "7_2100000000000000002",
  type: "video",
  size: 48104220,
  state: "in_progress",
  progressPercent: 40,
  checkAfterSecs: 5,
  expiresAfterSecs: 86399,
};

const failed: MediaStatus = {
  mediaId: "2100000000000000002",
  state: "failed",
  progressPercent: null,
  checkAfterSecs: null,
  error: { code: 1, name: "InvalidMedia", message: "Unsupported video format" },
  expiresAfterSecs: 86255,
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function actionResponse(action: string) {
  return { data: { id: "1234567890", action, timestamp: "2026-11-03T12:00:00.000Z", success: true } };
}

function lastCall() {
  const [url, init] = mockFetch.mock.calls.at(-1)!;
  return { url: new URL(url), init, body: init.body === undefined ? undefined : JSON.parse(init.body) };
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  client = new TweetAPI({ apiKey: "API_KEY" });
});

describe("Polls", () => {
  const post = { authToken, text: "Which option do you prefer?", proxy };
  const poll: PollInput = { choices: ["Option A", "Option B"], durationMinutes: 1440 };

  it("sends the poll with createPost", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(actionResponse("create_tweet")));
    await client.post.createPost({ ...post, poll });
    expect(lastCall().url.pathname).toBe("/tw-v2/interaction/create-post");
    expect(lastCall().body).toEqual({ ...post, poll });
  });

  it("sends no poll when it is unset", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(actionResponse("create_tweet")));
    await client.post.createPost({ ...post, poll: undefined });
    expect(lastCall().body).toEqual(post);
  });

  it("votes with interaction.votePoll", async () => {
    const response = {
      data: { ...actionResponse("vote_poll").data, metadata: { tweet_id: "1234567890", choice: 2 } },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(response));
    await expect(
      client.interaction.votePoll({ authToken, tweetId: "1234567890", choice: 2, proxy }),
    ).resolves.toEqual(response);

    const { url, init, body } = lastCall();
    expect(url.href).toBe("https://api.tweetapi.com/tw-v2/interaction/vote-poll");
    expect(init.method).toBe("POST");
    expect(body).toEqual({ authToken, tweetId: "1234567890", choice: 2, proxy });
  });

  it("drops an unset proxy on votePoll", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(actionResponse("vote_poll")));
    await client.interaction.votePoll({ authToken, tweetId: "1234567890", choice: 1, proxy: undefined });
    expect(lastCall().body).toEqual({ authToken, tweetId: "1234567890", choice: 1 });
  });

  it("returns ActionResponse from votePoll", () => {
    expectTypeOf(client.interaction.votePoll).returns.toEqualTypeOf<Promise<ActionResponse>>();
  });
});

describe("Media upload", () => {
  it.each<MediaUploadInput>([
    { url: "https://example.com/sample.mp4" },
    { url: "https://example.com/sample.jpg", type: "image/jpeg" },
    { data: "BASE64_DATA", type: "image/png" },
  ])("sends media as one object: %j", async (input) => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: uploaded }));
    await expect(client.post.uploadMedia({ authToken, proxy, media: input })).resolves.toEqual({ data: uploaded });

    const { url, init, body } = lastCall();
    expect(url.href).toBe("https://api.tweetapi.com/tw-v2/interaction/upload-media");
    expect(init.method).toBe("POST");
    expect(body).toEqual({ authToken, proxy, media: input });
  });

  it("does not repeat an upload after a failure that may have gone through", async () => {
    const retrying = new TweetAPI({ apiKey: "API_KEY", retry: { maxRetries: 3, initialRetryDelay: 1 } });
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    await expect(retrying.post.uploadMedia({ authToken, proxy, media: { url: "https://example.com/a.mp4" } })).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("sends authToken, proxy and mediaId as query to getMediaStatus", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: failed }));
    await expect(
      client.post.getMediaStatus({ authToken, proxy, mediaId: "2100000000000000002" }),
    ).resolves.toEqual({ data: failed });

    const { url, init } = lastCall();
    expect(url.origin + url.pathname).toBe("https://api.tweetapi.com/tw-v2/interaction/media-status");
    expect(Object.fromEntries(url.searchParams)).toEqual({ authToken, proxy, mediaId: "2100000000000000002" });
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("returns the typed upload and status responses", () => {
    expectTypeOf(client.post.uploadMedia).returns.toEqualTypeOf<Promise<ApiResponse<UploadedMedia>>>();
    expectTypeOf(client.post.getMediaStatus).returns.toEqualTypeOf<Promise<ApiResponse<MediaStatus>>>();
  });
});

describe("Media timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Runs a request whose fetch never answers, and reports when it was aborted. */
  async function timeoutOf(send: () => Promise<unknown>) {
    vi.useFakeTimers();
    mockFetch.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted", "AbortError")),
          );
        }),
    );
    const start = Date.now();
    const error = send().catch((e: unknown) => e);
    await vi.runAllTimersAsync();
    return { ms: Date.now() - start, error: await error };
  }

  const uploads: [string, (c: TweetAPI) => Promise<unknown>][] = [
    ["post.createPostWithMedia", (c) => c.post.createPostWithMedia({ authToken, text: "hi", media, proxy })],
    ["post.replyPostWithMedia", (c) => c.post.replyPostWithMedia({ authToken, text: "hi", tweetId: "1", media, proxy })],
    ["post.uploadMedia", (c) => c.post.uploadMedia({ authToken, proxy, media: { url: "https://example.com/a.mp4" } })],
    ["community.createPostWithMedia", (c) => c.community.createPostWithMedia({ authToken, text: "hi", communityId: "1", media, proxy })],
    ["community.createQuoteWithMedia", (c) => c.community.createQuoteWithMedia({ authToken, text: "hi", attachmentUrl: "https://x.com/example/status/1", communityId: "1", media, proxy })],
    ["community.replyPostWithMedia", (c) => c.community.replyPostWithMedia({ authToken, text: "hi", tweetId: "1", communityId: "1", media, proxy })],
    ["profile.avatar", (c) => c.profile.avatar({ authToken, media: { url: "https://example.com/a.jpg" } })],
    ["profile.banner", (c) => c.profile.banner({ authToken, media: { data: "BASE64_DATA", type: "image/png" } })],
    ["dm.sendDm with media", (c) => c.dm.sendDm({ authToken, conversationId: "1-2", text: "hi", proxy, media: [{ url: "https://example.com/a.jpg" }] })],
  ];

  const regular: [string, (c: TweetAPI) => Promise<unknown>][] = [
    ["post.createPost", (c) => c.post.createPost({ authToken, text: "hi", proxy })],
    ["post.getMediaStatus", (c) => c.post.getMediaStatus({ authToken, proxy, mediaId: "1" })],
    ["dm.sendDm without media", (c) => c.dm.sendDm({ authToken, conversationId: "1-2", text: "hi", proxy })],
    ["dm.sendDm with an empty media list", (c) => c.dm.sendDm({ authToken, conversationId: "1-2", text: "hi", proxy, media: [] })],
  ];

  it.each(uploads)("gives %s 120 seconds by default", async (_name, send) => {
    const { ms, error } = await timeoutOf(() => send(new TweetAPI({ apiKey: "API_KEY", retry: false })));
    expect(ms).toBe(120000);
    expect(error).toBeInstanceOf(ConnectionError);
    expect((error as ConnectionError).message).toBe("Request timed out after 120000ms");
  });

  it.each(regular)("keeps the regular timeout for %s", async (_name, send) => {
    const { ms, error } = await timeoutOf(() => send(new TweetAPI({ apiKey: "API_KEY", retry: false })));
    expect(ms).toBe(30000);
    expect((error as ConnectionError).message).toBe("Request timed out after 30000ms");
  });

  it("uses the regular timeout when it is longer than 120 seconds", async () => {
    const slow = new TweetAPI({ apiKey: "API_KEY", retry: false, timeout: 200000 });
    expect((await timeoutOf(() => uploads[2][1](slow))).ms).toBe(200000);
  });

  it("uses an explicit mediaTimeout", async () => {
    const shorter = new TweetAPI({ apiKey: "API_KEY", retry: false, mediaTimeout: 5000 });
    const { ms, error } = await timeoutOf(() => uploads[2][1](shorter));
    expect(ms).toBe(5000);
    expect((error as ConnectionError).message).toBe("Request timed out after 5000ms");

    const belowTimeout = new TweetAPI({ apiKey: "API_KEY", retry: false, timeout: 200000, mediaTimeout: 60000 });
    expect((await timeoutOf(() => uploads[0][1](belowTimeout))).ms).toBe(60000);
    expect((await timeoutOf(() => regular[0][1](belowTimeout))).ms).toBe(200000);
  });
});
