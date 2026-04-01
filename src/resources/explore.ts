import type { TweetAPI } from "../client";
import type { SearchResponse } from "../types/common";
import type { Tweet, User } from "../types/responses";
import type { SearchParams } from "../types/params";

export class ExploreResource {
  constructor(private readonly client: TweetAPI) {}

  /** Search for tweets, users, photos, or videos */
  async search(params: SearchParams) {
    return this.client.get<SearchResponse<Tweet | User>>("/tw-v2/search", params);
  }
}
