import type { TweetAPI } from "../client";
import type { ActionResponse } from "../types/common";
import type {
  CreatePostParams,
  CreatePostQuoteParams,
  CreatePostWithMediaParams,
  ReplyPostParams,
  ReplyPostWithMediaParams,
  DeletePostParams,
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
}
