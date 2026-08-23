import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type {
  RemoveProfileBannerParams,
  UpdateProfileAvatarParams,
  UpdateProfileBannerParams,
  UpdateProfileParams,
  UpdateProfilePrivacyParams,
  UpdateProfileUsernameParams,
} from "../types/params";
import type { ProfilePrivacy, ProfileUsername, User } from "../types/responses";

export class ProfileResource {
  constructor(private readonly client: TweetAPI) {}

  /** Update authenticated profile fields */
  async update(params: UpdateProfileParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/update", params);
  }

  /** Change the authenticated account username */
  async updateUsername(params: UpdateProfileUsernameParams) {
    return this.client.post_<ApiResponse<ProfileUsername>>(
      "/tw-v2/profile/username",
      params,
      { retry: false },
    );
  }

  /** Update the authenticated profile avatar */
  async avatar(params: UpdateProfileAvatarParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/avatar", params);
  }

  /** Update the authenticated profile banner */
  async banner(params: UpdateProfileBannerParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/banner", params);
  }

  /** Remove the authenticated profile banner */
  async removeBanner(params: RemoveProfileBannerParams) {
    return this.client.post_<ApiResponse<User>>("/tw-v2/profile/remove-banner", params);
  }

  /** Change the authenticated account between public and private */
  async setPrivacy(params: UpdateProfilePrivacyParams) {
    return this.client.post_<ApiResponse<ProfilePrivacy>>("/tw-v2/profile/privacy", params);
  }
}
