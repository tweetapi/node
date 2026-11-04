import type { TweetAPI } from "../client";
import type { PaginatedResponse } from "../types/common";
import type { SearchTopResult, Tweet, User } from "../types/responses";
import type { SearchParams } from "../types/params";

/**
 * The item type of a search page for a given `type`. A `type` held in a plain `string`
 * keeps the 2.6.0 type, `Tweet | User`.
 */
export type SearchResult<T extends string> = string extends T
  ? Tweet | User
  : T extends "Latest" | "Photos" | "Videos"
    ? Tweet
    : T extends "People"
      ? User
      : T extends "Top"
        ? SearchTopResult
        : Tweet | User;

export class ExploreResource {
  constructor(private readonly client: TweetAPI) {}

  /**
   * Search for tweets, users, photos, or videos. `Latest`, `Photos` and `Videos` return
   * tweets, `People` returns users, and `Top` returns `{ type, content }` items.
   */
  async search<T extends string>(params: SearchParams & { type: T }) {
    return this.client.get<PaginatedResponse<SearchResult<T>>>("/tw-v2/search", params);
  }
}
