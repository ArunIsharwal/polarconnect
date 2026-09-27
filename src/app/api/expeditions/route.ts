import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import ExpeditionModel from "@/models/Expedition";

import { auth } from "../../../../auth";

// -----------------------------------------
// GET EXPEDITIONS
// Public read-only endpoint.
// -----------------------------------------

export async function GET() {
  try {
    await connectDB();

    const expeditions =
      await ExpeditionModel.find()
        .sort({
          startDate: -1,
          createdAt: -1,
        });

    return NextResponse.json(
      {
        success: true,
        count: expeditions.length,
        expeditions,
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
      "GET /api/expeditions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch expeditions",
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
// CREATE EXPEDITION
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
      name,
      code,
      region,
      status,
      startDate,
      endDate,
      location,
      vessel,
      lead,
      organization,
      researchFocus,
      description,
      tags,
      coverImageUrl,
      latitude,
      longitude,
    } = body;

    if (
      !name ||
      typeof name !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Expedition name is required",
        },
        { status: 400 },
      );
    }

    if (
      !code ||
      typeof code !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Expedition code is required",
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

    const expedition =
      await ExpeditionModel.create({
        name: name.trim(),

        code: code
          .trim()
          .toUpperCase(),

        region:
          region || "ANTARCTICA",

        status:
          status || "PLANNED",

        startDate:
          startDate || undefined,

        endDate:
          endDate || undefined,

        location:
          location || "",

        vessel:
          vessel || "",

        lead:
          lead || "",

        organization:
          organization || "",

        researchFocus:
          researchFocus || "",

        description:
          description || "",

        tags:
          normalizedTags,

        coverImageUrl:
          coverImageUrl || "",

        latitude,
        longitude,
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Expedition created successfully",
        expedition,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/expeditions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create expedition",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}