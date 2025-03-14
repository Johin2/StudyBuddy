import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL; 

if (!MONGO_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Adjust based on your needs
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
