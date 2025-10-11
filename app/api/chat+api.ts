import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, UIMessage } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  console.log("Messages:", messages);
  const result = await streamText({
    model: google("gemini-2.5-flash"),
    prompt: convertToModelMessages(messages),
  });
  console.log("Result:", await result.content);
  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
