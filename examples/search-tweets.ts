import TweetAPI from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

async function main() {
  // Search for latest tweets about Bitcoin
  const results = await client.explore.search({
    query: "bitcoin",
    type: "Latest",
  });

  console.log(`Found ${results.meta.resultCount} results in ${results.meta.completedIn}ms\n`);

  for (const item of results.data) {
    if ("text" in item && "author" in item) {
      const tweet = item as any;
      console.log(`@${tweet.author.username}: ${tweet.text.slice(0, 100)}`);
      console.log(`  ♥ ${tweet.likeCount}  🔁 ${tweet.retweetCount}  💬 ${tweet.replyCount}\n`);
    }
  }

  // Paginate if more results exist
  if (results.pagination.nextCursor) {
    console.log("More results available. Use cursor to paginate:");
    console.log(`  cursor: "${results.pagination.nextCursor}"`);
  }
}

main();
