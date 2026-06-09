import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getUserIdFromRequest } from "../../../../../../lib/auth";
import { uploadAudioToR2 } from "../../../../../../lib/r2";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function vocabWordImageKey(wordId: string): string {
  return `images/words/${wordId}.jpg`;
}

// PUT /api/vocabulary/words/[id]/image
// Body: raw image bytes (Content-Type: image/jpeg or image/png)
// Uploads to R2 and saves imageUrl on the word.
// Only usable with a valid JWT — run from admin scripts or Prisma Studio.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const word = await prisma.vocabularyWord.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!word) {
    return NextResponse.json({ error: "Word not found", code: "not_found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "image/jpeg";
  const imageBuffer = Buffer.from(await request.arrayBuffer());

  if (imageBuffer.length === 0) {
    return NextResponse.json({ error: "Empty image body", code: "bad_request" }, { status: 400 });
  }

  const key = vocabWordImageKey(word.id);
  const bucket = process.env.R2_BUCKET_NAME!;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const imageUrl = `${publicUrl}/${key}`;
  await prisma.vocabularyWord.update({
    where: { id: word.id },
    data: { imageUrl },
  });

  return NextResponse.json({ data: { imageUrl } });
}
