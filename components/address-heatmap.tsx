"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"

interface Address {
  lat: number
  lng: number
}

interface AddressHeatmapProps {
  addresses: Address[]
}

export default function AddressHeatmap({ addresses }: AddressHeatmapProps) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined" && !mapInstanceRef.current) {
      // Initialize the map
      const map = L.map("map").setView([39.8283, -98.5795], 4)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      mapInstanceRef.current = map
      mapRef.current = map
    }

    // Update the heatmap when addresses change
    if (mapInstanceRef.current && addresses && addresses.length > 0) {
      const map = mapInstanceRef.current

      // Remove existing heatmap layer if it exists
      if (mapRef.current && mapRef.current !== map) {
        map.removeLayer(mapRef.current)
      }

      // Create points array for heatmap
      const points = addresses.map((addr) => [addr.lat, addr.lng, 1])

      // Add heatmap layer
      const heatLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 1.0,
        gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
      }).addTo(map)

      mapRef.current = heatLayer
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        mapRef.current = null
      }
    }
  }, [addresses])

  return <div id="map" style={{ height: "100%", width: "100%" }} />
}

