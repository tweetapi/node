// ─── User Params ─────────────────────────────────────────────────────────────

export interface GetByUsernameParams {
  username: string;
}

export interface GetByUsernamesParams {
  usernames: string;
}

export interface GetByUserIdParams {
  userId: string;
}

export interface GetByUserIdsParams {
  userIds: string;
}

export interface GetUserTweetsParams {
  userId: string;
  cursor?: string;
}

export interface GetUserTweetsAndRepliesParams {
  userId: string;
  cursor?: string;
}

export interface GetFollowingParams {
  userId: string;
  cursor?: string;
}

export interface GetFollowersParams {
  userId: string;
  cursor?: string;
}

export interface GetVerifiedFollowersParams {
  userId: string;
  cursor?: string;
}

export interface GetSubscriptionsParams {
  userId: string;
  cursor?: string;
}

export interface GetFollowingV1Params {
  userId: string;
  count?: string;
  cursor?: string;
}

export interface GetFollowersV1Params {
  userId: string;
  count?: string;
  cursor?: string;
}

export interface GetFollowingIdsParams {
  userId: string;
  count?: string;
  cursor?: string;
}

export interface GetFollowersIdsParams {
  userId: string;
  count?: string;
  cursor?: string;
}

export interface CheckFollowParams {
  subjectId: string;
  targetId: string;
}

export interface AboutAccountParams {
  username: string;
}

// ─── Tweet Params ────────────────────────────────────────────────────────────

export interface GetTweetDetailsParams {
  tweetId: string;
  cursor?: string;
  sortBy?: string;
}

export interface GetTweetDetailsByIdsParams {
  ids: string;
}

export interface GetRetweetsParams {
  tweetId: string;
  cursor?: string;
}

export interface GetQuotesParams {
  tweetId: string;
  cursor?: string;
}

export interface TranslateTweetParams {
  tweetId: string;
  dstLang: string;
}

// ─── Post Params ─────────────────────────────────────────────────────────────

export interface CreatePostParams {
  authToken: string;
  text: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface CreatePostQuoteParams {
  authToken: string;
  text: string;
  attachmentUrl: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface CreatePostWithMediaParams {
  authToken: string;
  text: string;
  media: unknown[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface ReplyPostParams {
  authToken: string;
  text: string;
  tweetId: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface ReplyPostWithMediaParams {
  authToken: string;
  text: string;
  tweetId: string;
  media: unknown[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface DeletePostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

// ─── Interaction Params ──────────────────────────────────────────────────────

export interface FavoritePostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface UnfavoritePostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface RetweetParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface DeleteRetweetParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface BookmarkParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface DeleteBookmarkParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface FollowParams {
  authToken: string;
  userId: string;
  proxy?: string;
}

export interface UnfollowParams {
  authToken: string;
  userId: string;
  proxy?: string;
}

export interface AddMemberToListParams {
  authToken: string;
  listId: string;
  userId: string;
  proxy?: string;
}

export interface RemoveMemberFromListParams {
  authToken: string;
  listId: string;
  userId: string;
  proxy?: string;
}

export interface GetNotificationsParams {
  authToken: string;
  timelineType?: string;
  count?: number;
  cursor?: string;
  proxy?: string;
}

export interface GetUserAnalyticsParams {
  authToken: string;
  toTime?: string;
  fromTime?: string;
  granularity?: string;
  showVerifiedFollowers?: boolean;
  proxy?: string;
}

// ─── List Params ─────────────────────────────────────────────────────────────

export interface GetListDetailsParams {
  listId: string;
}

export interface GetListTweetsParams {
  listId: string;
  cursor?: string;
}

export interface GetListMembersParams {
  listId: string;
  cursor?: string;
}

export interface GetListFollowersParams {
  listId: string;
  cursor?: string;
}

// ─── Community Params ────────────────────────────────────────────────────────

export interface GetCommunityDetailsParams {
  communityId: string;
}

export interface GetCommunityTweetsParams {
  communityId: string;
  sortBy: string;
  cursor?: string;
}

export interface GetCommunityMembersParams {
  communityId: string;
  cursor?: string;
}

export interface SearchCommunityParams {
  query: string;
  cursor?: string;
}

export interface CreateCommunityPostParams {
  authToken: string;
  text: string;
  communityId: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface CreateCommunityPostWithMediaParams {
  authToken: string;
  text: string;
  communityId: string;
  media: unknown[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface ReplyCommunityPostParams {
  authToken: string;
  text: string;
  tweetId: string;
  communityId: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface ReplyCommunityPostWithMediaParams {
  authToken: string;
  text: string;
  tweetId: string;
  communityId: string;
  media: unknown[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface JoinCommunityParams {
  authToken: string;
  communityId: string;
  proxy?: string;
}

export interface LeaveCommunityParams {
  authToken: string;
  communityId: string;
  proxy?: string;
}

// ─── Space Params ────────────────────────────────────────────────────────────

export interface GetSpaceByIdParams {
  spaceId: string;
}

export interface GetSpaceStreamUrlParams {
  mediaKey: string;
}

// ─── Explore Params ──────────────────────────────────────────────────────────

export interface SearchParams {
  query: string;
  type: string;
  cursor?: string;
}

// ─── Auth Params ─────────────────────────────────────────────────────────────

export interface LoginParams {
  username: string;
  password: string;
  proxy: string;
  twoFactorSecret?: string;
}

// ─── XChat Params ────────────────────────────────────────────────────────────

export interface XChatSetupParams {
  authToken: string;
  userId: string;
  pin: string;
  proxy?: string;
}

export interface XChatGetConversationsParams {
  authToken: string;
  cursor?: string;
  graphSnapshotId?: string;
  limit?: number;
  proxy?: string;
}

export interface XChatSendParams {
  authToken: string;
  recipientId: string;
  message: string;
  proxy?: string;
}

export interface XChatGetHistoryParams {
  authToken: string;
  conversationId: string;
  cursor?: string;
  limit?: number;
  proxy?: string;
}

export interface XChatCanDmParams {
  authToken: string;
  userIds: string[];
  proxy?: string;
}

// ─── Unencrypted DM Params ──────────────────────────────────────────────────

export interface SendDmParams {
  authToken: string;
  conversationId: string;
  text: string;
  proxy: string;
  requestId?: string;
  media?: unknown[];
}

export interface GetDmPermissionsParams {
  authToken: string;
  recipientIds: string;
  proxy?: string;
}

export interface GetInboxInitialStateParams {
  authToken: string;
  proxy?: string;
}

export interface GetInboxTrustedParams {
  authToken: string;
  cursor: string;
  filterLowQuality?: boolean;
  proxy?: string;
}

export interface GetInboxUntrustedParams {
  authToken: string;
  cursor: string;
  filterLowQuality?: boolean;
  proxy?: string;
}

export interface GetConversationParams {
  authToken: string;
  conversationId: string;
  cursor?: string;
  proxy?: string;
}

export interface GetDmUserUpdatesParams {
  authToken: string;
  cursor: string;
  proxy?: string;
}

export interface AcceptConversationParams {
  authToken: string;
  conversationId: string;
  proxy?: string;
}
