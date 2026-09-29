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
    // -----------------------------------------
    // ADMIN AUTHENTICATION
    // -----------------------------------------

    const session =
      await auth();

    if (
      !session?.user?.email ||
      session.user.email !==
        process.env.ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // -----------------------------------------
    // BLOB TOKEN
    // -----------------------------------------

    const token =
      process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
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

    // -----------------------------------------
    // IMPORTANT
    //
    // @vercel/blob/client sends JSON here.
    // This endpoint is NOT a normal FormData
    // upload endpoint.
    // -----------------------------------------

    const body =
      (await request.json()) as HandleUploadBody;

    // -----------------------------------------
    // HANDLE VERCEL BLOB CLIENT UPLOAD
    // -----------------------------------------

    const jsonResponse =
      await handleUpload({
        token,
        request,
        body,

        // ---------------------------------------
        // GENERATE CLIENT UPLOAD TOKEN
        // ---------------------------------------

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

        // ---------------------------------------
        // UPLOAD COMPLETION
        //
        // IMPORTANT:
        // MongoDB is NOT written here.
        //
        // The browser saves the database record
        // through the existing /api/documents
        // endpoint after Blob upload succeeds.
        //
        // This avoids duplicate records and
        // callback metadata parsing problems.
        // ---------------------------------------

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