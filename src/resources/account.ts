import type { TweetAPI } from "../client";
import type { ApiResponse } from "../types/common";
import type { AccountUsage } from "../types/responses";

export class AccountResource {
  constructor(private readonly client: TweetAPI) {}

  /**
   * Get the units left on this API key: the plan allowance, the PAYG balance, and the
   * per-minute rate limit. Costs no units; it only counts toward the rate limit.
   */
  async getUsage() {
    return this.client.get<ApiResponse<AccountUsage>>("/tw-v2/account/usage");
  }
}
