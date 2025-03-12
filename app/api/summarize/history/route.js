import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/app/lib/mongodb';
import { Summarizer } from '@/app/models/Summarizer';

dotenv.config({ path: '.env.local' });

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

  try {
    // Query all summary documents for the user, sorted by createdAt descending.
    const docs = await Summarizer.find({ userId }).sort({ createdAt: -1 });
    
    // Map each document to include a `summary` field for the frontend.
    const history = docs.map(doc => ({
      id: doc._id,
      summary: doc.summaryText, // Map summaryText to summary.
      historyPreview: doc.historyPreview,
      keyPoints: doc.keyPoints,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
