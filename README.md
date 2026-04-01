# TweetAPI Node.js SDK

Official Node.js/TypeScript SDK for [TweetAPI](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk) — the Twitter/X Data API for developers and researchers.

Access tweets, user profiles, followers, analytics, and full interaction capabilities. 70+ typed endpoints with built-in error handling.

## Install

```bash
npm install tweetapi-node
```

## Quick Start

```typescript
import TweetAPI from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

// Get a user profile
const user = await client.user.getByUsername({ username: "elonmusk" });
console.log(user.data.followerCount); // 180000000

// Search tweets
const results = await client.explore.search({ query: "bitcoin", type: "Latest" });

// Get followers with pagination
const followers = await client.user.getFollowers({ userId: "123456" });
const nextPage = await client.user.getFollowers({
  userId: "123456",
  cursor: followers.pagination.nextCursor!,
});
```

> **Get your free API key** — [100 requests, no credit card required](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)

## Features

- **70+ endpoints** covering users, tweets, posts, interactions, DMs, communities, spaces, and search
- **Full TypeScript types** for all requests and responses — autocomplete everything
- **Solid error handling** with typed exceptions (`RateLimitError`, `NotFoundError`, etc.)
- **Zero dependencies** — uses native `fetch` (Node.js 18+)
- **Pagination support** with cursor-based navigation
- **ESM and CommonJS** dual build

## API Reference

### User

| Method | Description |
|--------|-------------|
| `client.user.getByUsername({ username })` | Get user profile by username |
| `client.user.getByUsernames({ usernames })` | Get multiple users by usernames (comma-separated) |
| `client.user.getByUserId({ userId })` | Get user profile by ID |
| `client.user.getByUserIds({ userIds })` | Get multiple users by IDs (comma-separated) |
| `client.user.getTweets({ userId })` | Get a user's tweets |
| `client.user.getTweetsAndReplies({ userId })` | Get a user's tweets and replies |
| `client.user.getFollowing({ userId })` | Get who a user follows |
| `client.user.getFollowers({ userId })` | Get a user's followers |
| `client.user.getVerifiedFollowers({ userId })` | Get verified followers |
| `client.user.getSubscriptions({ userId })` | Get user's subscriptions |
| `client.user.getFollowingV1({ userId })` | Get following (v1, supports count) |
| `client.user.getFollowersV1({ userId })` | Get followers (v1, supports count) |
| `client.user.getFollowingIds({ userId })` | Get following user IDs |
| `client.user.getFollowersIds({ userId })` | Get follower user IDs |
| `client.user.checkFollow({ subjectId, targetId })` | Check follow relationship |
| `client.user.aboutAccount({ username })` | Get account transparency info |

### Tweet

| Method | Description |
|--------|-------------|
| `client.tweet.getDetailsAndConversation({ tweetId })` | Get tweet details and replies |
| `client.tweet.getDetailsByIds({ ids })` | Get multiple tweets by IDs (max 200) |
| `client.tweet.getRetweets({ tweetId })` | Get who retweeted a tweet |
| `client.tweet.getQuotes({ tweetId })` | Get quote tweets |
| `client.tweet.translate({ tweetId, dstLang })` | Translate a tweet |

### Post

| Method | Description |
|--------|-------------|
| `client.post.createPost({ authToken, text, proxy })` | Create a tweet |
| `client.post.createPostQuote({ authToken, text, attachmentUrl, proxy })` | Create a quote tweet |
| `client.post.createPostWithMedia({ authToken, text, media, proxy })` | Create a tweet with media |
| `client.post.replyPost({ authToken, text, tweetId, proxy })` | Reply to a tweet |
| `client.post.replyPostWithMedia({ authToken, text, tweetId, media, proxy })` | Reply with media |
| `client.post.deletePost({ authToken, tweetId })` | Delete a tweet |

### Interaction

| Method | Description |
|--------|-------------|
| `client.interaction.favoritePost({ authToken, tweetId })` | Like a tweet |
| `client.interaction.unfavoritePost({ authToken, tweetId })` | Unlike a tweet |
| `client.interaction.retweet({ authToken, tweetId })` | Retweet |
| `client.interaction.deleteRetweet({ authToken, tweetId })` | Remove retweet |
| `client.interaction.bookmark({ authToken, tweetId })` | Bookmark a tweet |
| `client.interaction.deleteBookmark({ authToken, tweetId })` | Remove bookmark |
| `client.interaction.follow({ authToken, userId })` | Follow a user |
| `client.interaction.unfollow({ authToken, userId })` | Unfollow a user |
| `client.interaction.addMemberToList({ authToken, listId, userId })` | Add user to list |
| `client.interaction.removeMemberFromList({ authToken, listId, userId })` | Remove user from list |
| `client.interaction.getNotifications({ authToken })` | Get notifications |
| `client.interaction.getUserAnalytics({ authToken })` | Get account analytics |

