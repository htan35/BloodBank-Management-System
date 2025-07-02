import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all blood specimens with related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bloodGroup = searchParams.get("bloodGroup")
    const status = searchParams.get("status")

    let query = `
      SELECT 
        bs.specimen_number,
        bs.b_group,
        bs.status,
        bs.dfind_ID,
        bs.M_id,
        df.dfind_name,
        m.mName as manager_name
      FROM BloodSpecimen bs
      LEFT JOIN DiseaseFinder df ON bs.dfind_ID = df.dfind_ID
      LEFT JOIN BB_Manager m ON bs.M_id = m.M_id
    `

    const conditions = []
    const params: any[] = []

    if (bloodGroup && bloodGroup !== "all") {
      conditions.push("bs.b_group = $" + (params.length + 1))
      params.push(bloodGroup)
    }

    if (status !== null && status !== undefined) {
      conditions.push("bs.status = $" + (params.length + 1))
      params.push(Number.parseInt(status))
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY bs.specimen_number DESC"

    const result = await sql(query, params)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error fetching blood specimens:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch blood specimens" }, { status: 500 })
  }
}

// POST - Create new blood specimen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { b_group, status, dfind_ID, M_id } = body

    if (!b_group || status === undefined || !dfind_ID || !M_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get the next available specimen number
    const maxIdResult = await sql("SELECT COALESCE(MAX(specimen_number), 1000) + 1 as next_id FROM BloodSpecimen")
    const nextId = maxIdResult[0].next_id

    const result = await sql(
      `INSERT INTO BloodSpecimen (specimen_number, b_group, status, dfind_ID, M_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nextId, b_group, status, dfind_ID, M_id],
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating blood specimen:", error)
    return NextResponse.json({ success: false, error: "Failed to create blood specimen" }, { status: 500 })
  }
}
