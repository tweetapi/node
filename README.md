# TweetAPI Node.js SDK

`tweetapi-node` is the Node.js and TypeScript SDK for [TweetAPI](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk). It includes typed methods for profiles, tweets, lists, communities, Spaces, trends, direct messages, search, and authenticated account actions.

## Install

```bash
npm install tweetapi-node
```

## Quick start

```typescript
import TweetAPI from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

// Get a user profile
const user = await client.user.getByUsername({ username: "elonmusk" });
console.log(user.data.followerCount);

// Search tweets
const results = await client.explore.search({ query: "bitcoin", type: "Latest" });

// Get followers with pagination
const followers = await client.user.getFollowers({ userId: "USER_ID" });
const nextPage = await client.user.getFollowers({
  userId: "USER_ID",
  cursor: followers.pagination.nextCursor!,
});
```

[Create an API key](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk) with 100 included requests. No credit card is required.

## SDK behavior

- TypeScript types cover request parameters, response models, pagination, and errors.
- `paginate()` and `paginatePages()` are async generators. The optional `maxPages` setting limits how many pages they request.
- Reads retry up to three times by default after a 429 response, a 5xx response, or a network error. Writes retry only when the API confirms the request never reached X, so an action is never sent twice. Retry settings are configurable.
- Errors that a retry cannot fix fail at once: a failing `proxy` or a used-up or expired plan.
- `client.profile.updateUsername()` is not automatically retried because username changes are not safe to replay.
- `client.interaction.acceptFollowRequest()` and `denyFollowRequest()` are never automatically retried. Follow-request reads keep the configured retry behavior.
- `RateLimitError.retryAfter` and `client.rateLimitInfo` expose the API's `Retry-After` from the last 429 response.
- Calls that upload a file wait up to `mediaTimeout` (120 seconds by default) instead of `timeout`, because the API can wait for X to process the file before it answers.
- Error classes distinguish validation, authentication, permission, not-found, rate-limit, server, and connection failures.
- The client has no runtime dependencies and uses native `fetch` on Node.js 18 or newer.
- The package provides ESM, CommonJS, and TypeScript declaration builds.

## API reference

### User

| Method | Description |
|--------|-------------|
| `client.user.getByUsername({ username })` | Get user profile by username |
| `client.user.getByUsernames({ usernames })` | Get up to 100 users by usernames (comma-separated) |
| `client.user.getByUserId({ userId })` | Get user profile by ID |
| `client.user.getByUserIds({ userIds })` | Get up to 100 users by IDs |
| `client.user.getTweets({ userId })` | Get a user's tweets |
| `client.user.getTweetsAndReplies({ userId, sortBy })` | Get a user's tweets and replies |
| `client.user.getPosts({ userId, sortBy })` | Get a user's own posts, with no reposts and no replies to others (Posts tab) |
| `client.user.getReplies({ userId })` | Get a user's replies and the posts they answer (Replies tab) |
| `client.user.getReposts({ userId })` | Get the posts a user has reposted (Reposts tab) |
| `client.user.getPhotos({ userId })` | Get a user's posts with photos (Photos tab) |
| `client.user.getVideos({ userId })` | Get a user's posts with videos (Videos tab) |
| `client.user.getHighlights({ userId, sortBy })` | Get the posts on a user's Highlights tab |
| `client.user.getArticles({ userId })` | Get the posts that published a user's X Articles |
| `client.user.getFollowing({ userId })` | Get who a user follows |
| `client.user.getFollowers({ userId })` | Get a user's followers |
| `client.user.getVerifiedFollowers({ userId })` | Get verified followers |
| `client.user.getSubscriptions({ userId })` | Get user's subscriptions |
| `client.user.getAffiliates({ userId })` | Get the accounts affiliated with a business profile |
| `client.user.getSimilarAccounts({ userId })` | Get the accounts X lists as similar (one page, no cursor) |
| `client.user.getLists({ userId })` | Get the Lists on a user's Lists tab |
| `client.user.getListMemberships({ userId })` | Get the Lists a user has been added to |
| `client.user.getFollowingV1({ userId })` | Get following (v1, supports count) |
| `client.user.getFollowersV1({ userId })` | Get followers (v1, supports count) |
| `client.user.getFollowingIds({ userId })` | Get following user IDs |
| `client.user.getFollowersIds({ userId })` | Get follower user IDs |
| `client.user.checkFollow({ subjectId, targetId })` | Check follow relationship |
| `client.user.aboutAccount({ username })` | Get account transparency info |

