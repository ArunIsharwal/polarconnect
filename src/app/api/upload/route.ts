import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../auth";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".mp4",
  ".mov",
];

export async function POST(request: Request) {
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

    // -----------------------------------------
    // FORM DATA
    // -----------------------------------------

    const formData =
      await request.formData();

    const file = formData.get("file");

    const title = String(
      formData.get("title") || "",
    ).trim();

    const contentType = String(
      formData.get("contentType") ||
        "REPORT",
    );

    const region = String(
      formData.get("region") ||
        "ANTARCTICA",
    );

    const yearValue = String(
      formData.get("year") || "",
    );

    const description = String(
      formData.get("description") || "",
    );

    const tagsValue = String(
      formData.get("tags") || "",
    );

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file was uploaded",
        },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Uploaded file is empty",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File size must be 100 MB or less",
        },
        { status: 400 },
      );
    }

    const originalName = file.name;

    const extension = path
      .extname(originalName)
      .toLowerCase();

    if (
      !ALLOWED_EXTENSIONS.includes(
        extension,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `File type ${extension} is not supported`,
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // STORE FILE
    // -----------------------------------------

    const uniqueName = `${crypto.randomUUID()}${extension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "documents",
      );

    await fs.mkdir(
      uploadDirectory,
      { recursive: true },
    );

    const filePath = path.join(
      uploadDirectory,
      uniqueName,
    );

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    await fs.writeFile(
      filePath,
      buffer,
    );

    const fileUrl =
      `/documents/${uniqueName}`;

    // -----------------------------------------
    // METADATA
    // -----------------------------------------

    const tags = tagsValue
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const year = yearValue
      ? Number(yearValue)
      : undefined;

    // -----------------------------------------
    // SAVE DOCUMENT
    // -----------------------------------------

    try {
      const document =
        await DocumentModel.create({
          title,
          contentType,
          region,
          year,
          description,
          tags,
          fileName: originalName,
          fileUrl,
          status: "PENDING",
        });

      return NextResponse.json(
        {
          success: true,
          message:
            "File uploaded successfully",
          document,
        },
        { status: 201 },
      );
    } catch (databaseError) {
      // Delete the uploaded file if MongoDB
      // creation fails.
      try {
        await fs.unlink(filePath);
      } catch (deleteError) {
        console.error(
          "Failed to remove orphaned file:",
          deleteError,
        );
      }

      throw databaseError;
    }
  } catch (error) {
    console.error(
      "POST /api/upload error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}