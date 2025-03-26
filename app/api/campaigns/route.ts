import { NextResponse } from "next/server"
import { getCampaignStats } from "@/lib/db"
import { handleApiError } from "../error-handler"

export async function GET(request: Request) {
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    
    // Get paginated campaign stats
    const result = await getCampaignStats(page, limit)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, "Failed to fetch campaign statistics")
  }
}
