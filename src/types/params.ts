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
  userIds: string[];
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

export interface GetUserPhotosParams {
  userId: string;
  cursor?: string;
}

export interface GetUserVideosParams {
  userId: string;
  cursor?: string;
}

export interface GetUserAffiliatesParams {
  userId: string;
  cursor?: string;
}

export interface GetUserListsParams {
  userId: string;
  cursor?: string;
}

export interface GetUserListMembershipsParams {
  userId: string;
  cursor?: string;
}

export interface GetUserHighlightsParams {
  userId: string;
  cursor?: string;
}

export interface GetUserArticlesParams {
  userId: string;
  cursor?: string;
}

export interface GetSimilarAccountsParams {
  userId: string;
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

export interface GetHiddenRepliesParams {
  tweetId: string;
  cursor?: string;
}

// ─── Post Params ─────────────────────────────────────────────────────────────

export type ReplyOptionMode =
  | "everyone"
  | "accounts_you_follow"
  | "accounts_you_follow_and_followed"
  | "mentioned_accounts"
  | "verified_accounts"
  | "regions";

export type ReplyRegionCode =
  | "NAM"
  | "EAS"
  | "AFR"
  | "SEA"
  | "SAM"
  | "EUR"
  | "AUS"
  | "SAS"
  | "WES"
  | "CAS";

export interface ReplyOption {
  mode: ReplyOptionMode;
  regions?: ReplyRegionCode[];
}

// For a `url`, `type` is optional: the API reads the type from the downloaded file.

export type TweetMediaInput =
  | { media_id: string }
  | { url: string; type?: string }
  | { data: string; type: string };

export type ProfileMediaInput =
  | { url: string; type?: string }
  | { data: string; type: string };

/** One photo, GIF or video for `post.uploadMedia` */
export type MediaUploadInput =
  | { url: string; type?: string }
  | { data: string; type: string };

export interface PollInput {
  /** 2 to 4 choices of up to 25 characters each */
  choices: string[];
  /** 5 to 10080 minutes (7 days) */
  durationMinutes: number;
}

export interface CreatePostParams {
  authToken: string;
  text: string;
  proxy: string;
  disableLinkPreview?: boolean;
  replyOption?: ReplyOption;
  /** Can't be combined with `disableLinkPreview`. A post with a poll is limited to 280 characters. */
  poll?: PollInput;
}

export interface CreatePostQuoteParams {
  authToken: string;
  text: string;
  attachmentUrl: string;
  proxy: string;
  disableLinkPreview?: boolean;
  replyOption?: ReplyOption;
}

export interface CreatePostWithMediaParams {
  authToken: string;
  text: string;
  media: TweetMediaInput[];
  proxy: string;
  disableLinkPreview?: boolean;
  replyOption?: ReplyOption;
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
  media: TweetMediaInput[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface DeletePostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface PinPostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface UnpinPostParams {
  authToken: string;
  tweetId: string;
  proxy?: string;
}

export interface HideReplyParams {
  authToken: string;
  /** ID of the reply to hide */
  tweetId: string;
  proxy?: string;
}

export interface UnhideReplyParams {
  authToken: string;
  /** ID of the hidden reply */
  tweetId: string;
  proxy?: string;
}

export interface UploadMediaParams {
  authToken: string;
  proxy: string;
  media: MediaUploadInput;
}

export interface GetMediaStatusParams {
  authToken: string;
  proxy: string;
  /** `mediaId` returned by `post.uploadMedia` */
  mediaId: string;
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
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface UnfollowParams {
  authToken: string;
  userId: string;
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface BlockParams {
  authToken: string;
  userId: string;
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface UnblockParams {
  authToken: string;
  userId: string;
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface MuteParams {
  authToken: string;
  userId: string;
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface UnmuteParams {
  authToken: string;
  userId: string;
  /** Optional username of the target account */
  username?: string;
  proxy?: string;
}

export interface RemoveFollowerParams {
  authToken: string;
  /** ID of the follower to remove */
  userId: string;
  /** Optional and not needed: `userId` identifies the follower */
  username?: string;
  proxy?: string;
}

export interface VotePollParams {
  authToken: string;
  /** ID of the post with the poll */
  tweetId: string;
  /** Option to vote for, an integer from 1 to 4 as numbered on x.com */
  choice: number;
  proxy?: string;
}

export interface GetFollowRequestsParams {
  authToken: string;
  proxy?: string;
  /** Pagination cursor. The API defaults to "-1". */
  cursor?: string;
  /** Integer from 1 to 100. The API defaults to 100. */
  count?: number;
}

export interface AcceptFollowRequestParams {
  authToken: string;
  /** Requester's digit-only user ID. Keep it as a string to preserve precision. */
  userId: string;
  proxy?: string;
}

export interface DenyFollowRequestParams {
  authToken: string;
  /** Requester's digit-only user ID. Keep it as a string to preserve precision. */
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

export interface GetBookmarksParams {
  authToken: string;
  cursor?: string;
  proxy?: string;
}

export interface GetLikesParams {
  authToken: string;
  /** Numeric user ID of the account behind `authToken` */
  userId: string;
  cursor?: string;
  proxy?: string;
}

export interface GetBlockedAccountsParams {
  authToken: string;
  cursor?: string;
  proxy?: string;
}

export interface GetMutedAccountsParams {
  authToken: string;
  cursor?: string;
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

export interface SearchListParams {
  query: string;
  cursor?: string;
}

export interface CreateListParams {
  authToken: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  proxy?: string;
}

export interface AddListMemberParams {
  authToken: string;
  listId: string;
  userId: string;
  proxy?: string;
}

export interface RemoveListMemberParams {
  authToken: string;
  listId: string;
  userId: string;
  proxy?: string;
}

export interface DeleteListParams {
  authToken: string;
  listId: string;
  proxy?: string;
}

// ─── Profile Params ─────────────────────────────────────────────────────────

export interface UpdateProfileParams {
  authToken: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  proxy?: string;
}

export interface UpdateProfileUsernameParams {
  authToken: string;
  password: string;
  username: string;
  proxy?: string;
}

export interface UpdateProfileAvatarParams {
  authToken: string;
  media: ProfileMediaInput;
  proxy?: string;
}

export interface UpdateProfileBannerParams {
  authToken: string;
  media: ProfileMediaInput;
  proxy?: string;
}

export interface RemoveProfileBannerParams {
  authToken: string;
  proxy?: string;
}

export interface UpdateProfilePrivacyParams {
  authToken: string;
  isPrivate: boolean;
  proxy?: string;
}

// ─── Community Params ────────────────────────────────────────────────────────

export interface GetCommunityDetailsParams {
  communityId: string;
}

export interface GetCommunityTweetsParams {
  communityId: string;
  /** "Relevance" or "Recency". The API defaults to "Relevance". */
  sortBy?: string;
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

export interface GetCommunityMediaParams {
  communityId: string;
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
  media: TweetMediaInput[];
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
  media: TweetMediaInput[];
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface CreateCommunityQuoteParams {
  authToken: string;
  text: string;
  attachmentUrl: string;
  communityId: string;
  proxy: string;
  disableLinkPreview?: boolean;
}

export interface CreateCommunityQuoteWithMediaParams {
  authToken: string;
  text: string;
  attachmentUrl: string;
  communityId: string;
  media: TweetMediaInput[];
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

// ─── Trends Params ───────────────────────────────────────────────────────────

/** Pass `country` or `woeid`, not both. Omit both for worldwide trends. */
export type GetTrendsParams =
  | {
      /** Two-letter country code, such as "US" */
      country?: string;
      woeid?: never;
    }
  | {
      /** Where On Earth ID from `trends.getLocations()`; 1 is worldwide */
      woeid?: string | number;
      country?: never;
    };

// ─── Explore Params ──────────────────────────────────────────────────────────

export type SearchType = "Top" | "Latest" | "People" | "Photos" | "Videos";

export interface SearchParams {
  query: string;
  /** One of `SearchType`. When it is a literal, the result type follows it. */
  type: string;
  cursor?: string;
}

// ─── Auth Params ─────────────────────────────────────────────────────────────

export interface LoginParams {
  username: string;
  password: string;
  proxy: string;
  /** ISO 3166-1 alpha-2 country code for the proxy's public egress IP. */
  country: string;
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
  /** The three conversation fields are fetched automatically when omitted. */
  conversationToken?: string;
  conversationKeyVersion?: string;
  encryptedConversationKey?: string;
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
