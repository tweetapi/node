export { TweetAPI } from "./client";
export type { TweetAPIOptions } from "./client";

// Error classes
export {
  TweetAPIError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  ConnectionError,
} from "./errors";

// Resource classes
export { UserResource } from "./resources/user";
export { TweetResource } from "./resources/tweet";
export { PostResource } from "./resources/post";
export { InteractionResource } from "./resources/interaction";
export { ListResource } from "./resources/list";
export { CommunityResource } from "./resources/community";
export { SpaceResource } from "./resources/space";
export { ExploreResource } from "./resources/explore";
export { AuthResource } from "./resources/auth";
export { XChatResource } from "./resources/xchat";
export { UnencryptedDMResource } from "./resources/unencrypted-dm";

// Response types
export type {
  User,
  UserRelationship,
  UserAnalytics,
  Tweet,
  TweetTranslation,
  Media,
  MediaSize,
  VideoVariant,
  Poll,
  PollOption,
  Card,
  Place,
  List,
  Community,
  CommunityRule,
  CommunityMember,
  CommunitySearchResult,
  Space,
  SpaceParticipant,
  SpaceTopic,
  SpaceStreamInfo,
  Notification,
  LoginResponse,
} from "./types/responses";

// Common types
export type {
  ApiResponse,
  PaginatedResponse,
  ActionResponse,
  Pagination,
  ErrorDetails,
  ErrorResponseBody,
  ActionType,
} from "./types/common";

// Param types
export type * from "./types/params";

// Default export
export { TweetAPI as default } from "./client";
