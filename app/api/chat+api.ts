import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, UIMessage } from "ai";

export const dynamic = "force-dynamic";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: google("gemini-2.5-flash"),
    prompt: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
