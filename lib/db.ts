import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database utility functions
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return { success: true, data: result }
  } catch (error) {
    console.error("Database query error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Type definitions based on your SQL schema
export interface BBManager {
  M_id: number
  mName: string
  m_phNo: bigint
}

export interface RecordingStaff {
  reco_ID: number
  reco_Name: string
  reco_phNo: bigint
}

export interface City {
  City_ID: number
  City_name: string
}

export interface BloodDonor {
  bd_ID: number
  bd_name: string
  bd_age: string
  bd_sex: string
  bd_Bgroup: string
  bd_reg_date: string
  reco_ID: number
  City_ID: number
}

export interface DiseaseFinder {
  dfind_ID: number
  dfind_name: string
  dfind_PhNo: bigint
}

export interface BloodSpecimen {
  specimen_number: number
  b_group: string
  status: number
  dfind_ID: number
  M_id: number
}

export interface HospitalInfo1 {
  hosp_ID: number
  hosp_name: string
  City_ID: number
  M_id: number
}

export interface HospitalInfo2 {
  hosp_ID: number
  hosp_name: string
  hosp_needed_Bgrp: string
  hosp_needed_qnty: number
}

export interface Recipient {
  reci_ID: number
  reci_name: string
  reci_age: string
  reci_Brgp: string
  reci_Bqnty: number
  reco_ID: number
  City_ID: number
  M_id: number
  reci_sex: string
  reci_reg_date: string
}
