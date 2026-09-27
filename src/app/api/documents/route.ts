import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../auth";

// -----------------------------------------
// GET ALL DOCUMENTS
// Public endpoint used by Repository,
// Dashboard and other read-only pages.
// -----------------------------------------

export async function GET() {
  try {
    await connectDB();

    const documents =
      await DocumentModel.find().sort({
        createdAt: -1,
      });

    return NextResponse.json(
      {
        success: true,
        count: documents.length,
        documents,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "GET /api/documents error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch documents",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}

// -----------------------------------------
// POST A NEW DOCUMENT
// Admin only.
// -----------------------------------------

export async function POST(
  request: Request,
) {
  try {
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
        { status: 401 },
      );
    }

    await connectDB();

    const body =
      await request.json();

    const {
      title,
      contentType,
      region,
      year,
      description,
      tags,
      fileName,
      fileUrl,
    } = body;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 },
      );
    }

    const normalizedTags =
      Array.isArray(tags)
        ? [
            ...new Set(
              tags
                .map((tag: unknown) =>
                  String(tag).trim(),
                )
                .filter(Boolean),
            ),
          ]
        : [];

    const document =
      await DocumentModel.create({
        title: title.trim(),
        contentType:
          contentType || "REPORT",
        region:
          region || "ANTARCTICA",
        year,
        description:
          description || "",
        tags: normalizedTags,
        fileName:
          fileName || "",
        fileUrl:
          fileUrl || "",
        status: "PENDING",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Document saved successfully",
        document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/documents error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to save document",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}