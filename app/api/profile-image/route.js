// app/api/profile-image/route.js
import { connectDB } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import jwt from "jsonwebtoken";

// Ensure we're using Node.js runtime so that Buffer is available
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // Get JWT token from the Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { status: 401 }
      );
    }
    // Expected format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No token provided" }),
        { status: 401 }
      );
    }
    
    // Verify token and extract user ID
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401 }
      );
    }
    const userId = decoded._id;
    
    // Parse the incoming FormData
    const formData = await request.formData();
    const file = formData.get("profileImage");
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No profile image uploaded" }),
        { status: 400 }
      );
    }
    
    // Convert file to a Buffer and then to a Base64 string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Connect to the database and update the user document
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: dataUrl },
      { new: true }
    );
    if (!updatedUser) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: updatedUser }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
