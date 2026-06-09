import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

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

function getPublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "");
  if (!base) throw new Error("R2_PUBLIC_URL is not set.");
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

  return getPublicUrl(key);
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

export function vocabWordAudioKey(wordId: string): string {
  return `audio/words/${wordId}.mp3`;
}
