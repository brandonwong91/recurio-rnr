import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
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
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
  });
  console.log(status);
  const isLoading = status === "submitted" || status === "streaming";

  const handleSendMessage = () => {
    if (input.trim() !== "") {
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: input }],
      } as UIMessage);
      setInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <View className="flex-1 flex-col p-4 max-w-md mx-auto w-full bg-secondary/30">
      {/* <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Card
            className={cn(
              "my-2 p-3 rounded-lg max-w-[85%]",
              item.role === "user"
                ? "bg-blue-500 self-end"
                : "bg-white self-start"
            )}
          >
            <CardContent>
              {item.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <Text
                      key={index}
                      className={cn(
                        "text-base",
                        item.role === "user" ? "text-white" : "text-black"
                      )}
                    >
                      {part.text}
                    </Text>
                  );
                }
                return null;
              })}
            </CardContent>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        className="flex-grow"
        contentContainerStyle={{ paddingBottom: 8 }}
      />
      <View className="flex-row items-center mt-4">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Say something..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-lg bg-white"
          editable={!isLoading}
          multiline
          onSubmitEditing={handleSendMessage}
        />
        <Pressable
          onPress={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="ml-2 p-2"
        >
          <Send
            className={cn(
              isLoading || !input.trim() ? "text-gray-400" : "text-blue-500"
            )}
            size={28}
          />
        </Pressable>
      </View> */}
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
        onSubmit={function (
          message: PromptInputMessage,
          event: FormEvent<HTMLFormElement>
        ): void {
          throw new Error("Function not implemented.");
        }}
      >
        <PromptInputTextarea
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
          className="pr-12"
          // ⬇️ REMOVE the unsupported React Native prop
          // onSubmitEditing={handleSendMessage}

          // ⬇️ ADD the standard Web/HTML onKeyDown handler
          onKeyDown={(e) => {
            // Check if the Enter key was pressed AND no modifier keys (Shift, Ctrl, Alt) are held
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
              e.preventDefault(); // Prevents a newline from being added
              handleSendMessage(); // Call your send logic
            }
          }}
        />
        <PromptInputSubmit
          status={status}
          disabled={!input.trim()}
          className="absolute bottom-1 right-1"
        />
      </PromptInput>
    </View>
  );
}