`getPosts`, `getTweetsAndReplies` and `getHighlights` take an optional `sortBy`: `"Recent"` (the default) or `"MostLiked"`, which is X's "Sort by: Most liked" order. The SDK sends `sortBy` only when you set it. Keep the same `sortBy` on every page of one listing. Its type is exported as `UserTimelineSortBy`.

```typescript
import TweetAPI, { paginate } from "tweetapi-node";
import type { UserTimelineSortBy } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });
const sortBy: UserTimelineSortBy = "MostLiked";

for await (const post of paginate(
  (cursor) => client.user.getPosts({ userId: "USER_ID", sortBy, cursor }),
  { maxPages: 3 },
)) {
  console.log(post.likeCount, post.text);
}
```

In `getPosts`, a thread the user wrote comes back as its first post followed by the user's replies in it. In `getReplies`, each of the user's replies comes after the posts it answers, so use each post's `author` and `replyTo` to tell them apart. A reply can come without the post it answers, and its `replyTo.tweetId` still names that post. In `getReposts`, each item has `type: "retweet"`, the user as `author`, and the original post in `retweetedTweet`.

A short page does not mean the listing has ended. Keep passing `nextCursor` until it is `null`, which `paginate()` does for you.

### Profile

| Method | Description |
|--------|-------------|
| `client.profile.update({ authToken, name, bio, location, website })` | Update authenticated profile fields |
| `client.profile.updateUsername({ authToken, password, username })` | Change the authenticated account username |
| `client.profile.avatar({ authToken, media })` | Update profile avatar from image URL or base64 data |
| `client.profile.banner({ authToken, media })` | Update profile banner from image URL or base64 data |
| `client.profile.removeBanner({ authToken })` | Remove the profile banner |
| `client.profile.setPrivacy({ authToken, isPrivate })` | Make the account public or private |

### Tweet

| Method | Description |
|--------|-------------|
| `client.tweet.getDetailsAndConversation({ tweetId })` | Get tweet details, parent tweets (`ancestors`), and replies |
| `client.tweet.getDetailsByIds({ ids })` | Get multiple tweets by IDs (max 200) |
| `client.tweet.getRetweets({ tweetId })` | Get who retweeted a tweet |
| `client.tweet.getQuotes({ tweetId })` | Get quote tweets |
| `client.tweet.getHiddenReplies({ tweetId })` | Get the replies its author has hidden |
| `client.tweet.translate({ tweetId, dstLang })` | Translate a tweet |

### Post

| Method | Description |
|--------|-------------|
| `client.post.createPost({ authToken, text, proxy, replyOption, poll })` | Create a tweet, optionally with a poll |
| `client.post.createPostQuote({ authToken, text, attachmentUrl, proxy, replyOption })` | Create a quote tweet |
| `client.post.createPostWithMedia({ authToken, text, media, proxy })` | Create a tweet with media |
| `client.post.replyPost({ authToken, text, tweetId, proxy })` | Reply to a tweet |
| `client.post.replyPostWithMedia({ authToken, text, tweetId, media, proxy })` | Reply with media |
| `client.post.deletePost({ authToken, tweetId })` | Delete a tweet |
| `client.post.pinPost({ authToken, tweetId })` | Pin one of your tweets to your profile |
| `client.post.unpinPost({ authToken, tweetId })` | Unpin a tweet from your profile |
| `client.post.hideReply({ authToken, tweetId })` | Hide a reply to one of your tweets |
| `client.post.unhideReply({ authToken, tweetId })` | Show a hidden reply again |
| `client.post.uploadMedia({ authToken, proxy, media })` | Upload a photo, GIF or video for a later post |
| `client.post.getMediaStatus({ authToken, proxy, mediaId })` | Check whether an uploaded video or GIF is ready |

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

#### Polls

Pass `poll` to `createPost` with 2 to 4 choices of up to 25 characters, open for 5 to 10080 minutes (7 days). A post with a poll is limited to 280 characters, and `poll` can't be combined with `disableLinkPreview`.

