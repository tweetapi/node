import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type { TrendLocation, TrendsByPlace } from "../types/responses";
import type { GetTrendsParams } from "../types/params";

export class TrendsResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get trending topics by `country` or `woeid`, or worldwide when both are omitted */
  async get(params?: GetTrendsParams) {
    return this.client.get<ApiResponse<TrendsByPlace>>("/tw-v2/trends", params);
  }

  /** List the locations X serves trends for, with the WOEID to pass to `get` */
  async getLocations() {
    return this.client.get<ApiResponse<TrendLocation[]>>("/tw-v2/trends/locations");
  }
}
