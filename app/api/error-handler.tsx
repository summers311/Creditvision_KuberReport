import { NextResponse } from "next/server"

export function handleApiError(error: any, message = "An error occurred") {
  console.error(`API error: ${message}`, error)

  // Create a more detailed error response
  const errorResponse = {
    error: message,
    details:
      process.env.NODE_ENV === "development"
        ? {
            message: error.message,
            code: error.code,
            stack: error.stack,
          }
        : undefined,
  }

  return NextResponse.json(errorResponse, { status: 500 })
}

