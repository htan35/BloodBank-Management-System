import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

/**
 * Try the supplied query; if it fails because a table is missing
 * we return a sensible default so the dashboard still loads.
 */
async function safeQuery<T>(query: string, params: any[] = [], fallback: T): Promise<T> {
  try {
    // Neon returns the rows array directly.
    const rows = await (sql as any).query(query, params)
    return rows as unknown as T
  } catch (err) {
    // Error code 42P01 ⇒ "undefined_table"
    if ((err as { code?: string }).code === "42P01") {
      console.warn("Table not found while running:", query.split("\n")[0].trim())
      return fallback
    }
    throw err
  }
}

export async function GET() {
  try {
    /* ---------- TOTAL COUNTS ---------- */
    const donorRows = await safeQuery<{ count: string }[]>(
      "SELECT COUNT(*) AS count FROM Blood_Donor",
      [],
      [{ count: "0" }],
    )
    const recipientRows = await safeQuery<{ count: string }[]>(
      "SELECT COUNT(*) AS count FROM Recipient",
      [],
      [{ count: "0" }],
    )
    const hospitalRows = await safeQuery<{ count: string }[]>(
      "SELECT COUNT(*) AS count FROM Hospital_Info_1",
      [],
      [{ count: "0" }],
    )
    const specimenRows = await safeQuery<{ count: string }[]>(
      "SELECT COUNT(*) AS count FROM BloodSpecimen WHERE status = 1",
      [],
      [{ count: "0" }],
    )

    /* ---------- BLOOD-GROUP INVENTORY ---------- */
    const bloodGroupStats = await safeQuery<{ b_group: string; available: number }[]>(
      `SELECT b_group, COUNT(*) AS available
       FROM BloodSpecimen WHERE status = 1
       GROUP BY b_group`,
      [],
      [],
    )

    const hospitalRequirements = await safeQuery<{ b_group: string; needed: number }[]>(
      `SELECT hosp_needed_Bgrp AS b_group, SUM(hosp_needed_qnty) AS needed
       FROM Hospital_Info_2
       GROUP BY hosp_needed_Bgrp`,
      [],
      [],
    )

    /* ---------- RECENT DONATIONS ---------- */
    const recentDonations = await safeQuery<
      { bd_id: number; bd_name: string; bd_bgroup: string; bd_reg_date: string }[]
    >(
      `SELECT bd_ID as bd_id, bd_name, bd_Bgroup as bd_bgroup, bd_reg_date
       FROM Blood_Donor
       ORDER BY bd_reg_date DESC
       LIMIT 5`,
      [],
      [],
    )

    /* ---------- URGENT REQUESTS ---------- */
    const urgentRequests = await safeQuery<{ hosp_name: string; hosp_needed_bgrp: string; hosp_needed_qnty: number }[]>(
      `SELECT hosp_name, hosp_needed_Bgrp as hosp_needed_bgrp, hosp_needed_qnty
       FROM Hospital_Info_2
       WHERE hosp_needed_qnty > 30
       ORDER BY hosp_needed_qnty DESC
       LIMIT 5`,
      [],
      [],
    )

    /* ---------- COMPOSE RESPONSE ---------- */
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    const bloodGroupData: Record<string, { available: number; needed: number }> = {}

    bloodGroups.forEach((group) => {
      const available = bloodGroupStats.find((s) => s.b_group === group)?.available ?? 0
      const needed = hospitalRequirements.find((r) => r.b_group === group)?.needed ?? 0
      bloodGroupData[group] = { available: Number(available), needed: Number(needed) }
    })

    const stats = {
      totalDonors: Number(donorRows[0].count),
      totalRecipients: Number(recipientRows[0].count),
      totalHospitals: Number(hospitalRows[0].count),
      totalSpecimens: Number(specimenRows[0].count),
      bloodGroups: bloodGroupData,
      recentDonations: recentDonations.map((d) => ({
        id: d.bd_id,
        name: d.bd_name,
        bloodGroup: d.bd_bgroup,
        date: d.bd_reg_date,
      })),
      urgentRequests: urgentRequests.map((u) => ({
        hospital: u.hosp_name,
        bloodGroup: u.hosp_needed_bgrp,
        quantity: Number(u.hosp_needed_qnty),
      })),
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
