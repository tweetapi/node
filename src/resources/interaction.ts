import type { TweetAPI } from "../client";
import type { ActionResponse, ApiResponse, PaginatedResponse } from "../types/common";
import type { Notification, Tweet, User, UserAnalytics } from "../types/responses";
import type {
  FavoritePostParams,
  UnfavoritePostParams,
  RetweetParams,
  DeleteRetweetParams,
  BookmarkParams,
  DeleteBookmarkParams,
  FollowParams,
  UnfollowParams,
  BlockParams,
  UnblockParams,
  MuteParams,
  UnmuteParams,
  RemoveFollowerParams,
  VotePollParams,
  GetFollowRequestsParams,
  AcceptFollowRequestParams,
  DenyFollowRequestParams,
  AddMemberToListParams,
  RemoveMemberFromListParams,
  GetNotificationsParams,
  GetUserAnalyticsParams,
  GetBookmarksParams,
  GetLikesParams,
  GetBlockedAccountsParams,
  GetMutedAccountsParams,
} from "../types/params";

export class InteractionResource {
  constructor(private readonly client: TweetAPI) {}

  /** Like a tweet */
  async favoritePost(params: FavoritePostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/like-post",
      params,
    );
  }

  /** Unlike a tweet */
  async unfavoritePost(params: UnfavoritePostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unlike-post",
      params,
    );
  }

  /** Retweet a tweet */
  async retweet(params: RetweetParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/retweet",
      params,
    );
  }

  /** Remove a retweet */
  async deleteRetweet(params: DeleteRetweetParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/delete-retweet",
      params,
    );
  }

  /** Bookmark a tweet */
  async bookmark(params: BookmarkParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/bookmark",
      params,
    );
  }

  /** Remove a bookmark */
  async deleteBookmark(params: DeleteBookmarkParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/delete-bookmark",
      params,
    );
  }

  /** Follow a user */
  async follow(params: FollowParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/follow",
      params,
    );
  }

  /** Unfollow a user */
  async unfollow(params: UnfollowParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unfollow",
      params,
    );
  }

  /** Block a user */
  async block(params: BlockParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/block",
      params,
    );
  }

  /** Unblock a user */
  async unblock(params: UnblockParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unblock",
      params,
    );
  }

  /** Mute a user */
  async mute(params: MuteParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/mute",
      params,
    );
  }

  /** Unmute a user */
  async unmute(params: UnmuteParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unmute",
      params,
    );
  }

  /** Make a user stop following you. Only that user can follow you again. */
  async removeFollower(params: RemoveFollowerParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/remove-follower",
      params,
    );
  }

  /** Vote in a poll. `choice` is 1 to 4, in the order x.com shows the options. */
  async votePoll(params: VotePollParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/vote-poll",
      params,
    );
  }

  /** List incoming follow-request IDs for the authenticated account. */
  async getFollowRequests(params: GetFollowRequestsParams): Promise<PaginatedResponse<string>> {
    return this.client.get<PaginatedResponse<string>>(
      "/tw-v2/interaction/follow-requests",
      params,
    );
  }

  /** Accept one incoming request. Never automatically retried; reconcile timeouts before retrying. */
  async acceptFollowRequest(params: AcceptFollowRequestParams): Promise<ActionResponse> {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/accept-follow-request",
      params,
      { retry: false },
    );
  }

  /** Deny one incoming request. Never automatically retried; reconcile timeouts before retrying. */
  async denyFollowRequest(params: DenyFollowRequestParams): Promise<ActionResponse> {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/deny-follow-request",
      params,
      { retry: false },
    );
  }

  /** Add a user to a list */
  async addMemberToList(params: AddMemberToListParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/add-to-list",
      params,
    );
  }

  /** Remove a user from a list */
  async removeMemberFromList(params: RemoveMemberFromListParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/remove-from-list",
      params,
    );
  }

  /** Get your notifications */
  async getNotifications(params: GetNotificationsParams) {
    return this.client.get<PaginatedResponse<Notification>>(
      "/tw-v2/interaction/notifications",
      params,
    );
  }

  /** Get your account analytics */
  async getUserAnalytics(params: GetUserAnalyticsParams) {
    return this.client.get<ApiResponse<UserAnalytics>>(
      "/tw-v2/interaction/user-analytics",
      params,
    );
  }

  /** Get the posts bookmarked by the `authToken` account */
  async getBookmarks(params: GetBookmarksParams) {
    return this.client.get<PaginatedResponse<Tweet>>(
      "/tw-v2/interaction/bookmarks",
      params,
    );
  }

  /** Get the posts liked by the `authToken` account. `userId` must be that account's ID. */
  async getLikes(params: GetLikesParams) {
    return this.client.get<PaginatedResponse<Tweet>>(
      "/tw-v2/interaction/likes",
      params,
    );
  }

  /** Get the accounts blocked by the `authToken` account */
  async getBlockedAccounts(params: GetBlockedAccountsParams) {
    return this.client.get<PaginatedResponse<User>>(
      "/tw-v2/interaction/blocked-accounts",
      params,
    );
  }

  /** Get the accounts muted by the `authToken` account */
  async getMutedAccounts(params: GetMutedAccountsParams) {
    return this.client.get<PaginatedResponse<User>>(
      "/tw-v2/interaction/muted-accounts",
      params,
    );
  }
}
