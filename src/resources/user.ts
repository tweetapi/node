import type { TweetAPI } from "../client";
import type { ApiResponse, PaginatedResponse } from "../types/common";
import type {
  User,
  Tweet,
  UserRelationship,
} from "../types/responses";
import type {
  GetByUsernameParams,
  GetByUsernamesParams,
  GetByUserIdParams,
  GetByUserIdsParams,
  GetUserTweetsParams,
  GetUserTweetsAndRepliesParams,
  GetFollowingParams,
  GetFollowersParams,
  GetVerifiedFollowersParams,
  GetSubscriptionsParams,
  GetFollowingV1Params,
  GetFollowersV1Params,
  GetFollowingIdsParams,
  GetFollowersIdsParams,
  CheckFollowParams,
  AboutAccountParams,
} from "../types/params";

export class UserResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get a user profile by username */
  async getByUsername(params: GetByUsernameParams) {
    return this.client.get<ApiResponse<User>>("/tw-v2/user/by-username", params);
  }

  /** Get multiple user profiles by usernames (comma-separated) */
  async getByUsernames(params: GetByUsernamesParams) {
    return this.client.get<ApiResponse<User[]>>("/tw-v2/user/by-usernames", params);
  }

  /** Get a user profile by user ID */
  async getByUserId(params: GetByUserIdParams) {
    return this.client.get<ApiResponse<User>>("/tw-v2/user/by-id", params);
  }

  /** Get multiple user profiles by user IDs (comma-separated) */
  async getByUserIds(params: GetByUserIdsParams) {
    return this.client.get<ApiResponse<User[]>>("/tw-v2/user/by-ids", params);
  }

  /** Get a user's tweets */
  async getTweets(params: GetUserTweetsParams) {
    return this.client.get<PaginatedResponse<Tweet>>("/tw-v2/user/tweets", params);
  }

  /** Get a user's tweets and replies */
  async getTweetsAndReplies(params: GetUserTweetsAndRepliesParams) {
    return this.client.get<PaginatedResponse<Tweet>>("/tw-v2/user/tweets-and-replies", params);
  }

  /** Get a user's following list (v2 — full user objects) */
  async getFollowing(params: GetFollowingParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/following", params);
  }

  /** Get a user's followers (v2 — full user objects) */
  async getFollowers(params: GetFollowersParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/followers", params);
  }

  /** Get a user's verified followers */
  async getVerifiedFollowers(params: GetVerifiedFollowersParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/verified-followers", params);
  }

  /** Get a user's subscriptions */
  async getSubscriptions(params: GetSubscriptionsParams) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/subscriptions", params);
  }

  /** Get a user's following list (v1 — supports count parameter) */
  async getFollowingV1(params: GetFollowingV1Params) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/following-list", params);
  }

  /** Get a user's followers (v1 — supports count parameter) */
  async getFollowersV1(params: GetFollowersV1Params) {
    return this.client.get<PaginatedResponse<User>>("/tw-v2/user/followers-list", params);
  }

  /** Get IDs of accounts a user is following */
  async getFollowingIds(params: GetFollowingIdsParams) {
    return this.client.get<PaginatedResponse<string>>("/tw-v2/user/following-ids", params);
  }

  /** Get IDs of a user's followers */
  async getFollowersIds(params: GetFollowersIdsParams) {
    return this.client.get<PaginatedResponse<string>>("/tw-v2/user/followers-ids", params);
  }

  /** Check the follow relationship between two users */
  async checkFollow(params: CheckFollowParams) {
    return this.client.get<ApiResponse<UserRelationship>>("/tw-v2/user/friendship", params);
  }

  /** Get account creation details and transparency information */
  async aboutAccount(params: AboutAccountParams) {
    return this.client.get<ApiResponse<Record<string, unknown>>>("/tw-v2/user/about-account", params);
  }
}
