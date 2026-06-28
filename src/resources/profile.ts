import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type {
  UpdateProfileAvatarParams,
  UpdateProfileBannerParams,
  UpdateProfileParams,
} from "../types/params";
import type { User } from "../types/responses";

export class ProfileResource {
  constructor(private readonly client: TweetAPI) {}

  /** Update authenticated profile fields */
  async update(params: UpdateProfileParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/update", params);
  }

  /** Update the authenticated profile avatar */
  async avatar(params: UpdateProfileAvatarParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/avatar", params);
  }

  /** Update the authenticated profile banner */
  async banner(params: UpdateProfileBannerParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/banner", params);
  }
}
