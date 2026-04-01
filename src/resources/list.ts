import type { TweetAPI } from "../client";
import type { ApiResponse, PaginatedResponse } from "../types/common";
import type { List, Tweet, User } from "../types/responses";
import type {
  GetListDetailsParams,
  GetListTweetsParams,
  GetListMembersParams,
  GetListFollowersParams,
} from "../types/params";

export class ListResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get list details */
  async getDetails(params: GetListDetailsParams) {
    return this.client.get<ApiResponse<List>>("/tw-v2/list/details", params);
  }

  /** Get tweets in a list */
  async getTweets(params: GetListTweetsParams) {
    return this.client.get<PaginatedResponse<Tweet>>("/tw-v2/list/tweets", params);
  }

  /** Get members of a list */
  async getMembers(params: GetListMembersParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/list/members", params);
  }

  /** Get followers of a list */
  async getFollowers(params: GetListFollowersParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/list/followers", params);
  }
}
