import { type NextRequest, NextResponse } from "next/server"
import { getCustomers } from "@/lib/db"
import { handleApiError } from "../error-handler"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""

    const result = await getCustomers(page, limit, search)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, "Failed to fetch customers")
  }
}

