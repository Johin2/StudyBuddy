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
    let chatId;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      messageText = formData.get("message") || "";
      const file = formData.get("file");
      if (file) {
        const fileBuffer = await file.arrayBuffer();
        const nodeBuffer = Buffer.from(fileBuffer);
        if (file.type === "text/plain") {
          extractedText = new TextDecoder("utf-8").decode(fileBuffer);
        } else if (file.type === "application/pdf") {
          try {
            extractedText = await extractPDFText(nodeBuffer);
          } catch (err) {
            console.error("PDF extraction error:", err);
            extractedText = "[Error extracting PDF content]";
          }
        } else if (file.name.endsWith(".docx")) {
          try {
            const result = await mammoth.extractRawText({ buffer: nodeBuffer });
            extractedText = result.value;
          } catch (err) {
            console.error("DOCX extraction error:", err);
            extractedText = "[Error extracting DOCX content]";
          }
        }
      }
    } else {
      const jsonBody = await request.json();
      messageText =
        typeof jsonBody.message === 'string'
          ? jsonBody.message
          : (jsonBody.message?.aiResponse || "New Chat");
      chatId = jsonBody.chatId;
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

    const combinedMessage =
      messageText && finalSummary
        ? `${messageText}\n\n${finalSummary}`
        : messageText || finalSummary || "New Chat";

    let chat;
    if (chatId && ObjectId.isValid(chatId)) {
      chat = await Chat.findById(new ObjectId(chatId));
    }
    if (!chat) {
      chat = new Chat({
        title: combinedMessage.substring(0, 50),
        messages: [],
      });
      await chat.save();
    }

    // Append the user message to the chat.
    chat.messages.push({ sender: 'User', text: combinedMessage });
    await chat.save();

    // IMPORTANT: Prepend the teacher instruction to the prompt.
    const teacherInstruction = `You are a Teacher. Do not summarize texts or provide key points for a large corpus of text provided by the user , even if they ask you to. If the user asks for a summary or key points, reply with: "I am sorry but I can't summarize texts for you.Please use the summarizer feature.".`;
    const promptInput = teacherInstruction + "\nUser: " + combinedMessage;

    // Initialize chain using in-memory BufferMemory based on current chat messages.
    const chain = new ConversationChain({
      memory: new BufferMemory({ returnMessages: chat.messages }),
      llm: new ChatMistralAI({ apiKey: process.env.MISTRAL_API_KEY }),
    });

    let aiResponse;
    try {
      const res = await chain.invoke({ input: promptInput });
      aiResponse = res.response;
    } catch (error) {
      console.error('Chain invocation error:', error);
      return NextResponse.json({ error: 'Error generating AI response' }, { status: 500 });
    }

    // Append the AI's response to the chat and save.
    chat.messages.push({ sender: 'Assistant', text: aiResponse });
    await chat.save();

    return NextResponse.json({
      chatId: chat._id,
      aiResponse,
      messages: chat.messages,
    }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

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
