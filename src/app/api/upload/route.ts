import { NextResponse } from "next/server";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = [
  "REPORT",
  "DATASET",
  "PUBLICATION",
  "MEDIA",
] as const;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "image/png",
  "image/jpeg",
  "video/mp4",
  "video/quicktime",
];

type RecordContentType =
  (typeof ALLOWED_CONTENT_TYPES)[number];

type UploadMetadata = {
  fileName: string;
  title: string;
  contentType: RecordContentType;
  mimeType?: string;
  region: string;
  year?: number;
  description: string;
  tags: string[];
};

type TokenPayload = UploadMetadata & {
  adminEmail: string;
};

export async function POST(
  request: Request,
): Promise<NextResponse> {
  try {
    /*
     * Vercel Blob CLIENT UPLOADS send JSON to this route.
     *
     * The request contains actions such as:
     * blob.generate-client-token
     * blob.upload-completed
     *
     * Therefore DO NOT use request.formData()
     * in this route.
     */
    const body =
      (await request.json()) as HandleUploadBody;

    const jsonResponse =
      await handleUpload({
        body,
        request,

        /*
         * ---------------------------------------
         * CLIENT TOKEN GENERATION
         * ---------------------------------------
         */
        onBeforeGenerateToken:
          async (
            pathname,
            clientPayload,
          ) => {
            const session =
              await auth();

            /*
             * Only authenticated admin can
             * receive an upload token.
             */
            if (
              !session?.user?.email ||
              session.user.email !==
                process.env.ADMIN_EMAIL
            ) {
              throw new Error(
                "Unauthorized",
              );
            }

            if (
              !process.env
                .BLOB_READ_WRITE_TOKEN
            ) {
              throw new Error(
                "BLOB_READ_WRITE_TOKEN is not configured.",
              );
            }

            /*
             * Parse metadata sent by
             * UploadPanel.
             */
            let metadata: UploadMetadata;

            try {
              metadata =
                JSON.parse(
                  clientPayload ||
                    "{}",
                ) as UploadMetadata;
            } catch {
              throw new Error(
                "Invalid upload metadata.",
              );
            }

            /*
             * Validate title.
             */
            if (
              typeof metadata.title !==
                "string" ||
              !metadata.title.trim()
            ) {
              throw new Error(
                "Title is required.",
              );
            }

            /*
             * Validate record type.
             */
            if (
              !ALLOWED_CONTENT_TYPES.includes(
                metadata.contentType,
              )
            ) {
              throw new Error(
                "Invalid content type.",
              );
            }

            /*
             * Validate filename.
             */
            if (
              typeof metadata.fileName !==
                "string" ||
              !metadata.fileName.trim()
            ) {
              throw new Error(
                "File name is required.",
              );
            }

            /*
             * Normalize tags.
             */
            const normalizedTags =
              Array.isArray(
                metadata.tags,
              )
                ? [
                    ...new Set(
                      metadata.tags
                        .map(
                          (tag) =>
                            String(
                              tag,
                            ).trim(),
                        )
                        .filter(
                          Boolean,
                        ),
                    ),
                  ]
                : [];

            /*
             * Normalize year.
             */
            const parsedYear =
              metadata.year !==
                undefined
                ? Number(
                    metadata.year,
                  )
                : undefined;

            const normalizedYear =
              parsedYear !==
                undefined &&
              Number.isFinite(
                parsedYear,
              )
                ? parsedYear
                : undefined;

            /*
             * Clean metadata before
             * storing it in token payload.
             */
            const safeMetadata: UploadMetadata =
              {
                fileName:
                  metadata.fileName.trim(),

                title:
                  metadata.title.trim(),

                contentType:
                  metadata.contentType,

                mimeType:
                  typeof metadata.mimeType ===
                  "string"
                    ? metadata.mimeType
                    : undefined,

                region:
                  typeof metadata.region ===
                  "string"
                    ? metadata.region.trim()
                    : "ANTARCTICA",

                year:
                  normalizedYear,

                description:
                  typeof metadata.description ===
                  "string"
                    ? metadata.description.trim()
                    : "",

                tags:
                  normalizedTags,
              };

            /*
             * Store trusted metadata in the
             * signed Blob token payload.
             *
             * This is later received by
             * onUploadCompleted().
             */
            const tokenPayload: TokenPayload =
              {
                ...safeMetadata,
                adminEmail:
                  session.user.email,
              };

            return {
              /*
               * Allow the scientific file
               * formats used by PolarConnect.
               */
              allowedContentTypes:
                ALLOWED_MIME_TYPES,

              /*
               * Protect against very large
               * uploads.
               */
              maximumSizeInBytes:
                MAX_FILE_SIZE,

              /*
               * Our client already creates
               * a unique pathname.
               */
              addRandomSuffix: false,

              /*
               * Sent back by Vercel Blob
               * when the upload completes.
               */
              tokenPayload:
                JSON.stringify(
                  tokenPayload,
                ),
            };
          },

        /*
         * ---------------------------------------
         * BLOB UPLOAD COMPLETED
         * ---------------------------------------
         *
         * This callback creates the MongoDB
         * document AFTER the Blob exists.
         */
        onUploadCompleted:
          async ({
            blob,
            tokenPayload,
          }) => {
            try {
              if (!tokenPayload) {
                throw new Error(
                  "Upload metadata was not provided.",
                );
              }

              const metadata =
                JSON.parse(
                  tokenPayload,
                ) as TokenPayload;

              /*
               * Make sure the callback belongs
               * to our configured admin.
               */
              if (
                !process.env
                  .ADMIN_EMAIL ||
                metadata.adminEmail !==
                  process.env
                    .ADMIN_EMAIL
              ) {
                throw new Error(
                  "Unauthorized upload completion.",
                );
              }

              await connectDB();

              /*
               * Prevent duplicate records if
               * Vercel retries the completion
               * callback.
               */
              const existing =
                await DocumentModel.findOne(
                  {
                    fileUrl:
                      blob.url,
                  },
                );

              if (existing) {
                console.log(
                  "Document already registered:",
                  blob.url,
                );

                return;
              }

              /*
               * Save the same document structure
               * used by your existing repository,
               * approval and AI systems.
               */
              const document =
                await DocumentModel.create(
                  {
                    title:
                      metadata.title,

                    contentType:
                      metadata.contentType,

                    region:
                      metadata.region,

                    year:
                      metadata.year,

                    description:
                      metadata.description,

                    tags:
                      metadata.tags,

                    fileName:
                      metadata.fileName,

                    fileUrl:
                      blob.url,

                    status:
                      "PENDING",
                  },
                );

              console.log(
                "Document registered after Blob upload:",
                {
                  id:
                    document._id.toString(),

                  title:
                    document.title,

                  contentType:
                    document.contentType,

                  fileUrl:
                    document.fileUrl,
                },
              );
            } catch (error) {
              console.error(
                "onUploadCompleted error:",
                error,
              );

              /*
               * Throwing lets Vercel Blob retry
               * the completion webhook.
               */
              throw error;
            }
          },
      });

    return NextResponse.json(
      jsonResponse,
    );
  } catch (error) {
    console.error(
      "POST /api/upload error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      { status: 400 },
    );
  }
}