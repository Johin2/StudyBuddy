import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/app/lib/mongodb';
import { Summarizer } from '@/app/models/Summarizer';
// Optional: Import Settings model if you're storing the free limit in the database.
// import { Settings } from '@/app/models/Settings';

dotenv.config({ path: '.env.local' });

// Fallback FREE_LIMIT value if you don't have a Settings document.
const DEFAULT_FREE_LIMIT = 5;

export async function GET(request) {
  // Connect to the database.
  await connectDB();

  // Verify the access token.
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = decoded.sub || decoded.id;
  if (!userId) {
    return NextResponse.json({ error: 'User information not found in token' }, { status: 401 });
  }

  // Optionally, retrieve the free limit from the Settings model.
  // const settingsDoc = await Settings.findOne();
  // const FREE_LIMIT = settingsDoc ? settingsDoc.freeLimit : DEFAULT_FREE_LIMIT;
  const FREE_LIMIT = DEFAULT_FREE_LIMIT;

  // Define start and end of the day.
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Count the number of summaries created today for the user.
  const dailyCount = await Summarizer.countDocuments({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const freeDailySummariesLeft = Math.max(0, FREE_LIMIT - dailyCount);

  return NextResponse.json({ freeDailySummariesLeft }, { status: 200 });
}
