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
const followers = await client.user.getFollowers({ userId: "USER_ID" });
const nextPage = await client.user.getFollowers({
  userId: "USER_ID",
  cursor: followers.pagination.nextCursor!,
});
```

> **Get your free API key** — [100 requests, no credit card required](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)

## Features

- **70+ endpoints** covering users, tweets, posts, interactions, DMs, communities, spaces, and search
- **Full TypeScript types** for all requests and responses — autocomplete everything
- **Automatic retry with backoff** on rate limits (429) and server errors (5xx)
- **Auto-pagination helpers** — iterate all pages with `for await...of`
- **Solid error handling** with typed exceptions (`RateLimitError`, `NotFoundError`, etc.)
- **Rate limit awareness** — `retryAfter` respected automatically, state exposed via `client.rateLimitInfo`
- **Zero dependencies** — uses native `fetch` (Node.js 18+)
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

### Profile

| Method | Description |
|--------|-------------|
| `client.profile.update({ authToken, name, bio, location, website })` | Update authenticated profile fields |
| `client.profile.avatar({ authToken, media })` | Update profile avatar from image URL or base64 data |
| `client.profile.banner({ authToken, media })` | Update profile banner from image URL or base64 data |

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
| `client.post.createPost({ authToken, text, proxy, replyOption })` | Create a tweet |
| `client.post.createPostQuote({ authToken, text, attachmentUrl, proxy, replyOption })` | Create a quote tweet |
| `client.post.createPostWithMedia({ authToken, text, media, proxy })` | Create a tweet with media |
| `client.post.replyPost({ authToken, text, tweetId, proxy })` | Reply to a tweet |
| `client.post.replyPostWithMedia({ authToken, text, tweetId, media, proxy })` | Reply with media |
| `client.post.deletePost({ authToken, tweetId })` | Delete a tweet |

```typescript
// Restrict who can reply to a new tweet
await client.post.createPost({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Shipping with TweetAPI",
  proxy: "host:port@user:pass",
  replyOption: { mode: "verified_accounts" },
});

// Reuse caller-managed Twitter media by media_id_string
await client.post.createPostWithMedia({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Direct media ID",
  media: [{ media_id: "TWITTER_MEDIA_ID" }],
  proxy: "host:port@user:pass",
});

// Or let TweetAPI upload media from URL/base64
await client.post.createPostWithMedia({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Uploaded media",
  media: [{ url: "https://example.com/image.jpg", type: "image/jpeg" }],
  proxy: "host:port@user:pass",
});
```

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
| `client.interaction.addMemberToList({ authToken, listId, userId })` | Legacy alias for adding user to list |
| `client.interaction.removeMemberFromList({ authToken, listId, userId })` | Legacy alias for removing user from list |
| `client.interaction.getNotifications({ authToken })` | Get notifications |
| `client.interaction.getUserAnalytics({ authToken })` | Get account analytics |

### List

| Method | Description |
|--------|-------------|
| `client.list.getDetails({ listId })` | Get list details |
| `client.list.getTweets({ listId })` | Get tweets in a list |
| `client.list.getMembers({ listId })` | Get list members |
| `client.list.getFollowers({ listId })` | Get list followers |
| `client.list.create({ authToken, name, description, isPrivate })` | Create a list |
| `client.list.addMember({ authToken, listId, userId })` | Add user to list |
| `client.list.removeMember({ authToken, listId, userId })` | Remove user from list |

```typescript
const list = await client.list.create({
  authToken: "TWITTER_AUTH_TOKEN",
  name: "Research",
  description: "Accounts to monitor",
  isPrivate: true,
});

await client.list.addMember({
  authToken: "TWITTER_AUTH_TOKEN",
  listId: list.data.id,
  userId: "USER_ID",
});
```

### Profile Examples

```typescript
await client.profile.update({
  authToken: "TWITTER_AUTH_TOKEN",
  name: "TweetAPI Research",
  bio: "Twitter/X data workflows",
  website: "https://tweetapi.com",
});

await client.profile.avatar({
  authToken: "TWITTER_AUTH_TOKEN",
  media: { url: "https://example.com/avatar.jpg", type: "image/jpeg" },
});

