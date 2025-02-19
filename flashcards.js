import { ChatMistralAI } from "@langchain/mistralai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


const mistral_api_key = process.env.MISTRAL_API_KEY

const model = new ChatMistralAI({
  apiKey: mistral_api_key,
  model: "open-mixtral-8x22b",
  temperature: 0
});

const res = await model.invoke("create flashcards for me on the topic of AIML and give it to me in a list json format make sure you only provide the json no extra text along with it (e.g 'Here is a JSON format for flashcards on the topic of AIML:'). There shoul be 2 keys in each json object 'question' and 'answer")
console.log(res.content)
const json_res = JSON.parse(res.content.replace('```json', '').replace('```',''))
console.log(json_res)

let num = 0

const questions = json_res.map(card => card.question)
console.log(questions)

const answers = json_res.map(card => card.answer)
console.log(answers)