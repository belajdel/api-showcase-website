import { NextResponse } from "next/server"

const API_BASE = "http://localhost:8080"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/valeur`)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch value" },
      { status: 500 }
    )
  }
}
