import type { TweetAPI } from "../client";
import type { ActionResponse, ApiResponse, PaginatedResponse } from "../types/common";
import type { Notification, UserAnalytics } from "../types/responses";
import type {
  FavoritePostParams,
  UnfavoritePostParams,
  RetweetParams,
  DeleteRetweetParams,
  BookmarkParams,
  DeleteBookmarkParams,
  FollowParams,
  UnfollowParams,
  GetFollowRequestsParams,
  AcceptFollowRequestParams,
  DenyFollowRequestParams,
  AddMemberToListParams,
  RemoveMemberFromListParams,
  GetNotificationsParams,
  GetUserAnalyticsParams,
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
}
