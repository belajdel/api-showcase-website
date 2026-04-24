import { NextResponse } from "next/server"

const API_BASE = "http://localhost:8080"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threshold: string }> }
) {
  try {
    const { threshold } = await params
    const response = await fetch(`${API_BASE}/produits/alerte/${threshold}`)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}
