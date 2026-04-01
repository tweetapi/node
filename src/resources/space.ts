import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type { Space, SpaceStreamInfo } from "../types/responses";
import type { GetSpaceByIdParams, GetSpaceStreamUrlParams } from "../types/params";

export class SpaceResource {
  constructor(private readonly client: TweetAPI) {}

  /** Get Space details by ID */
  async getById(params: GetSpaceByIdParams) {
    return this.client.get<ApiResponse<Space>>("/tw-v2/space/by-id", params);
  }

  /** Get the HLS stream URL for a Space */
  async getStreamUrl(params: GetSpaceStreamUrlParams) {
    return this.client.get<ApiResponse<SpaceStreamInfo>>(
      "/tw-v2/space/stream-url",
      params,
    );
  }
}
