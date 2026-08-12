import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const response = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: [
            {
                role: "user",
                content: "Is a plant leaf green? Respond with only yes or no."
            },
        ],
        max_tokens: 1024,
    });
    console.log("No options content:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error no options:", err);
  }

  try {
    const response = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        messages: [
            {
                role: "user",
                content: "Is a plant leaf green? Respond with only yes or no."
            },
        ],
        reasoning_format: "hidden",
        max_tokens: 1024,
    });
    console.log("Hidden reasoning content:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error hidden reasoning:", err);
  }
}

test();
