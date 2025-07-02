import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch all hospital requirements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const urgent = searchParams.get("urgent")

    let query = `
      SELECT 
        hr.hosp_ID,
        hr.hosp_name,
        hr.hosp_needed_Bgrp,
        hr.hosp_needed_qnty,
        h.City_ID,
        c.City_name
      FROM Hospital_Info_2 hr
      LEFT JOIN Hospital_Info_1 h ON hr.hosp_ID = h.hosp_ID
      LEFT JOIN City c ON h.City_ID = c.City_ID
    `

    if (urgent === "true") {
      query += " WHERE hr.hosp_needed_qnty > 30"
    }

    query += " ORDER BY hr.hosp_needed_qnty DESC, hr.hosp_name"

    const result = await sql(query)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error fetching hospital requirements:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch hospital requirements" }, { status: 500 })
  }
}

// POST - Create new hospital requirement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hosp_ID, hosp_needed_Bgrp, hosp_needed_qnty } = body

    if (!hosp_ID || !hosp_needed_Bgrp || hosp_needed_qnty === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get hospital name
    const hospitalResult = await sql("SELECT hosp_name FROM Hospital_Info_1 WHERE hosp_ID = $1", [hosp_ID])

    if (hospitalResult.length === 0) {
      return NextResponse.json({ success: false, error: "Hospital not found" }, { status: 404 })
    }

    const hosp_name = hospitalResult[0].hosp_name

    const result = await sql(
      `INSERT INTO Hospital_Info_2 (hosp_ID, hosp_name, hosp_needed_Bgrp, hosp_needed_qnty)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [hosp_ID, hosp_name, hosp_needed_Bgrp, hosp_needed_qnty],
    )

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating hospital requirement:", error)
    return NextResponse.json({ success: false, error: "Failed to create hospital requirement" }, { status: 500 })
  }
}
