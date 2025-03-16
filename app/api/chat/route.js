import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import { Chat } from '@/app/models/Chat';
import { jwtDecode } from 'jwt-decode';
import { BufferMemory } from 'langchain/memory';
import { ChatMistralAI } from '@langchain/mistralai';
import { ConversationChain } from 'langchain/chains';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PdfReader } from 'pdfreader';
import mammoth from 'mammoth';

// Helper function to extract text from PDF using pdfreader.
function extractPDFText(buffer) {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // End of file
        resolve(text);
      } else if (item.text) {
        text += item.text + '\n';
      }
    });
  });
}

/**
 * Combine all stored messages into a single conversation text.
 * e.g., "User: Hello\nAssistant: Hi!\nUser: How are you?\n"
 */
function combineAllChatMessagesIntoString(messages) {
  let conversationSoFar = '';
  for (const m of messages) {
    if (!m || !m.sender || !m.text) continue;
    if (m.sender === 'User') {
      conversationSoFar += `User: ${m.text}\n`;
    } else if (m.sender === 'Assistant') {
      conversationSoFar += `Assistant: ${m.text}\n`;
    }
  }
  return conversationSoFar.trim();
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
    console.error('Error retrieving chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/chat
 * Creates or updates a chat by appending the user's message and then invoking AI.
 * Also, if a new chat is created, calls Gemini to generate a concise title.
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
    const contentType = request.headers.get('content-type') || '';
    let messageText = '';
    let extractedText = '';
    let chatId = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      messageText = formData.get('message') || '';
      const file = formData.get('file');
      if (file) {
        const fileBuffer = await file.arrayBuffer();
        const nodeBuffer = Buffer.from(fileBuffer);

        // Plain text
        if (file.type === 'text/plain') {
          extractedText = new TextDecoder('utf-8').decode(fileBuffer);
        }
        // PDF
        else if (file.type === 'application/pdf') {
          try {
            extractedText = await extractPDFText(nodeBuffer);
          } catch (err) {
            console.error('PDF extraction error:', err);
            extractedText = '[Error extracting PDF content]';
          }
        }
        // DOCX
        else if (file.name.endsWith('.docx')) {
          try {
            const result = await mammoth.extractRawText({ buffer: nodeBuffer });
            extractedText = result.value;
          } catch (err) {
            console.error('DOCX extraction error:', err);
            extractedText = '[Error extracting DOCX content]';
          }
        }
      }
      chatId = formData.get('chatId') || null;
    } else {
      // Standard JSON body
      const jsonBody = await request.json();
      messageText =
        typeof jsonBody.message === 'string'
          ? jsonBody.message
          : jsonBody.message?.aiResponse || 'New Chat';
      chatId = jsonBody.chatId;
    }

    // Optionally summarize the file contents (Gemini call #1)
    let finalSummary = '';
    if (extractedText) {
      const gemini_api_key = process.env.GEMINI_API_KEY;
      if (gemini_api_key) {
        const genAI = new GoogleGenerativeAI(gemini_api_key);
        const genModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
          console.error('Gemini API error:', err);
          finalSummary = '[Error summarizing file content]';
        }
      } else {
        console.warn('No GEMINI_API_KEY in env, skipping summary');
        finalSummary = extractedText;
      }
    }

    // Combine user message with any file summary
    const combinedMessage =
      messageText && finalSummary
        ? `${messageText}\n\n${finalSummary}`
        : messageText || finalSummary || 'New Chat';

    // Attempt to find an existing chat if we have a valid chatId
    let chat;
    if (chatId && ObjectId.isValid(chatId)) {
      chat = await Chat.findById(new ObjectId(chatId));
    }

    // If we didn't find a valid chat, create a new one
    if (!chat) {
      // Generate a concise history title using Gemini or fallback
      let generatedTitle = '';
      try {
        const gemini_api_key = process.env.GEMINI_API_KEY;
        if (gemini_api_key) {
          const genAI = new GoogleGenerativeAI(gemini_api_key);
          const genModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const titlePrompt = `Generate a concise 3-4 word title for the following chat question: "${messageText}"`;
          const titleRes = await genModel.generateContent(titlePrompt);
          generatedTitle = titleRes.response.text().trim();
        } else {
          generatedTitle = combinedMessage.substring(0, 50);
        }
      } catch (err) {
        console.error('Gemini title generation error:', err);
        generatedTitle = combinedMessage.substring(0, 50);
      }

      chat = new Chat({
        title: generatedTitle || 'New Chat',
        messages: [],
      });
      await chat.save();
    } else {
      // If chat exists and its title is still "New Chat," update it
      if (chat.title === 'New Chat') {
        let generatedTitle = '';
        try {
          const gemini_api_key = process.env.GEMINI_API_KEY;
          if (gemini_api_key) {
            const genAI = new GoogleGenerativeAI(gemini_api_key);
            const genModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const titlePrompt = `Generate a concise 3-4 word title for the following chat question: "${messageText}"`;
            const titleRes = await genModel.generateContent(titlePrompt);
            generatedTitle = titleRes.response.text().trim();
          } else {
            generatedTitle = combinedMessage.substring(0, 50);
          }
        } catch (err) {
          console.error('Gemini title generation error:', err);
          generatedTitle = combinedMessage.substring(0, 50);
        }
        chat.title = generatedTitle;
        await chat.save();
      }
    }

    // Append the new user message to the chat
    chat.messages.push({ sender: 'User', text: combinedMessage });
    await chat.save();

    // Teacher instructions
    const teacherInstruction = `You are an enthusiastic Teacher who makes studying and learning fun and interesting. 
Do not summarize texts or provide key points for a large corpus of text provided by the user. 
If the user asks for a summary or key points (unless it is your own generated text), reply: 
"I am sorry but I can't summarize texts for you. Please use the summarizer feature." 
Do not greet "Hello there" for each new message after the first. Just continue the conversation.
`;

    // Combine the entire conversation so far (multi-turn)
    const conversationSoFar = combineAllChatMessagesIntoString(chat.messages);

    // We'll build the final prompt by concatenating:
    // 1) teacher instructions
    // 2) the entire conversation so far
    // 3) the most recent user message (which is also already appended to chat.messages)
    // But we can just rely on conversationSoFar including the last user message now
    //
    // The reason we do teacherInstruction + conversationSoFar is so the chain sees everything.
    const finalPrompt = `${teacherInstruction}\n${conversationSoFar}\nAssistant:`;

    // Create the chain with memory (though memory is less critical since we're passing a single prompt)
    const chain = new ConversationChain({
      llm: new ChatMistralAI({ apiKey: process.env.MISTRAL_API_KEY }),
      memory: new BufferMemory(), // We won't rely on the chain's memory to store messages
    });

    // Get AI response using chain
    let aiResponse;
    try {
      // chain.call(...) returns { response: string }
      const result = await chain.call({ input: finalPrompt });
      aiResponse = result.response;
    } catch (error) {
      console.error('Chain invocation error:', error);
      return NextResponse.json({ error: 'Error generating AI response' }, { status: 500 });
    }

    // Now we have the AI's reply. Append it to the DB.
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
    console.error('Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
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
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
