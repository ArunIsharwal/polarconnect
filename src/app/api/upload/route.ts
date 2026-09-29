// import { NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";
// import crypto from "crypto";

// import connectDB from "@/lib/mongodb";
// import DocumentModel from "@/models/Document";

// import { auth } from "../../../../auth";

// const MAX_FILE_SIZE = 100 * 1024 * 1024;

// const ALLOWED_EXTENSIONS = [
//   ".pdf",
//   ".csv",
//   ".png",
//   ".jpg",
//   ".jpeg",
//   ".mp4",
//   ".mov",
// ];

// export async function POST(request: Request) {
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

//     // -----------------------------------------
//     // DATABASE
//     // -----------------------------------------

//     await connectDB();

//     // -----------------------------------------
//     // FORM DATA
//     // -----------------------------------------

//     const formData =
//       await request.formData();

//     const file = formData.get("file");

//     const title = String(
//       formData.get("title") || "",
//     ).trim();

//     const contentType = String(
//       formData.get("contentType") ||
//         "REPORT",
//     );

//     const region = String(
//       formData.get("region") ||
//         "ANTARCTICA",
//     );

//     const yearValue = String(
//       formData.get("year") || "",
//     );

//     const description = String(
//       formData.get("description") || "",
//     );

//     const tagsValue = String(
//       formData.get("tags") || "",
//     );

//     // -----------------------------------------
//     // VALIDATION
//     // -----------------------------------------

//     if (!(file instanceof File)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No file was uploaded",
//         },
//         { status: 400 },
//       );
//     }

//     if (!title) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Title is required",
//         },
//         { status: 400 },
//       );
//     }

//     if (file.size === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Uploaded file is empty",
//         },
//         { status: 400 },
//       );
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "File size must be 100 MB or less",
//         },
//         { status: 400 },
//       );
//     }

//     const originalName = file.name;

//     const extension = path
//       .extname(originalName)
//       .toLowerCase();

//     if (
//       !ALLOWED_EXTENSIONS.includes(
//         extension,
//       )
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: `File type ${extension} is not supported`,
//         },
//         { status: 400 },
//       );
//     }

//     // -----------------------------------------
//     // STORE FILE
//     // -----------------------------------------

//     const uniqueName = `${crypto.randomUUID()}${extension}`;

//     const uploadDirectory =
//       path.join(
//         process.cwd(),
//         "public",
//         "documents",
//       );

//     await fs.mkdir(
//       uploadDirectory,
//       { recursive: true },
//     );

//     const filePath = path.join(
//       uploadDirectory,
//       uniqueName,
//     );

//     const arrayBuffer =
//       await file.arrayBuffer();

//     const buffer =
//       Buffer.from(arrayBuffer);

//     await fs.writeFile(
//       filePath,
//       buffer,
//     );

//     const fileUrl =
//       `/documents/${uniqueName}`;

//     // -----------------------------------------
//     // METADATA
//     // -----------------------------------------

//     const tags = tagsValue
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter(Boolean);

//     const year = yearValue
//       ? Number(yearValue)
//       : undefined;

//     // -----------------------------------------
//     // SAVE DOCUMENT
//     // -----------------------------------------

//     try {
//       const document =
//         await DocumentModel.create({
//           title,
//           contentType,
//           region,
//           year,
//           description,
//           tags,
//           fileName: originalName,
//           fileUrl,
//           status: "PENDING",
//         });

//       return NextResponse.json(
//         {
//           success: true,
//           message:
//             "File uploaded successfully",
//           document,
//         },
//         { status: 201 },
//       );
//     } catch (databaseError) {
//       // Delete the uploaded file if MongoDB
//       // creation fails.
//       try {
//         await fs.unlink(filePath);
//       } catch (deleteError) {
//         console.error(
//           "Failed to remove orphaned file:",
//           deleteError,
//         );
//       }

//       throw databaseError;
//     }
//   } catch (error) {
//     console.error(
//       "POST /api/upload error:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Upload failed",
//         error:
//           error instanceof Error
//             ? error.message
//             : String(error),
//       },
//       { status: 500 },
//     );
//   }
// }


// import {
//   handleUpload,
//   type HandleUploadBody,
// } from "@vercel/blob/client";

// import { NextResponse } from "next/server";
// import path from "path";

// import connectDB from "@/lib/mongodb";
// import DocumentModel from "@/models/Document";

// import { auth } from "../../../../auth";

// export const runtime = "nodejs";

// const MAX_FILE_SIZE = 100 * 1024 * 1024;

// const ALLOWED_EXTENSIONS = [
//   ".pdf",
//   ".csv",
//   ".png",
//   ".jpg",
//   ".jpeg",
//   ".mp4",
//   ".mov",
// ];

// const MIME_TYPES: Record<string, string> = {
//   ".pdf": "application/pdf",
//   ".csv": "text/csv",
//   ".png": "image/png",
//   ".jpg": "image/jpeg",
//   ".jpeg": "image/jpeg",
//   ".mp4": "video/mp4",
//   ".mov": "video/quicktime",
// };

