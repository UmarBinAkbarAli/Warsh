import { HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName() {
  const name = process.env.R2_BUCKET_NAME?.trim();
  if (!name) throw new Error("R2_BUCKET_NAME is not set.");
  return name;
}

export function getR2PublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "");
  if (!base) throw new Error("R2_PUBLIC_URL is not set.");
  // A bare host ("pub-xxxx.r2.dev") reads fine in the dashboard but is not a
  // URL, and /api/audio/catalog hands this straight to NextResponse.redirect —
  // which threw "URL is malformed" and 500'd every audio request for as long as
  // the value stayed that way. Fail on the misconfiguration itself, naming it.
  if (!/^https?:\/\//i.test(base)) {
    throw new Error("R2_PUBLIC_URL must be an absolute http(s) URL, e.g. https://cdn.example.com.");
  }
  return `${base}/${key}`;
}

export async function uploadAudioToR2(key: string, audioBuffer: Buffer): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: audioBuffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return getR2PublicUrl(key);
}

export async function r2KeyExists(key: string): Promise<boolean> {
  try {
    const client = getR2Client();
    await client.send(new HeadObjectCommand({ Bucket: getBucketName(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function listR2Keys(prefix: string): Promise<string[]> {
  const client = getR2Client();
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const page = await client.send(new ListObjectsV2Command({
      Bucket: getBucketName(),
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    for (const item of page.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

export function vocabWordAudioKey(wordId: string): string {
  return `audio/words/${wordId}.mp3`;
}

export function vocabWordImageKey(wordId: string): string {
  return `images/words/${wordId}.jpg`;
}

export function discoverImageKey(slug: string): string {
  return `images/discover/${slug}.png`;
}

export function chapterImageKey(chapterId: string): string {
  return `images/chapters/${chapterId}.jpg`;
}

export async function uploadImageToR2(key: string, imageBuffer: Buffer, contentType = "image/png"): Promise<string> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return getR2PublicUrl(key);
}
