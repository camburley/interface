import { NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { name, email, idea, problem, risk, timeline, budget } = body
    
    // Validate required fields
    if (!name || !email || !idea || !problem || !risk || !timeline || !budget) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }
    
    const { db } = getFirebaseAdmin()
    
    // Save to Firebase
    const docRef = await db.collection("mvp_applications").add({
      name,
      email,
      idea,
      problem,
      risk,
      timeline,
      budget,
      status: "new",
      created_at: new Date().toISOString(),
    })
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Application submitted successfully",
        id: docRef.id 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
}

