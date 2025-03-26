import { NextResponse } from "next/server"
import { getAddressData } from "@/lib/db"
import { handleApiError } from "../error-handler"

// Cache for ZIP code coordinates to avoid repeated API calls
const zipCoordinateCache: Record<string, { lat: number; lng: number }> = {}

// Function to get coordinates from the Zippopotam.us API
async function getCoordinatesFromAPI(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Check cache first
    if (zipCoordinateCache[zip]) {
      return zipCoordinateCache[zip]
    }
    
    // Make API request
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`)
    
    if (!response.ok) {
      console.error(`Failed to get coordinates for ZIP ${zip}: ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0]
      const coordinates = {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude)
      }
      
      // Cache the result
      zipCoordinateCache[zip] = coordinates
      
      return coordinates
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching coordinates for ZIP ${zip}:`, error)
    return null
  }
}

// Fallback function to generate approximate coordinates when API fails
function getFallbackCoordinates(zip: string): { lat: number; lng: number } {
  // Extract the first 3 digits of the ZIP code (the "prefix")
  const zipPrefix = parseInt(zip.substring(0, 3), 10)
  
  // Map ZIP code prefixes to regions in the US
  let baseLat = 39.8283 // Center of US latitude
  let baseLng = -98.5795 // Center of US longitude
  
  // Northeast (New England)
  if (zipPrefix >= 0 && zipPrefix <= 6) {
    baseLat = 42.5
    baseLng = -71.5
  } 
  // Massachusetts, Rhode Island
  else if (zipPrefix >= 10 && zipPrefix <= 29) {
    baseLat = 42.0
    baseLng = -71.5
  }
  // New York City and surrounding areas
  else if (zipPrefix >= 100 && zipPrefix <= 119) {
    baseLat = 40.7
    baseLng = -74.0
  }
  // Upstate New York
  else if (zipPrefix >= 120 && zipPrefix <= 149) {
    baseLat = 42.5
    baseLng = -76.0
  }
  // Pennsylvania
  else if (zipPrefix >= 150 && zipPrefix <= 196) {
    baseLat = 40.5
    baseLng = -77.5
  }
  // Delaware, Maryland, DC, Virginia
  else if (zipPrefix >= 197 && zipPrefix <= 249) {
    baseLat = 38.5
    baseLng = -77.0
  }
  // North Carolina, South Carolina
  else if (zipPrefix >= 270 && zipPrefix <= 299) {
    baseLat = 35.0
    baseLng = -80.0
  }
  // Georgia
  else if (zipPrefix >= 300 && zipPrefix <= 319) {
    baseLat = 33.0
    baseLng = -83.5
  }
  // Florida
  else if (zipPrefix >= 320 && zipPrefix <= 349) {
    baseLat = 28.0
    baseLng = -82.0
  }
  // Alabama, Tennessee
  else if (zipPrefix >= 350 && zipPrefix <= 379) {
    baseLat = 34.0
    baseLng = -86.5
  }
  // Michigan
  else if (zipPrefix >= 480 && zipPrefix <= 499) {
    baseLat = 43.0
    baseLng = -84.5
  }
  // Ohio
  else if (zipPrefix >= 430 && zipPrefix <= 458) {
    baseLat = 40.0
    baseLng = -82.5
  }
  // Kentucky, Indiana
  else if (zipPrefix >= 400 && zipPrefix <= 429) {
    baseLat = 38.0
    baseLng = -85.5
  }
  // Wisconsin, Illinois
  else if (zipPrefix >= 500 && zipPrefix <= 599) {
    baseLat = 42.0
    baseLng = -89.0
  }
  // Missouri, Iowa, Minnesota
  else if (zipPrefix >= 600 && zipPrefix <= 658) {
    baseLat = 41.0
    baseLng = -93.0
  }
  // Kansas, Nebraska
  else if (zipPrefix >= 660 && zipPrefix <= 699) {
    baseLat = 39.0
    baseLng = -97.0
  }
  // Louisiana, Arkansas, Oklahoma
  else if (zipPrefix >= 700 && zipPrefix <= 749) {
    baseLat = 33.0
    baseLng = -93.0
  }
  // Texas
  else if (zipPrefix >= 750 && zipPrefix <= 799) {
    baseLat = 31.0
    baseLng = -98.0
  }
  // North Dakota, South Dakota, Montana, Wyoming
  else if (zipPrefix >= 570 && zipPrefix <= 599) {
    baseLat = 45.0
    baseLng = -103.0
  }
  // Colorado, New Mexico
  else if (zipPrefix >= 800 && zipPrefix <= 899) {
    baseLat = 37.0
    baseLng = -106.0
  }
  // California
  else if (zipPrefix >= 900 && zipPrefix <= 961) {
    baseLat = 34.0
    baseLng = -118.0
  }
  // Washington, Oregon, Idaho, Nevada, Utah, Arizona
  else if (zipPrefix >= 970 && zipPrefix <= 999) {
    baseLat = 43.0
    baseLng = -116.0
  }
  
  // Add some variation based on the last 2 digits of the ZIP
  const lastDigits = parseInt(zip.substring(3, 5), 10)
  const latVariation = (lastDigits % 10) * 0.01
  const lngVariation = (lastDigits % 10) * 0.015
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  }
}

// Known ZIP codes for major cities as a fallback
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
    const addressesWithCoords = [] as any[]
    
    // Process addresses in batches to avoid overwhelming the API
    const batchSize = 10
    const uniqueZips = new Set<string>()
    
    // First, collect all unique ZIP codes
    for (const addr of addresses as any[]) {
      const zip5 = addr.ZIP?.substring(0, 5) || "00000"
      if (zip5 !== "00000") {
        uniqueZips.add(zip5)
      }
    }
    
    console.log(`Found ${uniqueZips.size} unique ZIP codes`)
    
    // Process unique ZIP codes in batches
    const uniqueZipArray = Array.from(uniqueZips)
    const zipCoordinates: Record<string, { lat: number; lng: number }> = {}
    
    for (let i = 0; i < uniqueZipArray.length; i += batchSize) {
      const batch = uniqueZipArray.slice(i, i + batchSize)
      const batchPromises = batch.map(async (zip) => {
        // Try to get coordinates from API
        const apiCoords = await getCoordinatesFromAPI(zip)
        
        if (apiCoords) {
          zipCoordinates[zip] = apiCoords
        } else {
          // Fall back to known ZIP codes or approximation
          const zip3 = zip.substring(0, 3)
          zipCoordinates[zip] = (zip3 in knownZipCodes) 
            ? knownZipCodes[zip3] 
            : getFallbackCoordinates(zip)
        }
      })
      
      // Wait for all ZIP codes in this batch to be processed
      await Promise.all(batchPromises)
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < uniqueZipArray.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Now map all addresses using the collected coordinates
    for (const addr of addresses as any[]) {
      const zip5 = addr.ZIP?.substring(0, 5) || "00000"
      let coords
      
      if (zip5 in zipCoordinates) {
        coords = zipCoordinates[zip5]
      } else {
        // Fallback for any ZIP codes that weren't processed
        const zip3 = zip5.substring(0, 3)
        coords = (zip3 in knownZipCodes) 
          ? knownZipCodes[zip3] 
          : getFallbackCoordinates(zip5)
      }
      
      addressesWithCoords.push({
        id: addr.id,
        address: addr.address,
        city: addr.CITY,
        state: addr.ST,
        zip: addr.ZIP,
        lat: coords.lat,
        lng: coords.lng,
      })
    }

    return NextResponse.json(addressesWithCoords)
  } catch (error) {
    return handleApiError(error, "Failed to fetch address data")
  }
}
