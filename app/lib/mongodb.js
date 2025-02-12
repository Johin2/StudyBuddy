import mongoose from "mongoose";

const MONGO_URL = "mongodb://127.0.0.1:27017/studybuddy"

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGO_URL)
    console.log("Connected to MongoDB")
}