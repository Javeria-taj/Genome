import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User, { ISavedLocation } from "@/models/User";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure returning plain object
  const locations = user.savedLocations.map((loc: any) => ({
    _id: loc._id.toString(),
    lat: loc.lat,
    lng: loc.lng,
    label: loc.label,
    createdAt: loc.createdAt
  }));

  return NextResponse.json({ locations });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lat, lng, label } = await req.json();
    if (lat === undefined || lng === undefined || !label) {
      return NextResponse.json({ error: "Missing required pin data" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newLocation = { lat, lng, label, createdAt: new Date() };
    user.savedLocations.push(newLocation as ISavedLocation);
    await user.save();

    return NextResponse.json({ message: "Location saved successfully" });
  } catch (error) {
    console.error("Save Location Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    user.savedLocations = user.savedLocations.filter((loc: any) => loc._id.toString() !== id);
    await user.save();

    return NextResponse.json({ message: "Location removed successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
