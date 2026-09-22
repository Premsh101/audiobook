import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const genre = searchParams.get("genre") ?? "";

    const books = await db.book.findMany({
      where: {
        status: "PUBLISHED",
        ...(genre && genre !== "All" ? { genre } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { author: { contains: q, mode: "insensitive" } },
                { genre: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: [{ featured: "desc" }, { title: "asc" }]
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Book catalog query failed", error);
    return NextResponse.json(
      { error: "Book catalog is temporarily unavailable" },
      { status: 503 }
    );
  }
}
