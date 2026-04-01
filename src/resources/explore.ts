import type { TweetAPI } from "../client";
import type { PaginatedResponse } from "../types/common";
import type { Tweet, User } from "../types/responses";
import type { SearchParams } from "../types/params";

export class ExploreResource {
  constructor(private readonly client: TweetAPI) {}

  /** Search for tweets, users, photos, or videos */
  async search(params: SearchParams) {
    return this.client.get<PaginatedResponse<Tweet | User>>("/tw-v2/search", params);
  }
}
