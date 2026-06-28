// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  name: string;

  bio: string;
  location: string | null;
  website: string | null;
  pinnedTweetIds: string[];

  avatar: string | null;
  banner: string | null;
  profileImageShape: "Circle" | "Square" | null;

  verified: boolean;
  isBlueVerified: boolean;
  verifiedType: string | null;
  verifiedSince: string | null;
  isIdentityVerified: boolean;

  isProtected: boolean;
  possiblySensitive: boolean;
  profileInterstitialType: string | null;
  withheldInCountries: string[];

  professional: {
    type: string | null;
    category: string[];
    restId: string | null;
  } | null;
  businessAccount: {
    affiliatesCount: number;
  } | null;

  creatorSubscriptionsCount: number;
  hasHiddenSubscriptions: boolean;
  highlightsInfo: {
    canHighlight: boolean;
    highlightedTweetsCount: string;
  } | null;

  hasGraduatedAccess: boolean;
  isProfileTranslatable: boolean;
  hasCustomTimelines: boolean;
  isTranslator: boolean;

  affiliatesHighlightedLabel: Record<string, unknown> | null;

  defaultProfile: boolean;
  defaultProfileImage: boolean;

  followerCount: number;
  followingCount: number;
  tweetCount: number;
  listedCount: number;
  mediaCount: number;
  favoritesCount: number;

  createdAt: string | null;
}

export interface UserRelationship {
  sourceId: string;
  targetId: string;
  following: boolean;
  followedBy: boolean;
  blocking: boolean;
  blockedBy: boolean;
  muting: boolean;
  notificationsEnabled: boolean;
  canDm: boolean;
  canMediaTag: boolean;
  wantRetweets: boolean;
  markedSpam: boolean;
  followRequestSent: boolean;
  followRequestReceived: boolean;
  allReplies?: boolean;
}

export interface UserAnalytics {
  userId: string;
  period: string;
  impressions: number;
  engagements: number;
  engagementRate?: number;
  linkClicks: number;
  profileVisits: number;
  mentions: number;
  newFollowers: number;
  topTweet: string | null;
  detailedMetrics: {
    replies: number;
    retweets: number;
    likes: number;
    follows: number;
    unfollows: number;
  };
}

// ─── Tweet ───────────────────────────────────────────────────────────────────

export interface Tweet {
  id: string;
  conversationId: string | null;
  text: string;
  displayTextRange: [number, number];

  author: User;
  source: string | null;

  type: "tweet" | "reply" | "quote" | "retweet" | "thread";
  replyTo: {
    tweetId: string;
    userId: string;
    username: string;
  } | null;
  quotedTweet: Tweet | null;
  reactionContext: ReactionContext | null;
  retweetedTweet: Tweet | null;

  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  bookmarkCount: number;
  viewCount: number | null;

  media: Media[] | null;
  poll: Poll | null;
  card: Card | null;

  hashtags: string[];
  mentions: {
    id: string;
    username: string;
    name: string;
  }[];
  urls: string[];
  symbols: string[];

  possiblySensitive: boolean;
  limitedActions: string | null;

  hasAIGeneratedMedia: boolean;
  isPaidPromotion: boolean;

  isEdited: boolean;
  editControl: {
    editTweetIds: string[];
    editableUntil: string;
    isEditEligible: boolean;
    editsRemaining: number;
  } | null;

  isTranslatable: boolean;
  lang: string;
  translatedText: string | null;

  hasBirdwatchNotes: boolean;
  birdwatchPivot: {
    calloutText: string;
    shortTitle: string;
    noteId: string;
    iconType: string;
    destinationUrl: string;
    subtitle: {
      text: string;
      entities: unknown[];
    };
  } | null;

  conversationControl: {
    policy: string;
    allowedUserIds: string[];
  } | null;

  isPromoted: boolean;
  promotedMetadata: object | null;

  communityId: string | null;
  communityResults: object | null;

  createdAt: string | null;
  place: Place | null;
}

export interface ReactionTargetAuthor {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isBlueVerified: boolean;
}

export interface ReactionContext {
  isReaction: true;
  targetTweetId: string | null;
  targetTweetUrl: string | null;
  targetAuthor: ReactionTargetAuthor | null;
}