// const ALLOWED_CONTENT_TYPES = [
//   "application/pdf",
//   "text/csv",
//   "image/png",
//   "image/jpeg",
//   "video/mp4",
//   "video/quicktime",
// ];

// type UploadMetadata = {
//   fileName: string;
//   title: string;
//   contentType: string;
//   region: string;
//   year?: number;
//   description: string;
//   tags: string[];
// };

// function parseClientPayload(
//   clientPayload: string | null | undefined,
// ): UploadMetadata {
//   if (!clientPayload) {
//     throw new Error(
//       "Upload metadata is missing",
//     );
//   }

//   let value: unknown;

//   try {
//     value = JSON.parse(clientPayload);
//   } catch {
//     throw new Error(
//       "Upload metadata is invalid",
//     );
//   }

//   if (
//     typeof value !== "object" ||
//     value === null
//   ) {
//     throw new Error(
//       "Upload metadata is invalid",
//     );
//   }

//   const data =
//     value as Record<string, unknown>;

//   const fileName = String(
//     data.fileName ?? "",
//   ).trim();

//   const title = String(
//     data.title ?? "",
//   ).trim();

//   const contentType = String(
//     data.contentType ?? "",
//   ).trim();

//   const region = String(
//     data.region ?? "",
//   ).trim();

//   const description = String(
//     data.description ?? "",
//   ).trim();

//   const tags = Array.isArray(data.tags)
//     ? data.tags
//         .map((tag) =>
//           String(tag).trim(),
//         )
//         .filter(Boolean)
//         .slice(0, 20)
//     : [];

//   const rawYear = data.year;

//   const year =
//     rawYear === undefined ||
//     rawYear === null ||
//     String(rawYear).trim() === ""
//       ? undefined
//       : Number(rawYear);

//   if (!fileName) {
//     throw new Error(
//       "File name is required",
//     );
//   }

//   if (!title) {
//     throw new Error(
//       "Title is required",
//     );
//   }

//   if (
//     !ALLOWED_CONTENT_TYPES.includes(
//       contentType,
//     )
//   ) {
//     throw new Error(
//       "Unsupported content type",
//     );
//   }

//   if (!region) {
//     throw new Error(
//       "Region is required",
//     );
//   }

//   if (
//     year !== undefined &&
//     (!Number.isInteger(year) ||
//       year < 1900 ||
//       year > 2100)
//   ) {
//     throw new Error(
//       "Invalid year",
//     );
//   }

//   if (title.length > 200) {
//     throw new Error(
//       "Title is too long",
//     );
//   }

//   if (description.length > 5000) {
//     throw new Error(
//       "Description is too long",
//     );
//   }

//   return {
//     fileName,
//     title,
//     contentType,
//     region,
//     year,
//     description,
//     tags,
//   };
// }

// export async function POST(
//   request: Request,
// ) {
//   try {
//     // -----------------------------------------
//     // READ BLOB CLIENT UPLOAD REQUEST
//     // -----------------------------------------

//     const body =
//       (await request.json()) as HandleUploadBody;

//     const jsonResponse =
//       await handleUpload({
//         body,
//         request,

//         // ---------------------------------------
//         // AUTHENTICATE BEFORE GENERATING TOKEN
//         // ---------------------------------------

//         onBeforeGenerateToken: async (
//           pathname,
//           clientPayload,
//         ) => {
//           const session = await auth();

//           if (
//             !session?.user?.email ||
//             session.user.email !==
//               process.env.ADMIN_EMAIL
//           ) {
//             throw new Error(
//               "Unauthorized",
//             );
//           }

//           const extension =
//             path
//               .extname(pathname)
//               .toLowerCase();

//           if (
//             !ALLOWED_EXTENSIONS.includes(
//               extension,
//             )
//           ) {
//             throw new Error(
//               `File type ${extension} is not supported`,
//             );
//           }

//           const metadata =
//             parseClientPayload(
//               clientPayload,
//             );

//           const expectedMimeType =
//             MIME_TYPES[extension];

//           if (
//             metadata.contentType !==
//             expectedMimeType
//           ) {
//             throw new Error(
//               "File content type does not match the file extension",
//             );
//           }

//           return {
//             allowedContentTypes: [
//               expectedMimeType,
//             ],

//             maximumSizeInBytes:
//               MAX_FILE_SIZE,

//             addRandomSuffix: false,

//             tokenPayload:
//               JSON.stringify(
//                 metadata,
//               ),
//           };
//         },

//         // ---------------------------------------
//         // BLOB UPLOAD COMPLETION
//         // ---------------------------------------
//         // IMPORTANT:
//         // Do NOT call auth() here.
//         // This callback is invoked by Vercel
//         // Blob after the upload completes.
//         // ---------------------------------------

//         onUploadCompleted: async ({
//           blob,
//           tokenPayload,
//         }) => {
//           try {
//             console.log(
//               "Blob upload completed:",
//               blob.url,
//             );

//             const metadata =
//               parseClientPayload(
//                 tokenPayload,
//               );

//             await connectDB();

