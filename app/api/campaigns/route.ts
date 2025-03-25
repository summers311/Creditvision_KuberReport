import { NextResponse } from "next/server"
import { getCampaignStats } from "@/lib/db"
import { handleApiError } from "../error-handler"

export async function GET() {
  try {
    const campaigns = await getCampaignStats()
    return NextResponse.json(campaigns)
  } catch (error) {
    return handleApiError(error, "Failed to fetch campaign statistics")
  }
}

