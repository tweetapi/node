import TweetAPI, { TweetAPIError } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

async function main() {
  try {
    // Costs no units; it only counts toward the per-minute rate limit
    const { data } = await client.account.getUsage();
    console.log(`Units available: ${data.availableUnits.toLocaleString()}`);

    if (data.plan) {
      console.log(
        `Plan: ${data.plan.usedUnits.toLocaleString()} of ${data.plan.requestLimit.toLocaleString()} used` +
          (data.plan.periodEnd ? `, resets ${data.plan.periodEnd}` : ""),
      );
    }
    if (data.payg) {
      console.log(
        `PAYG: ${data.payg.availableUnits.toLocaleString()} units` +
          (data.payg.expiresAt ? `, expire ${data.payg.expiresAt}` : ""),
      );
    }
    console.log(`Rate limit: ${data.rateLimit.requestsPerMinute} requests per minute`);
  } catch (error) {
    if (error instanceof TweetAPIError) {
      console.error(`API error [${error.code}]: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main();
