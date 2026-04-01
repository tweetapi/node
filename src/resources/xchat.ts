import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type {
  XChatSetupParams,
  XChatGetConversationsParams,
  XChatSendParams,
  XChatGetHistoryParams,
  XChatCanDmParams,
} from "../types/params";

export class XChatResource {
  constructor(private readonly client: TweetAPI) {}

  /** Initialize X Chat (encrypted DMs) for your account */
  async setup(params: XChatSetupParams) {
    return this.client.post_<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/xchat/setup",
      params,
    );
  }

  /** List encrypted DM conversations */
  async getConversations(params: XChatGetConversationsParams) {
    return this.client.post_<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/xchat/conversations",
      params,
    );
  }

  /** Send an encrypted message */
  async send(params: XChatSendParams) {
    return this.client.post_<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/xchat/send",
      params,
    );
  }

  /** Get encrypted conversation history */
  async getHistory(params: XChatGetHistoryParams) {
    return this.client.post_<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/xchat/history",
      params,
    );
  }

  /** Check if you can send encrypted DMs to users */
  async canDm(params: XChatCanDmParams) {
    return this.client.post_<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/xchat/can-dm",
      params,
    );
  }
}
