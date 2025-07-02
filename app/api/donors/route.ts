import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all donors with related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bloodGroup = searchParams.get("bloodGroup")
    const search = searchParams.get("search")

    let query = `
      SELECT 
        bd.bd_ID,
        bd.bd_name,
        bd.bd_age,
        bd.bd_sex,
        bd.bd_Bgroup,
        bd.bd_reg_date,
        bd.reco_ID,
        bd.City_ID,
        c.City_name,
        rs.reco_Name as staff_name
      FROM Blood_Donor bd
      LEFT JOIN City c ON bd.City_ID = c.City_ID
      LEFT JOIN Recording_Staff rs ON bd.reco_ID = rs.reco_ID
    `

    const conditions = []
    const params: any[] = []

    if (bloodGroup && bloodGroup !== "all") {
      conditions.push("bd.bd_Bgroup = $" + (params.length + 1))
      params.push(bloodGroup)
    }

    if (search) {
      conditions.push(
        "(bd.bd_name ILIKE $" + (params.length + 1) + " OR bd.bd_ID::text LIKE $" + (params.length + 2) + ")",
      )
      params.push(`%${search}%`, `%${search}%`)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY bd.bd_reg_date DESC"

    const result = await sql.query(query, params)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error fetching donors:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch donors" }, { status: 500 })
  }
}

// POST - Create new donor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bd_name, bd_age, bd_sex, bd_Bgroup, reco_ID, City_ID } = body

    // Validate required fields
    if (!bd_name || !bd_age || !bd_sex || !bd_Bgroup || !reco_ID || !City_ID) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get the next available ID
    const maxIdResult = await sql.query("SELECT COALESCE(MAX(bd_ID), 150000) + 1 AS next_id FROM Blood_Donor")
    const nextId = maxIdResult[0].next_id

    const result = await sql.query(
      `INSERT INTO Blood_Donor (bd_ID, bd_name, bd_age, bd_sex, bd_Bgroup, bd_reg_date, reco_ID, City_ID)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7) RETURNING *`,
      [nextId, bd_name, bd_age, bd_sex, bd_Bgroup, reco_ID, City_ID],
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating donor:", error)
    return NextResponse.json({ success: false, error: "Failed to create donor" }, { status: 500 })
  }
}