```typescript
await client.post.createPost({
  authToken: "TWITTER_AUTH_TOKEN",
  text: "Which option do you prefer?",
  proxy: "host:port@user:pass",
  poll: { choices: ["Option A", "Option B"], durationMinutes: 1440 },
});

// choice is 1 to 4, in the order x.com shows the options
await client.interaction.votePoll({
  authToken: "TWITTER_AUTH_TOKEN",
  tweetId: "TWEET_ID",
  choice: 2,
});
```

#### Upload media for a later post

`post.uploadMedia()` uploads one photo, GIF or video and returns its `mediaId`. The API waits up to 30 seconds for X to process the file. If `state` is still `pending` or `in_progress`, call `post.getMediaStatus()` after `checkAfterSecs` seconds until it is `succeeded`. Each status check costs one unit. Then pass `mediaId` as `media_id` in the `media` array of a with-media method, using the same `authToken`. X discards an unused upload after `expiresAfterSecs`.

```typescript
const authToken = "TWITTER_AUTH_TOKEN";
const proxy = "host:port@user:pass";

const upload = await client.post.uploadMedia({
  authToken,
  proxy,
  media: { url: "https://example.com/video.mp4" },
});
const { mediaId } = upload.data;

let { state, checkAfterSecs } = upload.data;
while (state === "pending" || state === "in_progress") {
  await new Promise((resolve) => setTimeout(resolve, (checkAfterSecs ?? 5) * 1000));
  const status = await client.post.getMediaStatus({ authToken, proxy, mediaId });
  ({ state, checkAfterSecs } = status.data);
}

if (state === "succeeded") {
  await client.post.createPostWithMedia({
    authToken,
    proxy,
    text: "Posted with an uploaded video",
    media: [{ media_id: mediaId }],
  });
}
```

When X can't process the file, `getMediaStatus()` still answers 200 with `state: "failed"`, and `error` holds X's reason. See [`examples/upload-media.ts`](examples/upload-media.ts) for a complete script.

### Interaction

| Method | Description |
|--------|-------------|
| `client.interaction.favoritePost({ authToken, tweetId })` | Like a tweet |
| `client.interaction.unfavoritePost({ authToken, tweetId })` | Unlike a tweet |
| `client.interaction.retweet({ authToken, tweetId })` | Retweet |
| `client.interaction.deleteRetweet({ authToken, tweetId })` | Remove retweet |
| `client.interaction.bookmark({ authToken, tweetId })` | Bookmark a tweet |
| `client.interaction.deleteBookmark({ authToken, tweetId })` | Remove bookmark |
| `client.interaction.follow({ authToken, userId, username })` | Follow a user. `username` is optional |
| `client.interaction.unfollow({ authToken, userId, username })` | Unfollow a user. `username` is optional |
| `client.interaction.block({ authToken, userId, username })` | Block a user. `username` is optional |
| `client.interaction.unblock({ authToken, userId, username })` | Unblock a user. `username` is optional |
| `client.interaction.mute({ authToken, userId, username })` | Mute a user. `username` is optional |
| `client.interaction.unmute({ authToken, userId, username })` | Unmute a user. `username` is optional |
| `client.interaction.removeFollower({ authToken, userId, username })` | Make a user stop following you. `username` is optional |
| `client.interaction.votePoll({ authToken, tweetId, choice })` | Vote in a poll. `choice` is 1 to 4 |
| `client.interaction.getBookmarks({ authToken })` | Get your bookmarks |
| `client.interaction.getLikes({ authToken, userId })` | Get your likes. `userId` is the ID of the `authToken` account |
| `client.interaction.getBlockedAccounts({ authToken })` | Get the accounts you block |
| `client.interaction.getMutedAccounts({ authToken })` | Get the accounts you mute |
| `client.interaction.getFollowRequests({ authToken, cursor?, count?, proxy? })` | List incoming follow-request IDs |
| `client.interaction.acceptFollowRequest({ authToken, userId, proxy? })` | Accept one incoming follow request |
| `client.interaction.denyFollowRequest({ authToken, userId, proxy? })` | Deny one incoming follow request |
| `client.interaction.addMemberToList({ authToken, listId, userId })` | Legacy alias for adding user to list |
| `client.interaction.removeMemberFromList({ authToken, listId, userId })` | Legacy alias for removing user from list |
| `client.interaction.getNotifications({ authToken })` | Get notifications |
| `client.interaction.getUserAnalytics({ authToken })` | Get account analytics |

