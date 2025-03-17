import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { connectDB } from '@/app/lib/mongodb';
import { Flashcard } from '@/app/models/flashCards';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';
import { Settings } from '@/app/models/Settings';

dotenv.config({ path: '.env.local' });

/**
 * Extract text from a PDF using pdfreader.
 * Returns a promise that resolves to the text content.
 */
async function extractTextFromPdf(buffer) {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        return reject(err);
      } else if (!item) {
        // End of file.
        return resolve(text);
      } else if (item.text) {
        text += item.text + ' ';
      }
    });
  });
}

/**
 * GET /api/flashcards
 * Retrieves flashcard sessions.
 * Optionally, you can pass a query parameter ?userId=... to filter sessions.
 * Sessions that have been "deleted" (isDeleted=true) are not returned.
 */
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  let query = { isDeleted: { $ne: true } };
  if (userId) {
    query.userId = userId;
  }
  try {
    // Retrieve sessions (each document represents one flashcard session)
    const sessions = await Flashcard.find(query).sort({ createdAt: -1 });
    // Transform each session so that the client gets the expected fields:
    // - title (from question)
    // - flashcards (by parsing the answer JSON string)
    const history = sessions.map((doc) => ({
      _id: doc._id,
      title: doc.question,
      flashcards: (() => {
        try {
          return JSON.parse(doc.answer);
        } catch (error) {
          return [];
        }
      })(),
      createdAt: doc.createdAt,
    }));
    return NextResponse.json({ success: true, data: history }, { status: 200 });
  } catch (error) {
    console.error("Error fetching flashcard sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/flashcards
 * Generates a flashcard session for the provided text (or file) and saves it to the database.
 * The LLM is instructed to output JSON with keys "title" and "flashcards".
 * The session title is stored in the "question" field and the flashcards array in the "answer" field.
 */
export async function POST(request) {
  await connectDB();

  // Retrieve FREE_LIMIT from the settings collection (default to 5 if not found)
  const settingsDoc = await Settings.findOne();
  const FREE_LIMIT = settingsDoc ? settingsDoc.freeLimit : 5;

  let userId;
  let extractedText = '';

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      userId = formData.get('userId');
      const file = formData.get('file');
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      const filename = file.name;
      const ext = filename.split('.').pop().toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (ext === 'pdf') {
        extractedText = await extractTextFromPdf(buffer);
      } else if (ext === 'txt') {
        extractedText = buffer.toString('utf8');
      } else if (ext === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }
    } else {
      const body = await request.json();
      userId = body.userId;
      extractedText = body.messageText;
    }

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({ error: 'No text provided' }, { status: 400 });
      }
      
    // Enforce daily free flashcard session limit.
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const dailyCount = await Flashcard.countDocuments({
      userId,
      isDeleted: { $ne: true },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    if (dailyCount >= FREE_LIMIT) {
      return NextResponse.json({ error: "Daily free flashcard sessions limit reached" }, { status: 403 });
    }

    // Generate flashcards using the Google Generative AI model.
    const gemini_api_key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(gemini_api_key);
    const genModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
You are a flashcard generator. Given the following text, generate a flashcard session.
Provide a title for the session and generate an array of flashcards.
Each flashcard should have a "question" and an "answer".
Format the output as JSON with keys "title" and "flashcards".
Do not include any additional text.And make sure to generate flashcards on the topic that is provided dont go off topic. 
If the user says space then you should generate flashcards on the topic of space nothing else.
${extractedText}
    `;
    const finalRes = await genModel.generateContent(prompt);
    const flashcardJsonText = finalRes.response.text() || '';

    let flashcardData;
    try {
      // Remove any markdown code fences (e.g. ```json or ```) from the LLM output
      const cleanedJsonText = flashcardJsonText
        .trim()
        .replace(/```(json)?/gi, '')
        .replace(/```/gi, '')
        .trim();
      flashcardData = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error('Error parsing flashcard JSON:', parseError);
      return NextResponse.json({ error: 'Failed to parse flashcard data from LLM output' }, { status: 500 });
    }

    // Calculate free daily sessions left.
    const freeLeft = FREE_LIMIT - (dailyCount + 1);

    // Save the flashcard session as a single document.
    // Map the session title to the "question" field and the flashcards array (stringified) to the "answer" field.
    const newSession = await Flashcard.create({
      userId,
      question: flashcardData.title, // session title
      answer: JSON.stringify(flashcardData.flashcards), // store flashcards array as JSON string
    });

    // Retrieve the user's flashcard session history (exclude deleted sessions).
    const sessions = await Flashcard.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    const history = sessions.map((doc) => ({
      _id: doc._id,
      title: doc.question,
      flashcards: (() => {
        try {
          return JSON.parse(doc.answer);
        } catch (error) {
          return [];
        }
      })(),
      createdAt: doc.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          title: flashcardData.title,
          flashcards: flashcardData.flashcards,
          freeDailySessionsLeft: freeLeft,
          sessionId: newSession._id,
          history,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/flashcards?id=SESSION_ID
 * Deletes a flashcard session from the database so that it is permanently removed.
 */
export async function DELETE(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }
  try {
    const session = await Flashcard.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    // Permanently delete the session from the database
    await Flashcard.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "Session deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
