import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch single donor
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql.query(
      `SELECT 
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
      WHERE bd.bd_ID = $1`,
      [id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error fetching donor:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch donor" }, { status: 500 })
  }
}

// PUT - Update donor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const { bd_name, bd_age, bd_sex, bd_Bgroup, reco_ID, City_ID } = body

    const result = await sql.query(
      `UPDATE Blood_Donor 
       SET bd_name = $1, bd_age = $2, bd_sex = $3, bd_Bgroup = $4, reco_ID = $5, City_ID = $6
       WHERE bd_ID = $7
       RETURNING *`,
      [bd_name, bd_age, bd_sex, bd_Bgroup, reco_ID, City_ID, id],
    )

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating donor:", error)
    return NextResponse.json({ success: false, error: "Failed to update donor" }, { status: 500 })
  }
}

// DELETE - Delete donor
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await sql.query("DELETE FROM Blood_Donor WHERE bd_ID = $1 RETURNING bd_ID", [id])

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Donor deleted successfully" })
  } catch (error) {
    console.error("Error deleting donor:", error)
    return NextResponse.json({ success: false, error: "Failed to delete donor" }, { status: 500 })
  }
}
