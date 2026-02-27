import { NextRequest, NextResponse } from "next/server"
import {
  readFurniture,
  writeFurniture,
  FurnitureData,
} from "@/lib/projectStorage"

export async function GET() {
  try {
    const kvData = await readFurniture()
    if (kvData) {
      return NextResponse.json(kvData)
    }
    // If no KV data, return null to signal client to use static file
    return NextResponse.json(null)
  } catch (error) {
    console.error("Error reading furniture data:", error)
    return NextResponse.json(null)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: FurnitureData = await request.json()

    const success = await writeFurniture(data)
    if (success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: "KV storage not available" },
      { status: 500 },
    )
  } catch (error) {
    console.error("Error saving furniture data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save data" },
      { status: 500 },
    )
  }
}
