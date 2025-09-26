import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, UIMessage } from "ai";

export const dynamic = "force-dynamic";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await req.json();

  const result = await streamText({
    model: google(model || "gemini-1.5-flash-latest"),
    prompt: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