The supplied `authToken` determines whose incoming requests you manage. All three methods accept an optional `proxy` in the existing `host:port@user:pass` format. Listing defaults to cursor `"-1"` and count `100`; `count` must be an integer from 1 to 100. The response is a `PaginatedResponse<string>` with precise digit-string IDs, no profiles or total count, and `null` terminal cursors. An empty list is a successful response.

List requests, then select one requester to review:

```typescript
const authToken = "TWITTER_AUTH_TOKEN";
const page = await client.interaction.getFollowRequests({ authToken, count: 20 });
console.log(page.data); // Requester IDs; keep these as strings.

// Fetch another page only when one exists.
if (page.pagination.nextCursor !== null) {
  const nextPage = await client.interaction.getFollowRequests({
    authToken,
    count: 20,
    cursor: page.pagination.nextCursor,
  });
  console.log(nextPage.data);
}
```

After reviewing the list, choose either acceptance or denial for one digit-only `userId`. Replace `"REQUESTER_USER_ID"` with the selected ID; do not convert it to a number.

```typescript
const result = await client.interaction.acceptFollowRequest({
  authToken: "TWITTER_AUTH_TOKEN",
  userId: "REQUESTER_USER_ID",
});
console.log(result.data.action); // "accept_follow_request"
console.log(result.data.metadata?.user_id);
```

To deny the selected request instead:

```typescript
await client.interaction.denyFollowRequest({
  authToken: "TWITTER_AUTH_TOKEN",
  userId: "REQUESTER_USER_ID",
});
```

Both mutations return `ActionResponse`, with `data.id` and `data.metadata.user_id` equal to the supplied ID, a timestamp, `success: true`, and action `"accept_follow_request"` or `"deny_follow_request"`. Neither operation has an idempotency guarantee. A timeout or connection failure leaves the outcome uncertain: inspect the pending requests and account state to reconcile the result before considering a manual retry. Do not automatically replay these mutations after an error.

### List

| Method | Description |
|--------|-------------|
| `client.list.getDetails({ listId })` | Get list details |
| `client.list.getTweets({ listId })` | Get tweets in a list |
| `client.list.getMembers({ listId })` | Get list members |
| `client.list.getFollowers({ listId })` | Get list followers |
| `client.list.search({ query })` | Search Lists by keyword |
| `client.list.create({ authToken, name, description, isPrivate })` | Create a list |
| `client.list.delete({ authToken, listId })` | Delete a list you own. This cannot be undone |
| `client.list.addMember({ authToken, listId, userId })` | Add user to list |
| `client.list.removeMember({ authToken, listId, userId })` | Remove user from list |

`create`, `delete`, `addMember` and `removeMember` accept an optional `proxy` in `host:port@user:pass` format.

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

### Profile examples

```typescript
await client.profile.update({
  authToken: "TWITTER_AUTH_TOKEN",
  name: "TweetAPI Research",
  bio: "Twitter/X data workflows",
  website: "https://tweetapi.com",
});

await client.profile.updateUsername({
  authToken: "TWITTER_AUTH_TOKEN",
  password: "TWITTER_PASSWORD",
  username: "NEW_USERNAME",
});

await client.profile.avatar({
  authToken: "TWITTER_AUTH_TOKEN",
  media: { url: "https://example.com/avatar.jpg", type: "image/jpeg" },
});

await client.profile.banner({
  authToken: "TWITTER_AUTH_TOKEN",
  media: { data: "BASE64_IMAGE_DATA", type: "image/png" },
});

await client.profile.removeBanner({
  authToken: "TWITTER_AUTH_TOKEN",
});

await client.profile.setPrivacy({
  authToken: "TWITTER_AUTH_TOKEN",
  isPrivate: true,
});
```

### Community

