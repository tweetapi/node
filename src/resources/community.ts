import type { TweetAPI } from "../client";
import type { ApiResponse, PaginatedResponse, ActionResponse } from "../types/common";
import type {
  Community,
  CommunityMember,
  CommunitySearchResult,
  Tweet,
} from "../types/responses";
import type {
  GetCommunityDetailsParams,
  GetCommunityTweetsParams,
  GetCommunityMembersParams,
  SearchCommunityParams,
  CreateCommunityPostParams,
  CreateCommunityPostWithMediaParams,
  CreateCommunityQuoteParams,
  CreateCommunityQuoteWithMediaParams,
  ReplyCommunityPostParams,
  ReplyCommunityPostWithMediaParams,
  JoinCommunityParams,
  LeaveCommunityParams,
} from "../types/params";

export class CommunityResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get community details */
  async getDetails(params: GetCommunityDetailsParams) {
    return this.client.get<ApiResponse<Community>>(
      "/tw-v2/community/details",
      params,
    );
  }

  /** Get tweets in a community */
  async getTweets(params: GetCommunityTweetsParams) {
    return this.client.get<PaginatedResponse<Tweet>>(
      "/tw-v2/community/tweets",
      params,
    );
  }

  /** Get community members */
  async getMembers(params: GetCommunityMembersParams) {
    return this.client.get<PaginatedResponse<CommunityMember>>(
      "/tw-v2/community/members",
      params,
    );
  }

  /** Search communities */
  async search(params: SearchCommunityParams) {
    return this.client.get<PaginatedResponse<CommunitySearchResult>>(
      "/tw-v2/community/search",
      params,
    );
  }

  /** Create a post in a community */
  async createPost(params: CreateCommunityPostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-community-post",
      params,
    );
  }

  /** Create a post with media in a community */
  async createPostWithMedia(params: CreateCommunityPostWithMediaParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-community-post-with-media",
      params,
    );
  }

  /** Create a quote post in a community */
  async createQuote(params: CreateCommunityQuoteParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-community-quote",
      params,
    );
  }

  /** Create a quote post with media in a community */
  async createQuoteWithMedia(params: CreateCommunityQuoteWithMediaParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-community-quote-with-media",
      params,
    );
  }

  /** Reply to a community post */
  async replyPost(params: ReplyCommunityPostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/reply-community-post",
      params,
    );
  }

  /** Reply to a community post with media */
  async replyPostWithMedia(params: ReplyCommunityPostWithMediaParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/reply-community-post-with-media",
      params,
    );
  }

  /** Join a community */
  async join(params: JoinCommunityParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/join-community",
      params,
    );
  }

  /** Leave a community */
  async leave(params: LeaveCommunityParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/leave-community",
      params,
    );
  }
}
