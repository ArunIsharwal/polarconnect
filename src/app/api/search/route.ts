import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DocumentModel from "@/models/Document";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    await connectDB();

    if (!query) {
      return NextResponse.json({
        success: true,
        count: 0,
        documents: [],
      });
    }

    const regex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

    const documents = await DocumentModel.find({
      status: "APPROVED",
      $or: [
        { title: regex },
        { description: regex },
        { region: regex },
        { contentType: regex },
        { fileName: regex },
        { tags: regex },
        { aiSummary: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("GET /api/search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}