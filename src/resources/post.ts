import type { TweetAPI } from "../client";
import type { ActionResponse } from "../types/common";
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
}
