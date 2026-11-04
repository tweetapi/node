import TweetAPI, { TweetAPIError } from "tweetapi-node";
import type { MediaStatus, UploadedMedia } from "tweetapi-node";

const client = new TweetAPI({ apiKey: "YOUR_API_KEY" });

const authToken = "YOUR_AUTH_TOKEN";
const proxy = "host:port@user:pass";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  try {
    // Upload a video. The API waits up to 30 seconds for X to process it.
    const upload = await client.post.uploadMedia({
      authToken,
      proxy,
      media: { url: "https://example.com/video.mp4" },
    });
    const { mediaId } = upload.data;
    console.log(`Uploaded ${upload.data.type} ${mediaId}: ${upload.data.state}`);

    // Check again until X has finished. Each status check costs one unit.
    let media: UploadedMedia | MediaStatus = upload.data;
    while (media.state === "pending" || media.state === "in_progress") {
      await sleep((media.checkAfterSecs ?? 5) * 1000);
      media = (await client.post.getMediaStatus({ authToken, proxy, mediaId })).data;
      console.log(`Processing: ${media.progressPercent ?? 0}%`);
    }

    if (media.state === "failed") {
      const reason = "error" in media ? media.error?.message : undefined;
      console.error(`X could not process the file${reason ? `: ${reason}` : ""}`);
      return;
    }

    // Post it with the same authToken before X discards it (expiresAfterSecs)
    const post = await client.post.createPostWithMedia({
      authToken,
      proxy,
      text: "Posted with TweetAPI",
      media: [{ media_id: mediaId }],
    });
    console.log(`Tweet created: ${post.data.metadata?.tweet_id}`);
  } catch (error) {
    if (error instanceof TweetAPIError) {
      console.error(`API error [${error.code}]: ${error.message}`);
    } else {
      throw error;
    }
  }
}

main();
