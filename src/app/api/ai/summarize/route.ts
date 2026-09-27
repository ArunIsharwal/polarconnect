// import { NextResponse } from "next/server";
// import { readFile } from "node:fs/promises";
// import path from "node:path";

// import { getPath } from "pdf-parse/worker";
// import { PDFParse } from "pdf-parse";

// import { InferenceClient } from "@huggingface/inference";

// import connectDB from "@/lib/mongodb";
// import DocumentModel from "@/models/Document";

// import { auth } from "../../../../../auth";

// export const runtime = "nodejs";

// PDFParse.setWorker(getPath());

// const MAX_TEXT_LENGTH = 6000;
// const CHUNK_SIZE = 2500;

// function cleanText(text: string) {
//   return text
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function getLocalFilePath(
//   fileUrl: string,
// ) {
//   const fileName =
//     path.basename(fileUrl);

//   return path.join(
//     process.cwd(),
//     "public",
//     "documents",
//     fileName,
//   );
// }

// function splitIntoChunks(
//   text: string,
//   size: number,
// ) {
//   const chunks: string[] = [];

//   for (
//     let i = 0;
//     i < text.length;
//     i += size
//   ) {
//     chunks.push(
//       text.slice(
//         i,
//         i + size,
//       ),
//     );
//   }

//   return chunks;
// }

// export async function POST(
//   request: Request,
// ) {
//   let document: any = null;

//   try {
//     // -----------------------------------------
//     // ADMIN AUTHENTICATION
//     // -----------------------------------------

//     const session = await auth();

//     if (
//       !session?.user?.email ||
//       session.user.email !==
//         process.env.ADMIN_EMAIL
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 },
//       );
//     }

//     await connectDB();

//     const body =
//       await request.json();

//     const documentId = String(
//       body.documentId || "",
//     ).trim();

//     if (!documentId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "documentId is required",
//         },
//         { status: 400 },
//       );
//     }

//     // -----------------------------------------
//     // FIND DOCUMENT
//     // -----------------------------------------

//     document =
//       await DocumentModel.findById(
//         documentId,
//       );

//     if (!document) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Document not found",
//         },
//         { status: 404 },
//       );
//     }

//     // -----------------------------------------
//     // CHECK FILE
//     // -----------------------------------------

//     if (!document.fileUrl) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "This document does not have a stored file URL.",
//         },
//         { status: 400 },
//       );
//     }

//     const fileName =
//       document.fileName ||
//       "";

//     if (
//       !fileName
//         .toLowerCase()
//         .endsWith(".pdf")
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "AI summarization currently supports PDF files only.",
//         },
//         { status: 400 },
//       );
//     }

//     // -----------------------------------------
//     // HUGGING FACE TOKEN
//     // -----------------------------------------

//     const hfToken =
//       process.env.HF_TOKEN;

//     if (!hfToken) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "HF_TOKEN is missing from .env.local",
//         },
//         { status: 500 },
//       );
//     }

//     // -----------------------------------------
//     // MARK PROCESSING
//     // -----------------------------------------

//     document.aiStatus =
//       "PROCESSING";

//     await document.save();

//     // -----------------------------------------
//     // READ PDF
//     // -----------------------------------------

//     const filePath =
//       getLocalFilePath(
//         document.fileUrl,
//       );

//     let pdfBuffer: Buffer;

//     try {
//       pdfBuffer =
//         await readFile(
//           filePath,
//         );
//     } catch (error) {
//       document.aiStatus =
//         "FAILED";

//       await document.save();

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "The stored PDF could not be found.",
//           details:
//             error instanceof Error
//               ? error.message
//               : String(error),
//         },
//         { status: 404 },
//       );
//     }

//     // -----------------------------------------
//     // EXTRACT PDF TEXT
//     // -----------------------------------------

//     const parser =
//       new PDFParse({
//         data: pdfBuffer,
//       });

//     let extractedText = "";

//     try {
//       const result =
//         await parser.getText();

//       extractedText =
//         cleanText(
//           result.text || "",
//         );
//     } finally {
//       await parser.destroy();
//     }

//     if (!extractedText) {
//       document.aiStatus =
//         "FAILED";

//       await document.save();

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No selectable text was found in this PDF. It may be a scanned/image-only PDF and would require OCR.",
//         },
//         { status: 422 },
//       );
//     }

//     // -----------------------------------------
//     // LIMIT TEXT
//     // -----------------------------------------

//     const limitedText =
//       extractedText.slice(
//         0,
//         MAX_TEXT_LENGTH,
//       );

//     const chunks =
//       splitIntoChunks(
//         limitedText,
//         CHUNK_SIZE,
//       );

//     // -----------------------------------------
//     // HUGGING FACE
//     // -----------------------------------------

//     const client =
//       new InferenceClient(
//         hfToken,
//       );

//     const summaries: string[] =
//       [];

//     for (
//       const chunk of chunks
//     ) {
//       const result =
//         await client.summarization(
//           {
//             provider:
//               "hf-inference",

//             model:
//               "Falconsai/text_summarization",

//             inputs: chunk,
//           },
//         );

