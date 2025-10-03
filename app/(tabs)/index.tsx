import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { Send } from "lucide-react-native";
import { useState } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { Card, CardContent } from "~/components/ui/card";
import { cn, generateAPIUrl } from "~/lib/utils";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/chat"),
    }),
  });

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

  return (
    <View className="flex-1 flex-col p-4 max-w-md mx-auto w-full bg-secondary/30">
      <FlatList
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
      </View>
    </View>
  );
}
