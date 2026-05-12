import { NextRequest, NextResponse } from "next/server";

type Position = { lat: number; lng: number; updatedAt: string };

// In-memory store — resets on server restart; replace with DB in backend phase
const positions = new Map<string, Position>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const pos = positions.get(orderId) ?? null;
  return NextResponse.json(pos);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await req.json() as { lat?: number; lng?: number };

  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  positions.set(orderId, { lat: body.lat, lng: body.lng, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
