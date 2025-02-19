import { MongoClient, ObjectId } from "mongodb";
import { BufferMemory } from "langchain/memory";
import { ChatMistralAI } from "@langchain/mistralai";
import { ConversationChain } from "langchain/chains";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

const mistral_api_key = process.env.MISTRAL_API_KEY;
if (!mistral_api_key) {
  throw new Error("MISTRAL_API_KEY is not set in your environment.");
}

// Connect to MongoDB
const client = new MongoClient('mongodb://127.0.0.1:27017/', {
  driverInfo: { name: "langchainjs" },
});
await client.connect();
const collection = client.db("langchain").collection("memory");

// Generate a new sessionId string
const sessionId = new ObjectId().toString();

// Set up chat history using MongoDB for persistence
const memory = new BufferMemory({
  chatHistory: new MongoDBChatMessageHistory({
    collection,
    sessionId,
  }),
});

// Set up the language model
const model = new ChatMistralAI({
  apiKey: mistral_api_key,
  model: "open-mixtral-8x22b",
  temperature: 0,
});

// Create a conversation chain
const chain = new ConversationChain({ llm: model, memory });

// Create a readline interface for dynamic user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask a question and wait for a response
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Main loop for dynamic conversation
async function conversationLoop() {
  console.log("Enter your messages below (type 'exit' to quit):\n");

  while (true) {
    const userInput = await askQuestion("You: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("Exiting conversation...");
      break;
    }

    try {
      // Invoke the chain with the dynamic input
      const res = await chain.invoke({ input: userInput });
      console.log("AI:", res);
    } catch (error) {
      console.error("Error invoking chain:", error);
    }
  }

  // Optionally, view the chat history from MongoDB
  const messages = await memory.chatHistory.getMessages();
  console.log("Chat History:", messages);

  // Clear chat history if desired
  await memory.chatHistory.clear();

  rl.close();
}

conversationLoop();
