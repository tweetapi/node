import TweetAPI, { NotFoundError, RateLimitError, TweetAPIError } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

async function main() {
  try {
    // Get a single user by username
    const user = await client.user.getByUsername({ username: "elonmusk" });
    console.log(`${user.data.name} (@${user.data.username})`);
    console.log(`Followers: ${user.data.followerCount.toLocaleString()}`);
    console.log(`Tweets: ${user.data.tweetCount.toLocaleString()}`);
    console.log(`Verified: ${user.data.isBlueVerified}`);

    // Get first page of followers
    const followers = await client.user.getFollowers({ userId: user.data.id });
    console.log(`\nFirst ${followers.data.length} followers:`);
    for (const follower of followers.data.slice(0, 5)) {
      console.log(`  - @${follower.username} (${follower.followerCount} followers)`);
    }

    // Paginate to next page
    if (followers.pagination.nextCursor) {
      const nextPage = await client.user.getFollowers({
        userId: user.data.id,
        cursor: followers.pagination.nextCursor,
      });
      console.log(`\nNext page: ${nextPage.data.length} more followers`);
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("User not found");
    } else if (error instanceof RateLimitError) {
      console.error(`Rate limited. Retry in ${error.retryAfter} seconds`);
    } else if (error instanceof TweetAPIError) {
      console.error(`API error [${error.code}]: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main();
