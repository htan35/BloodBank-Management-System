import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all recipients with related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bloodGroup = searchParams.get("bloodGroup")
    const search = searchParams.get("search")

    let query = `
      SELECT 
        r.reci_ID,
        r.reci_name,
        r.reci_age,
        r.reci_Brgp,
        r.reci_Bqnty,
        r.reci_sex,
        r.reci_reg_date,
        r.reco_ID,
        r.City_ID,
        r.M_id,
        c.City_name,
        m.mName as manager_name
      FROM Recipient r
      LEFT JOIN City c ON r.City_ID = c.City_ID
      LEFT JOIN BB_Manager m ON r.M_id = m.M_id
    `

    const conditions = []
    const params: any[] = []

    if (bloodGroup && bloodGroup !== "all") {
      conditions.push("r.reci_Brgp = $" + (params.length + 1))
      params.push(bloodGroup)
    }

    if (search) {
      conditions.push(
        "(r.reci_name ILIKE $" + (params.length + 1) + " OR r.reci_ID::text LIKE $" + (params.length + 2) + ")",
      )
      params.push(`%${search}%`, `%${search}%`)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY r.reci_reg_date DESC"

    const result = await sql(query, params)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error fetching recipients:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch recipients" }, { status: 500 })
  }
}

// POST - Create new recipient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reci_name, reci_age, reci_Brgp, reci_Bqnty, reci_sex, reco_ID, City_ID, M_id } = body

    if (!reci_name || !reci_age || !reci_Brgp || !reci_Bqnty || !reci_sex || !reco_ID || !City_ID || !M_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get the next available ID
    const maxIdResult = await sql("SELECT COALESCE(MAX(reci_ID), 10000) + 1 as next_id FROM Recipient")
    const nextId = maxIdResult[0].next_id

    const result = await sql(
      `INSERT INTO Recipient (reci_ID, reci_name, reci_age, reci_Brgp, reci_Bqnty, reco_ID, City_ID, M_id, reci_sex, reci_reg_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
       RETURNING *`,
      [nextId, reci_name, reci_age, reci_Brgp, reci_Bqnty, reco_ID, City_ID, M_id, reci_sex],
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating recipient:", error)
    return NextResponse.json({ success: false, error: "Failed to create recipient" }, { status: 500 })
  }
}
