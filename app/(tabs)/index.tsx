import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { View, FlatList } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={{ marginVertical: 5 }}>
                <CardContent style={{ padding: 10 }}>
                  <Text>{item.role === "user" ? "User: " : "AI: "}</Text>
                  {item.parts.map((part, index) =>
                    part.type === "text" ? <Text key={index}>{part.text}</Text> : null
                  )}
                </CardContent>
              </Card>
            )}
          />
        </CardContent>
      </Card>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <Input
          style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 5 }}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          editable={status === "ready"}
        />
        <Button onPress={handleSend} disabled={status !== "ready"}>
          <Text>Send</Text>
        </Button>
      </View>
    </View>
  );
}