//       if (
//         result &&
//         typeof result.summary_text ===
//           "string" &&
//         result.summary_text.trim()
//       ) {
//         summaries.push(
//           result.summary_text.trim(),
//         );
//       }
//     }

//     if (
//       summaries.length === 0
//     ) {
//       throw new Error(
//         "Hugging Face returned no summary.",
//       );
//     }

//     const finalSummary =
//       summaries.join(" ");

//     // -----------------------------------------
//     // SAVE RESULT
//     // -----------------------------------------

//     document.aiSummary =
//       finalSummary;

//     document.aiStatus =
//       "COMPLETE";

//     document.aiProcessedAt =
//       new Date();

//     await document.save();

//     return NextResponse.json({
//       success: true,

//       message:
//         "AI summary generated successfully",

//       document: {
//         id: String(
//           document._id,
//         ),

//         title:
//           document.title,

//         aiSummary:
//           document.aiSummary,

//         aiStatus:
//           document.aiStatus,

//         aiProcessedAt:
//           document.aiProcessedAt,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "POST /api/ai/summarize error:",
//       error,
//     );

//     if (document) {
//       try {
//         document.aiStatus =
//           "FAILED";

//         await document.save();
//       } catch (saveError) {
//         console.error(
//           "Failed to save AI failure status:",
//           saveError,
//         );
//       }
//     }

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           "AI summarization failed",

//         details:
//           error instanceof Error
//             ? error.message
//             : String(error),
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../../auth";

export const runtime = "nodejs";

const CHAT_MODEL =
  process.env.HF_CHAT_MODEL ||
  "openai/gpt-oss-120b:fastest";

const SUMMARY_MODEL =
  "facebook/bart-large-cnn";

const MAX_PDF_TEXT = 40000;

const BART_CHUNK_SIZE = 2500;

const RETRIES = 3;

PDFParse.setWorker(getPath());

type SummaryResponse = {
  success: boolean;
  message: string;
  documentId?: string;
  aiStatus?: string;
  aiSummary?: string;
};

function sleep(
  milliseconds: number,
) {
  return new Promise((resolve) =>
    setTimeout(
      resolve,
      milliseconds,
    ),
  );
}

function splitText(
  text: string,
  chunkSize: number,
): string[] {
  const chunks: string[] = [];

  for (
    let index = 0;
    index < text.length;
    index += chunkSize
  ) {
    chunks.push(
      text.slice(
        index,
        index + chunkSize,
      ),
    );
  }

  return chunks;
}

async function runWithRetry<T>(
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= RETRIES;
    attempt++
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < RETRIES) {
        await sleep(
          attempt * 2500,
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "AI provider request failed.",
      );
}

/* -------------------------------------------------------
   PRIMARY AI SUMMARY
   Uses GPT-OSS through Hugging Face Inference Providers.
------------------------------------------------------- */

async function generateWithChatModel(
  text: string,
  hf: InferenceClient,
): Promise<string> {
  const result =
    await runWithRetry(
      () =>
        hf.chatCompletion({
          model: CHAT_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a scientific document summarization system. " +
                "Summarize only the information present in the supplied document text. " +
                "Do not invent facts, numbers, findings, locations, methods, or conclusions. " +
                "Preserve important scientific terminology and numerical findings. " +
                "Return one clear professional paragraph followed by concise key points.",
            },
            {
              role: "user",
              content:
                "Create a faithful scientific summary of this PDF text.\n\n" +
                "Requirements:\n" +
                "1. Identify the research purpose.\n" +
                "2. Describe the main data or methods.\n" +
                "3. State the important results or findings.\n" +
                "4. Mention the main scientific significance.\n" +
                "5. Do not add information that is not contained in the source.\n\n" +
                "DOCUMENT TEXT:\n\n" +
                text,
            },
          ],
          max_tokens: 900,
          temperature: 0.1,
        }),
    );

  const content =
    result.choices?.[0]
      ?.message?.content;

  const summary = String(
    content ?? "",
  )
    .trim();

  if (!summary) {
    throw new Error(
      "The primary AI model returned an empty summary.",
    );
  }

  return summary;
}

/* -------------------------------------------------------
   FALLBACK SUMMARIZER
   Uses Hugging Face's documented summarization model.
------------------------------------------------------- */

async function generateWithBart(
  text: string,
  hf: InferenceClient,
): Promise<string> {
  const chunks =
    splitText(
      text,
      BART_CHUNK_SIZE,
    );

  const summaries: string[] = [];

  for (
    const chunk of chunks
  ) {
    if (
      chunk.trim().length < 100
    ) {
      continue;
    }

    const result =
      await runWithRetry(
        () =>
          hf.summarization({
            model:
              SUMMARY_MODEL,
            provider:
              "hf-inference",
            inputs: chunk,
          }),
      );

    const summary =
      result.summary_text?.trim();

    if (summary) {
      summaries.push(summary);
    }
  }

  if (
    summaries.length === 0
  ) {
    throw new Error(
      "The fallback summarization model returned no summary.",
    );
  }

  return summaries.join(" ");
}

