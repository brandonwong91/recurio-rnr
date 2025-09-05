import React from "react";
import { View, Text } from "react-native";
import { cn } from "~/lib/utils";

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      className={cn(
        "absolute bottom-10 left-0 right-0 items-center z-50"
      )}
    >
      <View
        className={cn(
          "bg-foreground rounded-full p-4 mx-4 flex-row items-center justify-center"
        )}
      >
        <Text className="text-background text-center">{message}</Text>
      </View>
    </View>
  );
}
