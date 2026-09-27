import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../../auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    // -----------------------------------------
    // ADMIN AUTHENTICATION
    // -----------------------------------------

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

    // -----------------------------------------
    // DATABASE
    // -----------------------------------------

    await connectDB();

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid document ID",
        },
        { status: 400 },
      );
    }

    const body =
      await request.json();

    const document =
      await DocumentModel.findById(id);

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found",
        },
        { status: 404 },
      );
    }

    let changed = false;

    // -----------------------------------------
    // UPDATE STATUS
    // -----------------------------------------

    if (
      body.status !== undefined
    ) {
      const status =
        String(
          body.status,
        ).toUpperCase();

      if (
        !ALLOWED_STATUSES.includes(
          status,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Status must be PENDING, APPROVED or REJECTED",
          },
          { status: 400 },
        );
      }

      document.status =
        status;

      changed = true;
    }

    // -----------------------------------------
    // USE AI SUGGESTED TAGS
    // -----------------------------------------

    if (
      body.useAISuggestedTags ===
      true
    ) {
      const aiSuggestedTags =
        Array.isArray(
          document.aiSuggestedTags,
        )
          ? document.aiSuggestedTags
          : [];

      if (
        aiSuggestedTags.length ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No AI suggested tags are available for this document",
          },
          { status: 400 },
        );
      }

      document.tags = [
        ...new Set(
          aiSuggestedTags
            .map(
              (tag: unknown) =>
                String(tag).trim(),
            )
            .filter(Boolean),
        ),
      ];

      changed = true;
    }

    // -----------------------------------------
    // SAVE MANUAL TAGS
    // -----------------------------------------

    if (
      body.tags !== undefined
    ) {
      if (
        !Array.isArray(
          body.tags,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "tags must be an array",
          },
          { status: 400 },
        );
      }

      document.tags = [
        ...new Set(
          body.tags
            .map(
              (tag: unknown) =>
                String(tag).trim(),
            )
            .filter(Boolean),
        ),
      ];

      changed = true;
    }

    if (!changed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid document changes were provided",
        },
        { status: 400 },
      );
    }

    await document.save();

    return NextResponse.json({
      success: true,
      message:
        "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error(
      "PATCH /api/documents/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update document",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}