### List

| Method | Description |
|--------|-------------|
| `client.list.getDetails({ listId })` | Get list details |
| `client.list.getTweets({ listId })` | Get tweets in a list |
| `client.list.getMembers({ listId })` | Get list members |
| `client.list.getFollowers({ listId })` | Get list followers |

### Community

| Method | Description |
|--------|-------------|
| `client.community.getDetails({ communityId })` | Get community details |
| `client.community.getTweets({ communityId, sortBy })` | Get community tweets |
| `client.community.getMembers({ communityId })` | Get community members |
| `client.community.search({ query })` | Search communities |
| `client.community.createPost({ authToken, text, communityId, proxy })` | Post in community |
| `client.community.createPostWithMedia({ ... })` | Post with media in community |
| `client.community.replyPost({ ... })` | Reply to community post |
| `client.community.replyPostWithMedia({ ... })` | Reply with media in community |
| `client.community.join({ authToken, communityId })` | Join a community |
| `client.community.leave({ authToken, communityId })` | Leave a community |

### Space

| Method | Description |
|--------|-------------|
| `client.space.getById({ spaceId })` | Get Space details |
| `client.space.getStreamUrl({ mediaKey })` | Get Space HLS stream URL |

### Explore

| Method | Description |
|--------|-------------|
| `client.explore.search({ query, type })` | Search tweets/users/photos/videos |

### Auth

| Method | Description |
|--------|-------------|
| `client.auth.login({ username, password, proxy })` | Log in and get auth tokens |

### X Chat (Encrypted DMs)

| Method | Description |
|--------|-------------|
| `client.xchat.setup({ authToken, userId, pin })` | Initialize encrypted DMs |
| `client.xchat.getConversations({ authToken })` | List encrypted conversations |
| `client.xchat.send({ authToken, recipientId, message })` | Send encrypted message |
| `client.xchat.getHistory({ authToken, conversationId })` | Get conversation history |
| `client.xchat.canDm({ authToken, userIds })` | Check DM availability |

### Unencrypted DMs

| Method | Description |
|--------|-------------|
| `client.dm.sendDm({ authToken, conversationId, text, proxy })` | Send a DM |
| `client.dm.getDmPermissions({ authToken, recipientIds })` | Check DM permissions |
| `client.dm.getInboxInitialState({ authToken })` | Get inbox state |
| `client.dm.getInboxTrusted({ authToken, cursor })` | Get trusted inbox |
| `client.dm.getInboxUntrusted({ authToken, cursor })` | Get message requests |
| `client.dm.getConversation({ authToken, conversationId })` | Get conversation messages |
| `client.dm.getDmUserUpdates({ authToken, cursor })` | Get DM user updates |
| `client.dm.acceptConversation({ authToken, conversationId })` | Accept a conversation |

## Error Handling

The SDK throws typed errors you can catch and handle:

```typescript
import TweetAPI, {
  TweetAPIError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  ServerError,
  ConnectionError,
} from "tweetapi-node";

try {
  const user = await client.user.getByUsername({ username: "elonmusk" });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    console.log(`Rate limited. Retry in ${error.retryAfter}s`);
    await new Promise((r) => setTimeout(r, error.retryAfter * 1000));
  } else if (error instanceof NotFoundError) {
    console.log("User not found");
  } else if (error instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (error instanceof ValidationError) {
    console.log(`Bad request: ${error.message}`);
  } else if (error instanceof ServerError) {
    console.log("API is having issues, try again later");
  } else if (error instanceof ConnectionError) {
    console.log("Network error — check your connection");
  } else if (error instanceof TweetAPIError) {
    // Catch-all for any other API error
    console.log(`Error [${error.code}]: ${error.message}`);
  }
}
```

Every error includes:
- `code` — API error code (e.g., `"ACCOUNT_SUSPENDED"`, `"RATE_LIMIT"`)
- `statusCode` — HTTP status code
- `message` — Human-readable error message
- `details` — Additional context (field, reason, retryAfter, etc.)

## Configuration

```typescript
const client = new TweetAPI({
  apiKey: "YOUR_API_KEY",       // Required
  baseUrl: "https://...",       // Optional (default: https://api.tweetapi.com)
  timeout: 30000,               // Optional (default: 30000ms)
});
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5+ (for type definitions)

## Links

- [Full Documentation](https://tweetapi.com/docs?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Get API Key (Free)](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Dashboard](https://tweetapi.com/dashboard?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Python SDK](https://github.com/tweetapi/python)

## License

MIT

---

*TweetAPI is a third-party service and is not affiliated with X Corp.*
