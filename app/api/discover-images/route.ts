import { NextResponse } from "next/server"

export async function POST() {
  try {
    const queries = [
      "travel",
      "city",
      "nature",
      "beach",
      "mountains",
      "food",
      "architecture",
      "desert",
    ]

    const randomQuery =
      queries[Math.floor(Math.random() * queries.length)]

    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${randomQuery}&per_page=20`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
        },
      }
    )

    const data = await res.json()

    // ✅ FIX هنا
    const images = data.photos || []

    const mappedImages = images.map((img: any) => ({
      url: img.src?.large || img.src?.medium || "",
      source: "pexels",
      tags: [],
      category: "feed",
    }))

    return NextResponse.json({ images: mappedImages })
  } catch (error) {
    console.error("[discover-images]", error)
    return NextResponse.json({ images: [] }, { status: 500 })
  }
}