import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all hospitals with related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let query = `
      SELECT 
        h.hosp_ID,
        h.hosp_name,
        h.City_ID,
        h.M_id,
        c.City_name,
        m.mName as manager_name
      FROM Hospital_Info_1 h
      LEFT JOIN City c ON h.City_ID = c.City_ID
      LEFT JOIN BB_Manager m ON h.M_id = m.M_id
    `

    const params: any[] = []

    if (search) {
      query += " WHERE (h.hosp_name ILIKE $1 OR c.City_name ILIKE $2)"
      params.push(`%${search}%`, `%${search}%`)
    }

    query += " ORDER BY h.hosp_name"

    const result = await sql(query, params)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch hospitals" }, { status: 500 })
  }
}

// POST - Create new hospital
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hosp_name, City_ID, M_id } = body

    if (!hosp_name || !City_ID || !M_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get the next available ID
    const maxIdResult = await sql("SELECT COALESCE(MAX(hosp_ID), 0) + 1 as next_id FROM Hospital_Info_1")
    const nextId = maxIdResult[0].next_id

    const result = await sql(
      `INSERT INTO Hospital_Info_1 (hosp_ID, hosp_name, City_ID, M_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nextId, hosp_name, City_ID, M_id],
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating hospital:", error)
    return NextResponse.json({ success: false, error: "Failed to create hospital" }, { status: 500 })
  }
}
