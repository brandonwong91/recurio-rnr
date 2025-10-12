import { useState } from "react";

export function useChatNative(apiUrl: string) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(userMessage: string) {
    setIsLoading(true);
    setError(null);

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Expecting { role: "assistant", content: "...response..." }
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      console.error("Message error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, sendMessage, isLoading, error };
}