export interface TweetTranslation {
  text: string;
  lang: string;
  sourceLanguage: string;
  destinationLanguage: string;
  translationSource: string;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface Media {
  id: string;
  key: string;
  type: "photo" | "video" | "animated_gif";

  url: string;
  displayUrl: string;
  expandedUrl: string;
  thumbnailUrl: string | null;

  width: number;
  height: number;
  aspectRatio: [number, number];

  sizes: {
    thumb: MediaSize;
    small: MediaSize;
    medium: MediaSize;
    large: MediaSize;
    original: MediaSize;
  };

  duration: number | null;
  bitrate: number | null;
  videoInfo: {
    variants: VideoVariant[];
    durationMillis: number;
  } | null;

  altText: string | null;
  sensitiveMedia: boolean;

  mediaAvailability: {
    status: string;
    reason: string | null;
  };

  allowDownload: boolean;
  mediaStats: {
    viewCount: number;
  } | null;

  sourceStatusId: string | null;
  sourceUserId: string | null;
}

export interface MediaSize {
  width: number;
  height: number;
  resize: "fit" | "crop";
  url?: string;
}

export interface VideoVariant {
  bitrate: number | null;
  contentType: string;
  url: string;
}

// ─── Poll ────────────────────────────────────────────────────────────────────

export interface Poll {
  id: string;
  options: PollOption[];
  endDatetime: string;
  durationMinutes: number;
  votingStatus: "open" | "closed";
  totalVotes: number;
}

export interface PollOption {
  position: number;
  label: string;
  voteCount: number;
  percentage: number;
}

// ─── Card ────────────────────────────────────────────────────────────────────

export interface Card {
  name: string;
  url: string;
  cardType: string;
  type?: string;
  bindingValues: {
    title: string;
    description: string;
    domain: string;
    thumbnailImageUrl: string | null;
    thumbnailImageColor: string | null;
    playerUrl: string | null;
    playerWidth: number | null;
    playerHeight: number | null;
    videoUrl?: string | null;
    site?: string | null;
    creatorId?: string | null;
    creatorUsername?: string | null;
    appId: string | null;
    appName: string | null;
    appStarRating: number | null;
    appPriceAmount: number | null;
    appPriceCurrency: string | null;
  };
  cardPlatform?: {
    platform: {
      device: {
        name: string;
        version: string;
      };
      audience: {
        name: string;
      };
    };
  } | null;
  vanityUrl: string | null;
  userRefsResults?: User[] | null;
  imageUrl?: string;
  videoUrl?: string;
  playerUrl?: string;
}

// ─── Place ───────────────────────────────────────────────────────────────────

export interface Place {
  id: string;
  fullName: string;
  name: string;
  country: string;
  countryCode: string;
  placeType: string;
  url: string;
}

// ─── List ────────────────────────────────────────────────────────────────────

export interface List {
  id: string;
  name: string;
  description: string;
  mode: "public" | "private";
  owner: User;
  bannerUrl: string | null;
  facepileUrls: string[];
  memberCount: number;
  subscriberCount: number;
  createdAt: string | null;
  slug: string;
  uri: string;
}

// ─── Community ───────────────────────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  description: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  rules: CommunityRule[];
  memberCount: number;
  moderatorCount: number;
  adminCount: number;
  isPrivate: boolean;
  pinnedTweetId: string | null;
  createdAt: string | null;
  isMember?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  canPost?: boolean;
}

export interface CommunityRule {
  id: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
}

export interface CommunityMember {
  user: User;
  role: "member" | "moderator" | "admin";
  joinedAt?: string;
}

export interface CommunitySearchResult {
  id: string;
  name: string;
  memberCount: number;
  topic: string | null;
  isNsfw: boolean;
  bannerUrl: string | null;
  defaultBannerUrl: string | null;
  membersFacepile: string[];
}

// ─── Space ───────────────────────────────────────────────────────────────────

export interface Space {
  id: string;
  title: string;
  state: "Running" | "Ended" | "Scheduled" | "Canceled";
  mediaKey: string;

  createdAt: number;
  scheduledStart: number | null;
  startedAt: number | null;
  endedAt: number | null;
  updatedAt: number | null;

  creator: User | null;

  totalLiveListeners: number;
  totalReplayWatched: number;

  participants: {
    admins: SpaceParticipant[];
    speakers: SpaceParticipant[];
    listeners: SpaceParticipant[];
    total: number;
  };

  isAvailableForReplay: boolean;
  topics: SpaceTopic[];

  tweetId: string | null;
}

export interface SpaceParticipant {
  periscopeUserId: string;
  twitterUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  isBlueVerified: boolean;
}

export interface SpaceTopic {
  id: string;
  name: string;
}

export interface SpaceStreamInfo {
  hlsUrl: string;
  status: string;
  streamType: string;
  shareUrl: string | null;
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "like" | "retweet" | "reply" | "mention" | "follow" | "quote" | "poll_result";
  createdAt: string;
  message: string;
  icon: string;
  fromUsers: string[];
  targetTweetId: string | null;
  targetUserId: string | null;
  seen: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  cookies: {
    auth_token: string;
    ct0: string;
    twid: string;
    kdt: string;
    __cf_bm: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
  };
  timestamp: string;
}
