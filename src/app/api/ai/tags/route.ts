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

const MAX_TEXT_LENGTH = 5000;

const CANDIDATE_TAGS = [
  "Antarctica",
  "Arctic",
  "Cryosphere",
  "Climate",
  "Polar Research",
  "Glaciology",
  "Sea Ice",
  "Southern Ocean",
  "Oceanography",
  "Atmospheric Science",
  "Meteorology",
  "Remote Sensing",
  "Satellite",
  "Expedition",
  "Biodiversity",
  "Ecology",
  "Geology",
  "Physics",
  "Electronics",
  "CMOS",
  "VTC",
  "Noise Margin",
  "NMOS",
  "PMOS",
  "LTspice",
  "Circuits",
  "Signal Processing",
  "Communications",
  "Robotics",
  "Data Analysis",
  "Simulation",
  "Artificial Intelligence",
  "Machine Learning",
];

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
            "AI tag generation currently supports PDF files only.",
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

    document.aiTagsStatus =
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
      document.aiTagsStatus =
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
      document.aiTagsStatus =
        "FAILED";

      await document.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "No selectable text was found in the PDF. OCR is required for image-only PDFs.",
        },
        { status: 422 },
      );
    }

    // -----------------------------------------
    // LIMIT TEXT
    // -----------------------------------------

    const text =
      extractedText.slice(
        0,
        MAX_TEXT_LENGTH,
      );

    // -----------------------------------------
    // HUGGING FACE
    // -----------------------------------------

    const client =
      new InferenceClient(
        hfToken,
      );

    const result =
      await client.zeroShotClassification(
        {
          provider:
            "hf-inference",

          model:
            "facebook/bart-large-mnli",

          inputs: text,

          parameters: {
            candidate_labels:
              CANDIDATE_TAGS,

            multi_label: true,
          },
        },
      );

    // -----------------------------------------
    // SELECT SUGGESTIONS
    // -----------------------------------------

    const suggestions =
      result
        .map((item) => ({
          label: item.label,
          score: item.score,
        }))
        .filter(
          (item) =>
            item.score >= 0.35,
        )
        .sort(
          (a, b) =>
            b.score - a.score,
        )
        .slice(0, 8);

    const suggestedTags =
      suggestions.map(
        (item) => item.label,
      );

    // -----------------------------------------
    // SAVE RESULTS
    // -----------------------------------------

    document.aiSuggestedTags =
      suggestedTags;

    document.aiTagsStatus =
      "COMPLETE";

    document.aiTagsProcessedAt =
      new Date();

    await document.save();

    return NextResponse.json({
      success: true,

      message:
        "AI suggested tags generated successfully",

      document: {
        id: String(
          document._id,
        ),

        title:
          document.title,

        aiSuggestedTags:
          document.aiSuggestedTags,

        aiTagsStatus:
          document.aiTagsStatus,

        aiTagsProcessedAt:
          document.aiTagsProcessedAt,
      },

      suggestions,
    });
  } catch (error) {
    console.error(
      "POST /api/ai/tags error:",
      error,
    );

    if (document) {
      try {
        document.aiTagsStatus =
          "FAILED";

        await document.save();
      } catch (saveError) {
        console.error(
          "Failed to save AI tag failure status:",
          saveError,
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "AI tag generation failed",

        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}