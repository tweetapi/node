import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { TweetAPI, ServerError } from "../src/index";
import type { ActionResponse, ActionType } from "../src/index";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const authToken = "AUTH_TOKEN";
const proxy = "host:port@user:pass";

type Method = (params: Record<string, unknown>) => Promise<unknown>;

const actions: {
  resource: string;
  method: string;
  path: string;
  action: ActionType;
  required: Record<string, unknown>;
  optional: Record<string, unknown>;
}[] = [
  { resource: "post", method: "pinPost", path: "/tw-v2/interaction/pin-post", action: "pin_tweet", required: { authToken, tweetId: "1234567890" }, optional: { proxy } },
  { resource: "post", method: "unpinPost", path: "/tw-v2/interaction/unpin-post", action: "unpin_tweet", required: { authToken, tweetId: "1234567890" }, optional: { proxy } },
  { resource: "post", method: "hideReply", path: "/tw-v2/interaction/hide-reply", action: "hide_reply", required: { authToken, tweetId: "1234567890" }, optional: { proxy } },
  { resource: "post", method: "unhideReply", path: "/tw-v2/interaction/unhide-reply", action: "unhide_reply", required: { authToken, tweetId: "1234567890" }, optional: { proxy } },
  { resource: "interaction", method: "block", path: "/tw-v2/interaction/block", action: "block", required: { authToken, userId: "10017528" }, optional: { username: "example", proxy } },
  { resource: "interaction", method: "unblock", path: "/tw-v2/interaction/unblock", action: "unblock", required: { authToken, userId: "10017528" }, optional: { username: "example", proxy } },
  { resource: "interaction", method: "mute", path: "/tw-v2/interaction/mute", action: "mute", required: { authToken, userId: "10017528" }, optional: { username: "example", proxy } },
  { resource: "interaction", method: "unmute", path: "/tw-v2/interaction/unmute", action: "unmute", required: { authToken, userId: "10017528" }, optional: { username: "example", proxy } },
  { resource: "interaction", method: "removeFollower", path: "/tw-v2/interaction/remove-follower", action: "remove_follower", required: { authToken, userId: "10017528" }, optional: { username: "example", proxy } },
  { resource: "list", method: "delete", path: "/tw-v2/list/delete", action: "delete_list", required: { authToken, listId: "1234567890" }, optional: { proxy } },
];

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function actionResponse(action: ActionType): ActionResponse {
  return { data: { id: "1234567890", action, timestamp: "2026-11-03T12:00:00.000Z", success: true } };
}

function methodOf(client: TweetAPI, resource: string, method: string): Method | undefined {
  const target = (client as unknown as Record<string, Record<string, Method>>)[resource];
  return target[method]?.bind(target);
}

let client: TweetAPI;
beforeEach(() => {
  mockFetch.mockReset();
  client = new TweetAPI({
    apiKey: "API_KEY",
    retry: { maxRetries: 3, initialRetryDelay: 1, maxRetryDelay: 1 },
  });
});

describe.each(actions)("$resource.$method", ({ resource, method, path, action, required, optional }) => {
  it("exists on the resource", () => {
    expect(methodOf(client, resource, method)).toBeTypeOf("function");
  });

  it(`sends POST ${path} with every field in the JSON body`, async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(actionResponse(action)));
    await expect(methodOf(client, resource, method)!({ ...required, ...optional })).resolves.toEqual(actionResponse(action));

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`https://api.tweetapi.com${path}`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-API-Key": "API_KEY", "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ ...required, ...optional });
  });

  it("drops unset optional fields", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(actionResponse(action)));
    const unset = Object.fromEntries(Object.keys(optional).map((key) => [key, undefined]));
    await methodOf(client, resource, method)!({ ...required, ...unset });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual(required);
  });

  it("follows the write retry rules", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ statusCode: 500, message: "failed" }, 500));
    await expect(methodOf(client, resource, method)!(required)).rejects.toBeInstanceOf(ServerError);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    mockFetch
      .mockResolvedValueOnce(jsonResponse({ statusCode: 503, message: "unavailable" }, 503, { "Retry-After": "0" }))
      .mockResolvedValueOnce(jsonResponse(actionResponse(action)));
    await methodOf(client, resource, method)!(required);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe("Action return types", () => {
  it("returns ActionResponse", () => {
    expectTypeOf(client.post.pinPost).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.post.unpinPost).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.post.hideReply).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.post.unhideReply).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.block).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.unblock).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.mute).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.unmute).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.interaction.removeFollower).returns.toEqualTypeOf<Promise<ActionResponse>>();
    expectTypeOf(client.list.delete).returns.toEqualTypeOf<Promise<ActionResponse>>();
  });
});
