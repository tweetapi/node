import TweetAPI, { AuthenticationError, TweetAPIError } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

async function main() {
  try {
    // First, log in to get an auth token
    const loginResult = await client.auth.login({
      username: "your_twitter_username",
      password: "your_twitter_password",
      proxy: "hostname:port@username:password",
      country: "US",
    });

    const authToken = loginResult.data.cookies.auth_token;
    console.log(`Logged in as @${loginResult.data.user.username}`);

    // Create a tweet
    const post = await client.post.createPost({
      authToken,
      text: "Hello from TweetAPI! 🚀",
      proxy: "hostname:port@username:password",
    });

    console.log(`Tweet created: ${post.data.metadata?.tweet_id}`);
    console.log(`URL: ${post.data.metadata?.url}`);

    // Like the tweet we just created
    await client.interaction.favoritePost({
      authToken,
      tweetId: post.data.id,
      proxy: "hostname:port@username:password",
    });
    console.log("Liked the tweet!");

    // Retweet it
    await client.interaction.retweet({
      authToken,
      tweetId: post.data.id,
      proxy: "hostname:port@username:password",
    });
    console.log("Retweeted!");
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error("Authentication failed. Check your credentials.");
    } else if (error instanceof TweetAPIError) {
      console.error(`API error [${error.code}]: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main();
