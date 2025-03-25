import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/db"
import { handleApiError } from "../error-handler"

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    return handleApiError(error, "Failed to fetch dashboard statistics")
  }
}

