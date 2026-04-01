import type { TweetAPI } from "../client";
import type { ActionResponse, ApiResponse } from "../types/common";
import type {
  SendDmParams,
  GetDmPermissionsParams,
  GetInboxInitialStateParams,
  GetInboxTrustedParams,
  GetInboxUntrustedParams,
  GetConversationParams,
  GetDmUserUpdatesParams,
  AcceptConversationParams,
} from "../types/params";

export class UnencryptedDMResource {
  constructor(private readonly client: TweetAPI) {}

  /** Send an unencrypted direct message */
  async sendDm(params: SendDmParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/send-dm",
      params,
    );
  }

  /** Check DM permissions for recipients */
  async getDmPermissions(params: GetDmPermissionsParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/dm-permissions",
      params,
    );
  }

  /** Get initial inbox state */
  async getInboxInitialState(params: GetInboxInitialStateParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/inbox-initial-state",
      params,
    );
  }

  /** Get trusted inbox conversations */
  async getInboxTrusted(params: GetInboxTrustedParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/inbox-timeline-trusted",
      params,
    );
  }

  /** Get untrusted (message requests) inbox conversations */
  async getInboxUntrusted(params: GetInboxUntrustedParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/inbox-timeline-untrusted",
      params,
    );
  }

  /** Get messages in a conversation */
  async getConversation(params: GetConversationParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/conversation",
      params,
    );
  }

  /** Get DM user updates */
  async getDmUserUpdates(params: GetDmUserUpdatesParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>(
      "/tw-v2/interaction/dm-user-updates",
      params,
    );
  }

  /** Accept a conversation request */
  async acceptConversation(params: AcceptConversationParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/accept-conversation",
      params,
    );
  }
}