/* -------------------------------------------------------
   API ROUTE
------------------------------------------------------- */

export async function POST(
  request: Request,
) {
  let documentId = "";

  try {
    /* ---------------------------------------------------
       ADMIN AUTH
    --------------------------------------------------- */

    const session = await auth();

    if (
      !session?.user?.email ||
      session.user.email !==
        process.env.ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized. Please log in as administrator.",
        } satisfies SummaryResponse,
        { status: 401 },
      );
    }

    /* ---------------------------------------------------
       HF TOKEN
    --------------------------------------------------- */

    const hfToken =
      process.env.HF_TOKEN;

    if (!hfToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "HF_TOKEN is not configured in Vercel.",
        } satisfies SummaryResponse,
        { status: 500 },
      );
    }

    /* ---------------------------------------------------
       HF CLIENT
    --------------------------------------------------- */

    const hf =
      new InferenceClient(
        hfToken,
      );

    /* ---------------------------------------------------
       REQUEST
    --------------------------------------------------- */

    const body =
      (await request.json()) as {
        documentId?: string;
      };

    documentId = String(
      body.documentId ?? "",
    ).trim();

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "documentId is required.",
        } satisfies SummaryResponse,
        { status: 400 },
      );
    }

    /* ---------------------------------------------------
       DATABASE
    --------------------------------------------------- */

    await connectDB();

    const document =
      await DocumentModel.findById(
        documentId,
      );

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Document not found.",
        } satisfies SummaryResponse,
        { status: 404 },
      );
    }

    if (
      !document.fileUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This document has no Vercel Blob file URL.",
        } satisfies SummaryResponse,
        { status: 400 },
      );
    }

    if (
      !document.fileName
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AI summary currently supports PDF documents only.",
        } satisfies SummaryResponse,
        { status: 400 },
      );
    }

    /* ---------------------------------------------------
       MARK PROCESSING
    --------------------------------------------------- */

    document.aiStatus =
      "PROCESSING";

    await document.save();

    /* ---------------------------------------------------
       DOWNLOAD PDF FROM VERCEL BLOB
    --------------------------------------------------- */

    const pdfResponse =
      await fetch(
        document.fileUrl,
        {
          cache: "no-store",
        },
      );

    if (!pdfResponse.ok) {
      throw new Error(
        `Unable to download the PDF from Vercel Blob. HTTP ${pdfResponse.status}.`,
      );
    }

    const pdfArrayBuffer =
      await pdfResponse.arrayBuffer();

    if (
      pdfArrayBuffer.byteLength ===
      0
    ) {
      throw new Error(
        "The stored PDF is empty.",
      );
    }

    const pdfBuffer =
      Buffer.from(
        pdfArrayBuffer,
      );

    /* ---------------------------------------------------
       EXTRACT PDF TEXT
    --------------------------------------------------- */

    const parser =
      new PDFParse({
        data: pdfBuffer,
      });

    let extractedText = "";

    try {
      const result =
        await parser.getText();

      extractedText =
        result.text || "";
    } finally {
      await parser.destroy();
    }

    extractedText =
      extractedText
        .replace(/\s+/g, " ")
        .trim();

    if (!extractedText) {
      throw new Error(
        "No readable text could be extracted from this PDF.",
      );
    }

    /* ---------------------------------------------------
       LIMIT DOCUMENT SIZE
    --------------------------------------------------- */

    extractedText =
      extractedText.slice(
        0,
        MAX_PDF_TEXT,
      );

    /* ---------------------------------------------------
       PRIMARY MODEL
    --------------------------------------------------- */

    let finalSummary = "";

    try {
      finalSummary =
        await generateWithChatModel(
          extractedText,
          hf,
        );
    } catch (primaryError) {
      console.error(
        "Primary AI summarizer failed:",
        primaryError,
      );

      /* -----------------------------------------------
         FALLBACK MODEL
      ----------------------------------------------- */

      finalSummary =
        await generateWithBart(
          extractedText,
          hf,
        );
    }

    finalSummary =
      finalSummary
        .replace(/\s+/g, " ")
        .trim();

    if (!finalSummary) {
      throw new Error(
        "AI returned an empty summary.",
      );
    }

    /* ---------------------------------------------------
       SAVE RESULT
    --------------------------------------------------- */

    document.aiSummary =
      finalSummary;

    document.aiStatus =
      "COMPLETE";

    document.aiProcessedAt =
      new Date();

    await document.save();

    return NextResponse.json(
      {
        success: true,
        message:
          "AI summary generated successfully.",
        documentId:
          document._id.toString(),
        aiStatus:
          document.aiStatus,
        aiSummary:
          document.aiSummary,
      } satisfies SummaryResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "POST /api/ai/summarize error:",
      error,
    );

    if (documentId) {
      try {
        await connectDB();

        await DocumentModel.findByIdAndUpdate(
          documentId,
          {
            aiStatus:
              "FAILED",
          },
        );
      } catch (statusError) {
        console.error(
          "Could not update AI status:",
          statusError,
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "AI summary generation failed.",
      } satisfies SummaryResponse,
      { status: 500 },
    );
  }
}