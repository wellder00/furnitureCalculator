import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const filePath = path.join(process.cwd(), "public", "furniture.json")
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving furniture data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save data" },
      { status: 500 }
    )
  }
}
