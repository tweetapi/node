import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type { Tweet, TweetTranslation } from "../types/responses";
import type {
  GetTweetDetailsParams,
  GetTweetDetailsByIdsParams,
  GetRetweetsParams,
  GetQuotesParams,
  TranslateTweetParams,
} from "../types/params";

export class TweetResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get tweet details and conversation thread */
  async getDetailsAndConversation(params: GetTweetDetailsParams) {
    return this.client.get<
      ApiResponse<{
        tweet: Tweet | null;
        replies: Tweet[];
        nextCursor?: string;
      }>
    >("/tw-v2/tweet/details", params);
  }

  /** Get details for multiple tweets by IDs (comma-separated, max 200) */
  async getDetailsByIds(params: GetTweetDetailsByIdsParams) {
    return this.client.get<ApiResponse<{ tweets: Tweet[] }>>(
      "/tw-v2/tweet/details-by-ids",
      params,
    );
  }

  /** Get users who retweeted a tweet */
  async getRetweets(params: GetRetweetsParams) {
    return this.client.get<
      ApiResponse<{
        users: Record<string, unknown>[];
        nextCursor?: string;
      }>
    >("/tw-v2/tweet/retweets", params);
  }

  /** Get quote tweets for a tweet */
  async getQuotes(params: GetQuotesParams) {
    return this.client.get<
      ApiResponse<{
        tweets: Tweet[];
        nextCursor?: string;
      }>
    >("/tw-v2/tweet/quotes", params);
  }

  /** Translate a tweet to a different language */
  async translate(params: TranslateTweetParams) {
    return this.client.post_<ApiResponse<TweetTranslation>>(
      "/tw-v2/tweet/translate",
      params,
    );
  }
}
