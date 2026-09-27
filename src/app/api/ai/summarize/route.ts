import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

import { InferenceClient } from "@huggingface/inference";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../../auth";

export const runtime = "nodejs";

PDFParse.setWorker(getPath());

const MAX_TEXT_LENGTH = 6000;
const CHUNK_SIZE = 2500;

function cleanText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

function getLocalFilePath(
  fileUrl: string,
) {
  const fileName =
    path.basename(fileUrl);

  return path.join(
    process.cwd(),
    "public",
    "documents",
    fileName,
  );
}

function splitIntoChunks(
  text: string,
  size: number,
) {
  const chunks: string[] = [];

  for (
    let i = 0;
    i < text.length;
    i += size
  ) {
    chunks.push(
      text.slice(
        i,
        i + size,
      ),
    );
  }

  return chunks;
}

export async function POST(
  request: Request,
) {
  let document: any = null;

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

    await connectDB();

    const body =
      await request.json();

    const documentId = String(
      body.documentId || "",
    ).trim();

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "documentId is required",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // FIND DOCUMENT
    // -----------------------------------------

    document =
      await DocumentModel.findById(
        documentId,
      );

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

    // -----------------------------------------
    // CHECK FILE
    // -----------------------------------------

    if (!document.fileUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This document does not have a stored file URL.",
        },
        { status: 400 },
      );
    }

    const fileName =
      document.fileName ||
      "";

    if (
      !fileName
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI summarization currently supports PDF files only.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // HUGGING FACE TOKEN
    // -----------------------------------------

    const hfToken =
      process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "HF_TOKEN is missing from .env.local",
        },
        { status: 500 },
      );
    }

    // -----------------------------------------
    // MARK PROCESSING
    // -----------------------------------------

    document.aiStatus =
      "PROCESSING";

    await document.save();

    // -----------------------------------------
    // READ PDF
    // -----------------------------------------

    const filePath =
      getLocalFilePath(
        document.fileUrl,
      );

    let pdfBuffer: Buffer;

    try {
      pdfBuffer =
        await readFile(
          filePath,
        );
    } catch (error) {
      document.aiStatus =
        "FAILED";

      await document.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "The stored PDF could not be found.",
          details:
            error instanceof Error
              ? error.message
              : String(error),
        },
        { status: 404 },
      );
    }

    // -----------------------------------------
    // EXTRACT PDF TEXT
    // -----------------------------------------

    const parser =
      new PDFParse({
        data: pdfBuffer,
      });

    let extractedText = "";

    try {
      const result =
        await parser.getText();

      extractedText =
        cleanText(
          result.text || "",
        );
    } finally {
      await parser.destroy();
    }

    if (!extractedText) {
      document.aiStatus =
        "FAILED";

      await document.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "No selectable text was found in this PDF. It may be a scanned/image-only PDF and would require OCR.",
        },
        { status: 422 },
      );
    }

    // -----------------------------------------
    // LIMIT TEXT
    // -----------------------------------------

    const limitedText =
      extractedText.slice(
        0,
        MAX_TEXT_LENGTH,
      );

    const chunks =
      splitIntoChunks(
        limitedText,
        CHUNK_SIZE,
      );

    // -----------------------------------------
    // HUGGING FACE
    // -----------------------------------------

    const client =
      new InferenceClient(
        hfToken,
      );

    const summaries: string[] =
      [];

    for (
      const chunk of chunks
    ) {
      const result =
        await client.summarization(
          {
            provider:
              "hf-inference",

            model:
              "Falconsai/text_summarization",

            inputs: chunk,
          },
        );

      if (
        result &&
        typeof result.summary_text ===
          "string" &&
        result.summary_text.trim()
      ) {
        summaries.push(
          result.summary_text.trim(),
        );
      }
    }

    if (
      summaries.length === 0
    ) {
      throw new Error(
        "Hugging Face returned no summary.",
      );
    }

    const finalSummary =
      summaries.join(" ");

    // -----------------------------------------
    // SAVE RESULT
    // -----------------------------------------

    document.aiSummary =
      finalSummary;

    document.aiStatus =
      "COMPLETE";

    document.aiProcessedAt =
      new Date();

    await document.save();

    return NextResponse.json({
      success: true,

      message:
        "AI summary generated successfully",

      document: {
        id: String(
          document._id,
        ),

        title:
          document.title,

        aiSummary:
          document.aiSummary,

        aiStatus:
          document.aiStatus,

        aiProcessedAt:
          document.aiProcessedAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/ai/summarize error:",
      error,
    );

    if (document) {
      try {
        document.aiStatus =
          "FAILED";

        await document.save();
      } catch (saveError) {
        console.error(
          "Failed to save AI failure status:",
          saveError,
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "AI summarization failed",

        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}