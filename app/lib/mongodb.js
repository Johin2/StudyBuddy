import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  // Use existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  if (mongoose.connection.readyState >= 1) {
    cached.conn = mongoose.connection;
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Adjust based on your needs
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
