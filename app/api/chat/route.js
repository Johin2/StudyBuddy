import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Chat } from '@/app/models/Chat';
import { jwtDecode } from 'jwt-decode';
import { BufferMemory } from "langchain/memory";
import { ChatMistralAI } from "@langchain/mistralai";
import { ConversationChain } from "langchain/chains";
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';

// Helper function to extract text from PDF using pdfreader.
function extractPDFText(buffer) {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(text);
      } else if (item.text) {
        text += item.text + "\n";
      }
    });
  });
}

/**
 * GET /api/chat?chatId=CHAT_ID
 * Retrieve a chat by its ID. If not found, returns a 404.
 */
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  if (!chatId || !ObjectId.isValid(chatId)) {
    return NextResponse.json({ error: 'Invalid chatId' }, { status: 400 });
  }
  try {
    const chat = await Chat.findById(new ObjectId(chatId));
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    return NextResponse.json({ chat }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/chat
 * Creates or updates a chat by appending the user's message and then invoking AI to generate a response.
 */
export async function POST(request) {
  await connectDB();

  // Validate token
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let messageText = "";
    let extractedText = "";
    let chatId = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      messageText = formData.get("message") || "";
      const file = formData.get("file");
      if (file) {
        const fileBuffer = await file.arrayBuffer();
        const nodeBuffer = Buffer.from(fileBuffer);

        // Plain text
        if (file.type === "text/plain") {
          extractedText = new TextDecoder("utf-8").decode(fileBuffer);
        }
        // PDF
        else if (file.type === "application/pdf") {
          try {
            extractedText = await extractPDFText(nodeBuffer);
          } catch (err) {
            console.error("PDF extraction error:", err);
            extractedText = "[Error extracting PDF content]";
          }
        }
        // DOCX
        else if (file.name.endsWith(".docx")) {
          try {
            const result = await mammoth.extractRawText({ buffer: nodeBuffer });
            extractedText = result.value;
          } catch (err) {
            console.error("DOCX extraction error:", err);
            extractedText = "[Error extracting DOCX content]";
          }
        }
      }
      // Optionally: chatId = formData.get("chatId");
    } else {
      const jsonBody = await request.json();
      messageText =
        typeof jsonBody.message === 'string'
          ? jsonBody.message
          : (jsonBody.message?.aiResponse || "New Chat");
      chatId = jsonBody.chatId; // If the front end passes it
    }

    let finalSummary = "";
    if (extractedText) {
      const gemini_api_key = process.env.GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(gemini_api_key);
      const genModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Summarize the following content for me directly. Make sure the first letter is always capital.
        Keep the output properly formatted.
        Start directly with the content and do not include any preamble.
        ${extractedText}
      `;
      try {
        const finalRes = await genModel.generateContent(prompt);
        finalSummary = finalRes.response.text() || '';
      } catch (err) {
        console.error("Gemini API error:", err);
        finalSummary = "[Error summarizing file content]";
      }
    }

    // Combine user message with any file summary
    const combinedMessage =
      messageText && finalSummary
        ? `${messageText}\n\n${finalSummary}`
        : messageText || finalSummary || "New Chat";

    // Attempt to find an existing chat if we have a valid chatId
    let chat;
    if (chatId && ObjectId.isValid(chatId)) {
      chat = await Chat.findById(new ObjectId(chatId));
    }

    // If we didn't find a valid chat, create a new one
    if (!chat) {
      chat = new Chat({
        title: combinedMessage.substring(0, 50),
        messages: [],
      });
      await chat.save();
    }

    // Append the user message
    chat.messages.push({ sender: 'User', text: combinedMessage });
    await chat.save();

    // Teacher instruction
    const teacherInstruction = `You are a enthusiastic Teacher who makes studying and learning fun and interesting. Do not summarize texts or provide key points for a large corpus of text provided by the user, even if they ask you to.
      If the user asks for a summary or key points unless it is your own generated text, reply with: "I am sorry but I can't summarize texts for you. Please use the summarizer feature.".
    `;

    // Create the chain with memory
    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: chat.messages }),
      llm: new ChatMistralAI({ apiKey: process.env.MISTRAL_API_KEY }),
    });

    // Construct final prompt
    const promptInput = teacherInstruction + "\nUser: " + combinedMessage;

    // Get AI response
    let aiResponse;
    try {
      const res = await chain.invoke({ input: promptInput });
      aiResponse = res.response;
    } catch (error) {
      console.error('Chain invocation error:', error);
      return NextResponse.json({ error: 'Error generating AI response' }, { status: 500 });
    }

    // Save the AI response
    chat.messages.push({ sender: 'Assistant', text: aiResponse });
    await chat.save();

    // Return the chat _id, AI response, and messages
    return NextResponse.json(
      {
        chatId: chat._id,
        aiResponse,
        messages: chat.messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/**
 * DELETE /api/chat?chatId=CHAT_ID
 * Deletes a chat document.
 */
export async function DELETE(request) {
  await connectDB();
  
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  let decoded;
  try {
    decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  
  if (!chatId || !ObjectId.isValid(chatId)) {
    return NextResponse.json({ error: 'Invalid chatId' }, { status: 400 });
  }
  
  try {
    const result = await Chat.deleteOne({ _id: new ObjectId(chatId) });
    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Chat deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