//             // Prevent duplicate records if
//             // the completion callback is retried.
//             const existing =
//               await DocumentModel.findOne({
//                 fileUrl: blob.url,
//               });

//             if (existing) {
//               console.log(
//                 "Document already exists:",
//                 blob.url,
//               );

//               return;
//             }

//             const document =
//               await DocumentModel.create({
//                 title: metadata.title,
//                 contentType:
//                   metadata.contentType,
//                 region: metadata.region,
//                 year: metadata.year,
//                 description:
//                   metadata.description,
//                 tags: metadata.tags,
//                 fileName:
//                   metadata.fileName,
//                 fileUrl: blob.url,
//                 status: "PENDING",
//               });

//             console.log(
//               "MongoDB document created:",
//               document._id.toString(),
//             );
//           } catch (error) {
//             console.error(
//               "Failed to create MongoDB document after Blob upload:",
//               error,
//             );

//             throw error;
//           }
//         },
//       });

//     return NextResponse.json(
//       jsonResponse,
//     );
//   } catch (error) {
//     console.error(
//       "POST /api/upload error:",
//       error,
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error instanceof Error
//             ? error.message
//             : "Upload failed",
//       },
//       { status: 400 },
//     );
//   }
// }


import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import path from "path";

import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

import { auth } from "../../../../auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".mp4",
  ".mov",
];

const ALLOWED_CONTENT_TYPES = [
  "REPORT",
  "DATASET",
  "PUBLICATION",
  "MEDIA",
];

export async function POST(
  request: Request,
) {
  let uploadedBlobUrl = "";

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
    // CHECK BLOB TOKEN
    // -----------------------------------------

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
        { status: 500 },
      );
    }

    // -----------------------------------------
    // DATABASE
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // IMPORTANT:
    // READ MULTIPART FORMDATA
    // NEVER request.json() HERE
    // -----------------------------------------

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const title = String(
      formData.get("title") || "",
    ).trim();

    const contentType =
      String(
        formData.get(
          "contentType",
        ) || "REPORT",
      ).toUpperCase();

    const region = String(
      formData.get("region") ||
        "ANTARCTICA",
    ).trim();

    const yearValue = String(
      formData.get("year") || "",
    ).trim();

    const description =
      String(
        formData.get(
          "description",
        ) || "",
      ).trim();

    const tagsValue = String(
      formData.get("tags") || "",
    ).trim();

    // -----------------------------------------
    // FILE VALIDATION
    // -----------------------------------------

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No file was uploaded.",
        },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title is required.",
        },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_CONTENT_TYPES.includes(
        contentType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Unsupported content type: ${contentType}`,
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Uploaded file is empty.",
        },
        { status: 400 },
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "File size must be 100 MB or less.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // EXTENSION
    // -----------------------------------------

    const originalName =
      file.name;

    const extension =
      path
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
          message:
            `File type ${extension} is not supported.`,
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // MEDIA-SPECIFIC VALIDATION
    // -----------------------------------------

    if (
      contentType === "MEDIA" &&
      ![
        ".png",
        ".jpg",
        ".jpeg",
        ".mp4",
        ".mov",
      ].includes(extension)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "MEDIA records must be image or video files.",
        },
        { status: 400 },
      );
    }

    // -----------------------------------------
    // TAGS
    // -----------------------------------------

    const tags =
      tagsValue
        .split(",")
        .map(
          (tag) =>
            tag.trim(),
        )
        .filter(Boolean);

    // -----------------------------------------
    // YEAR
    // -----------------------------------------

    const parsedYear =
      yearValue
        ? Number(yearValue)
        : undefined;

    const year =
      parsedYear !== undefined &&
      Number.isFinite(parsedYear)
        ? parsedYear
        : undefined;

    // -----------------------------------------
    // UPLOAD TO VERCEL BLOB
    // -----------------------------------------

    const blob =
      await put(
        `documents/${cryptoRandomName()}${extension}`,
        file,
        {
          access: "public",
          contentType:
            file.type ||
            "application/octet-stream",
          addRandomSuffix: false,
        },
      );

    uploadedBlobUrl =
      blob.url;

    // -----------------------------------------
    // SAVE MONGODB RECORD
    // -----------------------------------------

    try {
      const document =
        await DocumentModel.create(
          {
            title,
            contentType,
            region,
            year,
            description,
            tags,
            fileName:
              originalName,
            fileUrl:
              uploadedBlobUrl,
            status: "PENDING",
          },
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "File uploaded successfully.",
          document,
        },
        { status: 201 },
      );
    } catch (databaseError) {
      // ---------------------------------------
      // REMOVE BLOB IF DATABASE SAVE FAILS
      // ---------------------------------------

      if (
        uploadedBlobUrl
      ) {
        try {
          await del(
            uploadedBlobUrl,
          );
        } catch (deleteError) {
          console.error(
            "Failed to delete orphaned Blob:",
            deleteError,
          );
        }
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
        message:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      { status: 500 },
    );
  }
}

/* ---------------------------------------------
   SAFE UNIQUE BLOB NAME
--------------------------------------------- */

function cryptoRandomName() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}