import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type { LoginResponse } from "../types/responses";
import type { LoginParams } from "../types/params";

export class AuthResource {
  constructor(private readonly client: TweetAPI) {}

  /** Log in to a Twitter account and get auth tokens */
  async login(params: LoginParams) {
    return this.client.post_<ApiResponse<LoginResponse>>(
      "/tw-v2/auth/login",
      params,
    );
  }
}
