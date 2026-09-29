import { NextResponse } from "next/server";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";

import { auth } from "../../../../auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "image/png",
  "image/jpeg",
  "video/mp4",
  "video/quicktime",
];

export async function POST(
  request: Request,
) {
  try {
    // --------------------------------------------------
    // ADMIN AUTHENTICATION
    // --------------------------------------------------

    const session = await auth();

    if (
      !session?.user?.email ||
      session.user.email !==
        process.env.ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------------------------
    // CHECK BLOB TOKEN
    // --------------------------------------------------

    if (
      !process.env
        .BLOB_READ_WRITE_TOKEN
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "BLOB_READ_WRITE_TOKEN is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    // --------------------------------------------------
    // VERCEL BLOB CLIENT UPLOAD
    //
    // IMPORTANT:
    // This request is JSON from @vercel/blob/client.
    // Do NOT use request.formData().
    // --------------------------------------------------

    const body =
      (await request.json()) as HandleUploadBody;

    const jsonResponse =
      await handleUpload({
        body,
        request,

        // ------------------------------------------------
        // GENERATE CLIENT TOKEN
        // ------------------------------------------------

        onBeforeGenerateToken:
          async () => {
            return {
              allowedContentTypes:
                ALLOWED_MIME_TYPES,

              maximumSizeInBytes:
                MAX_FILE_SIZE,

              addRandomSuffix:
                false,
            };
          },

        // ------------------------------------------------
        // COMPLETION CALLBACK
        //
        // MongoDB is intentionally NOT handled here.
        // The client saves metadata through the existing
        // /api/documents route after Blob upload succeeds.
        // ------------------------------------------------

        onUploadCompleted:
          async ({
            blob,
          }) => {
            console.log(
              "Vercel Blob upload completed:",
              blob.url,
            );
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
      {
        status: 400,
      },
    );
  }
}