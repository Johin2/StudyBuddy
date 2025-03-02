import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/studybuddy"

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGO_URL)
    console.log("Connected to MongoDB")
}