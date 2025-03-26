import { NextResponse } from "next/server"
import { getAddressData } from "@/lib/db"
import { handleApiError } from "../error-handler"

// Function to generate approximate coordinates from ZIP code
// This uses a deterministic algorithm to spread points across the US based on ZIP code
function getCoordinatesFromZip(zip: string): { lat: number; lng: number } {
  // Extract the first 3 digits of the ZIP code (the "prefix")
  const zipPrefix = parseInt(zip.substring(0, 3), 10)
  
  // Map ZIP code prefixes to approximate regions in the US
  // ZIP code prefixes are roughly geographical:
  // 0xx-2xx: Northeast and Mid-Atlantic
  // 3xx-4xx: Southeast
  // 5xx-6xx: Midwest and South Central
  // 7xx-8xx: Central and Mountain
  // 9xx: West Coast and Pacific
  
  let baseLat = 39.8283 // Center of US latitude
  let baseLng = -98.5795 // Center of US longitude
  
  if (zipPrefix < 100) {
    // Northeast (New England)
    baseLat = 42.5 + (zipPrefix % 10) * 0.2
    baseLng = -71.5 + (zipPrefix % 10) * 0.3
  } else if (zipPrefix < 200) {
    // Mid-Atlantic
    baseLat = 40.0 + (zipPrefix % 100) * 0.05
    baseLng = -75.0 + (zipPrefix % 100) * 0.05
  } else if (zipPrefix < 300) {
    // Mid-Atlantic and parts of Southeast
    baseLat = 38.0 + (zipPrefix % 100) * 0.04
    baseLng = -78.0 + (zipPrefix % 100) * 0.04
  } else if (zipPrefix < 400) {
    // Southeast
    baseLat = 33.0 + (zipPrefix % 100) * 0.05
    baseLng = -82.0 + (zipPrefix % 100) * 0.05
  } else if (zipPrefix < 500) {
    // Southeast and parts of South Central
    baseLat = 32.0 + (zipPrefix % 100) * 0.05
    baseLng = -86.0 + (zipPrefix % 100) * 0.05
  } else if (zipPrefix < 600) {
    // Midwest
    baseLat = 41.0 + (zipPrefix % 100) * 0.04
    baseLng = -88.0 + (zipPrefix % 100) * 0.06
  } else if (zipPrefix < 700) {
    // South Central
    baseLat = 35.0 + (zipPrefix % 100) * 0.05
    baseLng = -92.0 + (zipPrefix % 100) * 0.05
  } else if (zipPrefix < 800) {
    // Central Plains
    baseLat = 38.0 + (zipPrefix % 100) * 0.05
    baseLng = -97.0 + (zipPrefix % 100) * 0.05
  } else if (zipPrefix < 900) {
    // Mountain West
    baseLat = 40.0 + (zipPrefix % 100) * 0.05
    baseLng = -110.0 + (zipPrefix % 100) * 0.08
  } else {
    // West Coast
    baseLat = 37.0 + (zipPrefix % 100) * 0.08
    baseLng = -122.0 + (zipPrefix % 100) * 0.05
  }
  
  // Add some variation based on the last 2 digits of the ZIP
  const lastDigits = parseInt(zip.substring(3, 5), 10)
  const latVariation = (lastDigits % 10) * 0.02
  const lngVariation = (lastDigits % 10) * 0.03
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  }
}

// Some known ZIP codes for major cities to make the map more accurate
const knownZipCodes: Record<string, { lat: number; lng: number }> = {
  // New York area
  "100": { lat: 40.7128, lng: -74.0060 }, // Manhattan
  "112": { lat: 40.6782, lng: -73.9442 }, // Brooklyn
  // Los Angeles area
  "900": { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  // Chicago area
  "606": { lat: 41.8781, lng: -87.6298 }, // Chicago
  // Houston area
  "770": { lat: 29.7604, lng: -95.3698 }, // Houston
  // Phoenix area
  "850": { lat: 33.4484, lng: -112.0740 }, // Phoenix
  // Philadelphia area
  "191": { lat: 39.9526, lng: -75.1652 }, // Philadelphia
  // San Antonio area
  "782": { lat: 29.4241, lng: -98.4936 }, // San Antonio
  // San Diego area
  "921": { lat: 32.7157, lng: -117.1611 }, // San Diego
  // Dallas area
  "752": { lat: 32.7767, lng: -96.7970 }, // Dallas
  // San Francisco area
  "941": { lat: 37.7749, lng: -122.4194 }, // San Francisco
  // Austin area
  "787": { lat: 30.2672, lng: -97.7431 }, // Austin
  // Seattle area
  "981": { lat: 47.6062, lng: -122.3321 }, // Seattle
  // Denver area
  "802": { lat: 39.7392, lng: -104.9903 }, // Denver
  // Boston area
  "021": { lat: 42.3601, lng: -71.0589 }, // Boston
  // Miami area
  "331": { lat: 25.7617, lng: -80.1918 }, // Miami
}

export async function GET() {
  try {
    const addresses = await getAddressData()

    // Add coordinates based on ZIP code
    const addressesWithCoords = (addresses as any[]).map((addr) => {
      const zip5 = addr.ZIP?.substring(0, 5) || "00000"
      const zip3 = zip5.substring(0, 3)
      
      // Use known city coordinates if available, otherwise calculate based on ZIP
      const coords = (zip3 in knownZipCodes) ? knownZipCodes[zip3] : getCoordinatesFromZip(zip5)

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
