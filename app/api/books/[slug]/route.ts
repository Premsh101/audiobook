import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books as seedBooks } from "@/lib/books";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const book = await db.book.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: { chapters: { where: { status: "PUBLISHED" }, orderBy: { sequence: "asc" } } }
    });
    if (book) return NextResponse.json(book);
  } catch (error) {
    console.error("Book detail query failed", error);
  }

  const seed = seedBooks.find((item) => item.id === slug);
  if (!seed) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  return NextResponse.json({
    ...seed,
    slug: seed.id,
    access: "FREE",
    rightsType: "PUBLIC_DOMAIN",
    status: "PUBLISHED",
    featured: false,
    chapters: [{
      id: `preview-${seed.id}`,
      bookId: seed.id,
      title: "Free preview",
      sequence: 1,
      sourceTextUrl: seed.sourceUrl,
      audioUrl: seed.previewUrl,
      durationSeconds: seed.previewSeconds,
      status: "PUBLISHED"
    }]
  });
}
