import type { TweetAPI } from "../client";
import type { ActionResponse, ApiResponse } from "../types/common";
import type { MediaStatus, UploadedMedia } from "../types/responses";
import type {
  CreatePostParams,
  CreatePostQuoteParams,
  CreatePostWithMediaParams,
  ReplyPostParams,
  ReplyPostWithMediaParams,
  DeletePostParams,
  PinPostParams,
  UnpinPostParams,
  HideReplyParams,
  UnhideReplyParams,
  UploadMediaParams,
  GetMediaStatusParams,
} from "../types/params";

export class PostResource {
  constructor(private readonly client: TweetAPI) {}

  /** Create a new tweet */
  async createPost(params: CreatePostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-post",
      params,
    );
  }

  /** Create a quote tweet */
  async createPostQuote(params: CreatePostQuoteParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-post-quote",
      params,
    );
  }

  /** Create a tweet with media attachments */
  async createPostWithMedia(params: CreatePostWithMediaParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/create-post-with-media",
      params,
      { media: true },
    );
  }

  /** Reply to a tweet */
  async replyPost(params: ReplyPostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/reply-post",
      params,
    );
  }

  /** Reply to a tweet with media attachments */
  async replyPostWithMedia(params: ReplyPostWithMediaParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/reply-post-with-media",
      params,
      { media: true },
    );
  }

  /** Delete a tweet */
  async deletePost(params: DeletePostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/delete-post",
      params,
    );
  }

  /**
   * Pin one of your tweets to the top of your profile. `metadata.added_to_highlights`
   * says whether X also added it to your Highlights.
   */
  async pinPost(params: PinPostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/pin-post",
      params,
    );
  }

  /** Unpin a tweet from your profile */
  async unpinPost(params: UnpinPostParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unpin-post",
      params,
    );
  }

  /** Hide a reply to one of your tweets. `tweetId` is the reply. */
  async hideReply(params: HideReplyParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/hide-reply",
      params,
    );
  }

  /** Show a hidden reply to one of your tweets again */
  async unhideReply(params: UnhideReplyParams) {
    return this.client.post_<ActionResponse>(
      "/tw-v2/interaction/unhide-reply",
      params,
    );
  }

  /**
   * Upload one photo, GIF or video for a later post. Pass `mediaId` as `media_id` in the
   * `media` array of a with-media method, such as `createPostWithMedia`, with the same
   * `authToken`. If `state` is `pending` or `in_progress`, call `getMediaStatus` after
   * `checkAfterSecs` seconds. X discards an unused upload after `expiresAfterSecs`.
   */
  async uploadMedia(params: UploadMediaParams) {
    return this.client.post_<ApiResponse<UploadedMedia>>(
      "/tw-v2/interaction/upload-media",
      params,
      { media: true },
    );
  }

  /** Check whether an uploaded video or GIF is ready to post. Each check costs one unit. */
  async getMediaStatus(params: GetMediaStatusParams) {
    return this.client.get<ApiResponse<MediaStatus>>(
      "/tw-v2/interaction/media-status",
      params,
    );
  }
}