| Method | Description |
|--------|-------------|
| `client.community.getDetails({ communityId })` | Get community details |
| `client.community.getTweets({ communityId, sortBy })` | Get community tweets. `sortBy` is `"Relevance"` (default) or `"Recency"` |
| `client.community.getMembers({ communityId })` | Get community members |
| `client.community.search({ query })` | Search communities |
| `client.community.getMedia({ communityId })` | Get posts with photos or videos (Media tab) |
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

`type` is `Top`, `Latest`, `People`, `Photos` or `Videos`. `Latest`, `Photos` and `Videos` return tweets, `People` returns users, and `Top` returns items shaped `{ type: "tweet" | "user", content }`. With a literal `type`, the result is typed to match; a `type` held in a plain `string` keeps the `Tweet | User` type of earlier versions.

### Trends

| Method | Description |
|--------|-------------|
| `client.trends.get()` | Get worldwide trends |
| `client.trends.get({ country })` | Get trends in a country, such as `"US"` |
| `client.trends.get({ woeid })` | Get trends for a location ID from `getLocations()` |
| `client.trends.getLocations()` | List the locations X serves trends for |

Pass `country` or `woeid`, not both. Not every country is supported. Trends keep X's order, and `tweetVolume` is `null` when X reports no volume, which is the usual case.

```typescript
const { data } = await client.trends.get({ country: "US" });

console.log(data.location.name); // the place X answered for
for (const trend of data.trends) {
  console.log(trend.name, trend.tweetVolume ?? "no volume");
}
```

### Auth

| Method | Description |
|--------|-------------|
| `client.auth.login({ username, password, proxy, country })` | Log in and get auth tokens |

`country` is the ISO 3166-1 alpha-2 code for the proxy's public egress IP (for example, `"US"`). It must match the IP used for the complete login attempt. Pass `twoFactorSecret` when the account uses TOTP-based 2FA.

### X Chat (encrypted DMs)

| Method | Description |
|--------|-------------|
| `client.xchat.setup({ authToken, userId, pin })` | Initialize encrypted DMs |
| `client.xchat.getConversations({ authToken })` | List encrypted conversations |
| `client.xchat.send({ authToken, recipientId, message })` | Send encrypted message |
| `client.xchat.getHistory({ authToken, conversationId })` | Get conversation history |
| `client.xchat.canDm({ authToken, userIds })` | Check DM availability |

`client.xchat.send()` also accepts `conversationToken`, `conversationKeyVersion`, and `encryptedConversationKey`. The API fetches them itself when they are omitted.

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

### Account

| Method | Description |
|--------|-------------|
| `client.account.getUsage()` | Units left on your API key, and its rate limit |

```typescript
const { data } = await client.account.getUsage();

console.log(data.availableUnits); // plan units left + spendable PAYG units
console.log(data.plan?.remainingUnits); // plan is null for a PAYG-only account
console.log(data.payg?.expiresAt); // payg is null until a PAYG wallet is funded
console.log(data.rateLimit.requestsPerMinute);
```

This call costs no units. It only counts toward your per-minute rate limit.

## Pagination

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

Both helpers accept a function that returns a `PaginatedResponse`. Use them with resource methods whose responses contain `data` and `pagination.nextCursor`.

## Retries

By default, the client retries reads after these failures. Reads are every GET request, plus `tweet.translate()` and the X Chat `getConversations()`, `getHistory()`, and `canDm()` calls.

- A 429 response waits for the API's `Retry-After`, or 60 seconds if it sends none, capped by `maxRetryDelay`.
- A 5xx response waits for `Retry-After` when the API sends one. Otherwise it uses exponential backoff with jitter.
- A timeout or connection failure uses the same exponential backoff.
- Other 4xx responses fail without a retry.

Writes, such as posts, replies, likes, follows, messages, and logins, retry only after a 429 or 503 response that includes `Retry-After`. The API sends that header only before a request reaches X, so the retry cannot repeat an action. Any other failure of a write, including a timeout, may have happened after X accepted the action. The error reaches your code instead, so you can check the result before trying again.

These errors are never retried, because repeating the request cannot succeed:

| `code` | Status | Cause |
| --- | --- | --- |
| `PROXY_ERROR` | 502 | Your `proxy` refused the connection or could not be reached |
| `PROXY_TIMEOUT` | 504 | Your `proxy` timed out |
| `QUOTA_EXHAUSTED` | 429 | Your plan allowance or prepaid balance is used up |
| `SUBSCRIPTION_INACTIVE` | 429 | Your plan expired or is inactive |

