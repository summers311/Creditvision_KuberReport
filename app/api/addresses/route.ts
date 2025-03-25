import { NextResponse } from "next/server"
import { getAddressData } from "@/lib/db"
import { handleApiError } from "../error-handler"

// Simple ZIP code to lat/lng mapping for demo purposes
// In a production app, you would use a proper geocoding service
const zipCodeMapping = {
  // Sample mappings - you would need a more comprehensive database
  "18951": { lat: 40.4406, lng: -75.3412 },
  "10706": { lat: 41.0037, lng: -73.8751 },
  "12833": { lat: 43.1009, lng: -73.8457 },
  "85224": { lat: 33.3062, lng: -111.8413 },
  "80045": { lat: 39.7392, lng: -104.9903 },
  // Add more as needed
}

export async function GET() {
  try {
    const addresses = await getAddressData()

    // Add approximate coordinates based on ZIP code
    const addressesWithCoords = (addresses as any[]).map((addr) => {
      const zip5 = addr.ZIP.substring(0, 5)
      const coords = zipCodeMapping[zip5] || {
        // Default to center of US if ZIP not found
        lat: 39.8283,
        lng: -98.5795,
      }

      return {
        id: addr.id,
        address: addr.address,
        city: addr.CITY,
        state: addr.ST,
        zip: addr.ZIP,
        lat: coords.lat,
        lng: coords.lng,
      }
    })

    return NextResponse.json(addressesWithCoords)
  } catch (error) {
    return handleApiError(error, "Failed to fetch address data")
  }
}

