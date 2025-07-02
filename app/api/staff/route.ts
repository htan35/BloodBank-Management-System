import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Fetch staff data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let rows: any[] = []

    switch (type) {
      case "recording": {
        const { rows: r } = await sql.query("SELECT * FROM Recording_Staff ORDER BY reco_Name")
        rows = r
        break
      }
      case "managers": {
        const { rows: r } = await sql.query("SELECT * FROM BB_Manager ORDER BY mName")
        rows = r
        break
      }
      case "disease-finders": {
        const { rows: r } = await sql.query("SELECT * FROM DiseaseFinder ORDER BY dfind_name")
        rows = r
        break
      }
      default: {
        // Return a unified list when no (or unknown) type filter is supplied
        const [{ rows: recording }, { rows: managers }, { rows: finders }] = await Promise.all([
          sql.query(
            "SELECT reco_ID  AS id, reco_Name  AS name, reco_phNo AS phone, 'recording'      AS type FROM Recording_Staff",
          ),
          sql.query(
            "SELECT M_id     AS id, mName      AS name, m_phNo   AS phone, 'manager'        AS type FROM BB_Manager",
          ),
          sql.query(
            "SELECT dfind_ID AS id, dfind_name AS name, dfind_PhNo AS phone, 'disease-finder' AS type FROM DiseaseFinder",
          ),
        ])
        rows = [...recording, ...managers, ...finders]
      }
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 })
  }
}
