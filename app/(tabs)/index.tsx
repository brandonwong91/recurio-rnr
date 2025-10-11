import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { MessageSquare, Send } from "lucide-react-native";
import { FormEvent, useState } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Message, MessageContent } from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { ResponseView } from "~/components/ai-elements/response";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { cn, generateAPIUrl } from "~/lib/utils";

export default function ChatScreen() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
  });
  console.log(status);

  return (
    <View className="flex-1 flex-col p-4 max-w-md mx-auto w-full bg-secondary/30">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text": // we don't use any reasoning or tool calls in this example
                        return (
                          <ResponseView key={`${message.id}-${i}`}>
                            <Text
                              className={cn(
                                message.role === "user"
                                  ? "text-primary-foreground"
                                  : "text-secondary-foreground"
                              )}
                            >
                              {part.text}
                            </Text>
                          </ResponseView>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="mt-4 w-full max-w-2xl mx-auto relative"
        onSubmit={(message) => {
          if (message.text && message.text.trim() !== "") {
            sendMessage({
              role: "user",
              parts: [{ type: "text", text: message.text }],
            } as UIMessage);
          }
        }}
      >
        <PromptInputTextarea placeholder="Say something..." className="pr-12" />
        <PromptInputSubmit
          status={status}
          className="absolute bottom-1 right-1"
        />
      </PromptInput>
    </View>
  );
}