await client.profile.banner({
  authToken: "TWITTER_AUTH_TOKEN",
  media: { data: "BASE64_IMAGE_DATA", type: "image/png" },
});
```

### Community

| Method | Description |
|--------|-------------|
| `client.community.getDetails({ communityId })` | Get community details |
| `client.community.getTweets({ communityId, sortBy })` | Get community tweets |
| `client.community.getMembers({ communityId })` | Get community members |
| `client.community.search({ query })` | Search communities |
| `client.community.createPost({ authToken, text, communityId, proxy })` | Post in community |
| `client.community.createPostWithMedia({ ... })` | Post with media in community |
| `client.community.createQuote({ authToken, text, attachmentUrl, communityId, proxy })` | Quote tweet in community |
| `client.community.createQuoteWithMedia({ ... })` | Quote tweet with media in community |
| `client.community.replyPost({ ... })` | Reply to community post |
| `client.community.replyPostWithMedia({ ... })` | Reply with media in community |
| `client.community.join({ authToken, communityId })` | Join a community |
| `client.community.leave({ authToken, communityId })` | Leave a community |

```typescript
await client.community.createQuote({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Relevant for this community",
  attachmentUrl: "https://x.com/example/status/TWEET_ID",
  communityId: "COMMUNITY_ID",
  proxy: "host:port@user:pass",
});

await client.community.createQuoteWithMedia({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Community quote with media",
  attachmentUrl: "https://x.com/example/status/TWEET_ID",
  communityId: "COMMUNITY_ID",
  media: [{ media_id: "TWITTER_MEDIA_ID" }],
  proxy: "host:port@user:pass",
});
```

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
| `client.auth.login({ username, password, proxy, country })` | Log in and get auth tokens |

`country` is the ISO 3166-1 alpha-2 code for the proxy's public egress IP (for example, `"US"`). It must match the IP used for the complete login attempt. Pass `twoFactorSecret` when the account uses TOTP-based 2FA.

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

## Auto-Pagination

Use the `paginate()` and `paginatePages()` helpers to iterate through all pages automatically:

```typescript
import TweetAPI, { paginate, paginatePages } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

// Iterate individual items across all pages
for await (const user of paginate(
  (cursor) => client.user.getFollowers({ userId: "USER_ID", cursor }),
)) {
  console.log(user.username);
}

// Iterate full pages (access page-level data)
for await (const page of paginatePages(
  (cursor) => client.explore.search({ query: "bitcoin", type: "Latest", cursor }),
  { maxPages: 5 },  // optional: limit number of pages
)) {
  console.log(`Got ${page.data.length} results`);
  console.log(`Next cursor: ${page.pagination.nextCursor}`);
}
```

Works with any paginated endpoint — followers, tweets, search results, list members, community posts, etc.

## Automatic Retry with Backoff

The SDK automatically retries on transient errors with exponential backoff:

- **429 (Rate Limit)** — waits the `retryAfter` duration from the API, then retries
- **5xx (Server Error)** — retries with exponential backoff + jitter
- **Network errors** — retries on timeouts and connection failures
- **4xx (Client Error)** — never retried (400, 401, 403, 404 fail immediately)

Default: 3 retries, 2x backoff, 1s initial delay, 30s max delay.

```typescript
// Customize retry behavior
const client = new TweetAPI({
  apiKey: "YOUR_API_KEY",
  retry: {
    maxRetries: 5,           // default: 3
    initialRetryDelay: 2000, // default: 1000ms
    backoffMultiplier: 3,    // default: 2
    maxRetryDelay: 60000,    // default: 30000ms
  },
});

// Disable retries entirely
const client = new TweetAPI({
  apiKey: "YOUR_API_KEY",
  retry: false,
});
```

### Rate Limit Awareness

After a 429 response, the SDK exposes the last known rate limit state:

```typescript
console.log(client.rateLimitInfo);
// { retryAfter: 30, timestamp: 1712345678000 } — or null if no 429 encountered
```

## Error Handling

The SDK throws typed errors you can catch and handle. With automatic retries enabled (default), you'll only see these after all retry attempts are exhausted:

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
    console.log(`Rate limited. Retry in ${error.retryAfter}s`);
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
  retry: {                      // Optional (default: { maxRetries: 3 })
    maxRetries: 3,
    initialRetryDelay: 1000,
    backoffMultiplier: 2,
    maxRetryDelay: 30000,
  },
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
