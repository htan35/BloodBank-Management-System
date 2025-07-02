import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all cities
export async function GET() {
  try {
    // neon 🔌 → use sql.query(...) for conventional parameterised calls
    const { rows } = await sql.query("SELECT * FROM City ORDER BY City_name")
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cities" }, { status: 500 })
  }
}
