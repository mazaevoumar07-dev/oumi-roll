import { NextResponse } from 'next/server'
import { rateLimit, getIp } from '@/lib/rate-limit'

// Update these to the restaurant's exact coordinates
const RESTAURANT_LAT = Number(process.env.RESTAURANT_LAT ?? 47.9986)
const RESTAURANT_LNG = Number(process.env.RESTAURANT_LNG ?? 0.1996)

// Straight-line distance × 1.3 approximates road distance in Le Mans.
// See known_risks.md — replace with Distance Matrix API for better accuracy.
const ROAD_FACTOR = 1.3

const TARIFFS: Array<{ max: number; cost: number }> = [
  { max: 3.0, cost: 2.50 },
  { max: 3.5, cost: 3.50 },
  { max: 4.0, cost: 4.50 },
  { max: 4.5, cost: 5.50 },
  { max: 5.0, cost: 6.50 },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getDeliveryCost(distanceKm: number): number | null {
  for (const tier of TARIFFS) {
    if (distanceKm <= tier.max) return tier.cost
  }
  return null // out of zone
}

export async function POST(request: Request) {
  if (!rateLimit(`delivery:${getIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une minute.' }, { status: 429 })
  }

  try {
    const { address } = await request.json() as { address?: string }

    if (!address?.trim()) {
      return NextResponse.json({ error: 'Adresse requise' }, { status: 400 })
    }

    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(address)}` +
      `&region=fr` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`

    const res = await fetch(url)
    const json = await res.json() as {
      status: string
      results: Array<{ geometry: { location: { lat: number; lng: number } } }>
    }

    if (json.status === 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: 'Adresse introuvable. Vérifiez l\'orthographe.', code: 'ADDRESS_NOT_FOUND' },
        { status: 422 }
      )
    }

    if (json.status !== 'OK' || !json.results[0]) {
      console.error('[delivery/calculate] Google Maps error:', json.status)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const { lat, lng } = json.results[0].geometry.location

    const straightLineKm = haversineKm(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng)
    const distanceKm = Math.round(straightLineKm * ROAD_FACTOR * 10) / 10

    const delivery_cost = getDeliveryCost(distanceKm)

    if (delivery_cost === null) {
      return NextResponse.json(
        { error: 'Cette adresse est hors zone de livraison. Choisissez le retrait en restaurant.', code: 'OUT_OF_ZONE' },
        { status: 422 }
      )
    }

    return NextResponse.json({ distance_km: distanceKm, delivery_cost })
  } catch (err) {
    console.error('[delivery/calculate]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
