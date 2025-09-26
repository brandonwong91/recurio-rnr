"use client";

import { useState } from "react";
import { useChat, type UseChatOptions } from "@ai-sdk/react";

import { Chat } from "~/components/ui/chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { View } from "react-native";
import { cn } from "~/lib/utils";

const MODELS = [
  { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash" },
  { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro" },
];

type ChatScreenProps = {
  initialMessages?: UseChatOptions["initialMessages"];
};

// Placeholder for audio transcription
const transcribeAudio = async (blob: Blob): Promise<string> => {
  console.log("transcribeAudio called with blob", blob);
  // This is a placeholder.
  // You would normally send the audio blob to a transcription service.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return "This is a placeholder for transcribed audio.";
};

export default function ChatScreen(props: ChatScreenProps) {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    ...props,
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#F8F8F8" }}>
      <div className={cn("flex", "justify-end", "mb-2")}>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Chat
        className="grow"
        messages={messages}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        suggestions={[
          "What is the weather in San Francisco?",
          "Explain step-by-step how to solve this math problem: If x² + 6x + 9 = 25, what is x?",
          "Design a simple algorithm to find the longest palindrome in a string.",
        ]}
      />
    </View>
  );
}