The defaults are three retries, a 1-second initial delay, a backoff multiplier of 2, and a 30-second maximum delay.

`profile.updateUsername()`, `interaction.acceptFollowRequest()`, and `interaction.denyFollowRequest()` always make one attempt, even when global retries are enabled. `interaction.getFollowRequests()` retains normal retries and works with both pagination helpers.

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

### Rate-limit state

After a 429 response, the SDK exposes the last known rate limit state:

```typescript
console.log(client.rateLimitInfo);
```

## Error handling

The client throws subclasses of `TweetAPIError`. Retryable errors reach your code after the configured retries are exhausted.

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

- `code`: API error code, such as `"ACCOUNT_LOCKED"` or `"RATE_LIMITED"`
- `statusCode`: HTTP status code
- `message`: human-readable error message
- `details`: additional context such as a field, reason, or `retryAfter` value

### Error codes

`ErrorCode` exports the codes as constants. Errors without a specific code use `"UNKNOWN_ERROR"`, and network failures use `"CONNECTION_ERROR"`.

```typescript
import { ErrorCode, TweetAPIError } from "tweetapi-node";

try {
  await client.post.createPost({ authToken, text: "Hello", proxy });
} catch (error) {
  if (error instanceof TweetAPIError && error.code === ErrorCode.ACCOUNT_LOCKED) {
    console.log("Unlock the account on X, then try again");
  }
}
```

| `code` | Status | Meaning |
| --- | --- | --- |
| `RATE_LIMITED` | 429 | Per-minute limit reached. `retryAfter` gives the seconds until it resets. During login, X can also return it without `Retry-After`. |
| `QUOTA_EXHAUSTED` | 429 | Plan allowance or prepaid balance used up |
| `SUBSCRIPTION_INACTIVE` | 429 | Plan expired or inactive |
| `ACCOUNT_SUSPENDED` | 403 | The account behind `authToken` is suspended |
| `ACCOUNT_LOCKED` | 403 | The account behind `authToken` is locked |
| `PROXY_ERROR` | 502 | Your `proxy` refused the connection or could not be reached |
| `PROXY_TIMEOUT` | 504 | Your `proxy` timed out |
| `INVALID_CREDENTIALS` | 401 | Login: wrong username or password |
| `TWO_FACTOR_REQUIRED` | 401 | Login: the account needs `twoFactorSecret` |
| `INVALID_TWO_FACTOR_CODE` | 401 | Login: the two-factor code was rejected |
| `EMAIL_VERIFICATION_REQUIRED` | 401 | Login: the account must verify its email first |
| `LOGIN_RUNTIME_UNAVAILABLE` | 503 | Login: X could not be reached; try again later |

## Configuration

```typescript
const client = new TweetAPI({
  apiKey: "YOUR_API_KEY",       // Required
  baseUrl: "https://...",       // Optional (default: https://api.tweetapi.com)
  timeout: 30000,               // Optional (default: 30000ms)
  mediaTimeout: 120000,         // Optional (default: 120000ms, or timeout if longer)
  retry: {                      // Optional (default: { maxRetries: 3 })
    maxRetries: 3,
    initialRetryDelay: 1000,
    backoffMultiplier: 2,
    maxRetryDelay: 30000,
  },
});
```

`mediaTimeout` applies to the calls that upload a file: `post.createPostWithMedia()`, `post.replyPostWithMedia()`, `post.uploadMedia()`, the three community with-media methods, `profile.avatar()`, `profile.banner()`, and `dm.sendDm()` when it has media. The API can wait for X to process the file before it answers, so these calls get more time. Every other call uses `timeout`.

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5+ (for type definitions)

## Links

- [Documentation](https://tweetapi.com/docs?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Get an API key](https://tweetapi.com?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Dashboard](https://tweetapi.com/dashboard?utm_source=github&utm_medium=readme&utm_campaign=node-sdk)
- [Python SDK](https://github.com/tweetapi/python)

## License

MIT

TweetAPI is a third-party service and is not affiliated with X Corp.
