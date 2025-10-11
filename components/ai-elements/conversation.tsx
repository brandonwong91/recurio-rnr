"use client";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ArrowDownIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { createContext, useContext, useCallback } from "react";
import { View, ViewProps, Text, ScrollView, ScrollViewProps } from "react-native";
import { useChatScroll } from "~/lib/useChatScroll";

type ChatScrollContextValue = ReturnType<typeof useChatScroll>;

const ChatScrollContext = createContext<ChatScrollContextValue | null>(null);

const useChatScrollContext = () => {
    const context = useContext(ChatScrollContext);
    if (!context) {
        throw new Error("useChatScrollContext must be used within a ChatScrollProvider");
    }
    return context;
}

export type ConversationProps = ComponentProps<typeof View>;

export const Conversation = ({ className, ...props }: ConversationProps) => {
    const chatScroll = useChatScroll();
    return (
        <ChatScrollContext.Provider value={chatScroll}>
            <View className={cn("relative flex-1", className)} {...props} />
        </ChatScrollContext.Provider>
    )
};

export type ConversationContentProps = ScrollViewProps;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => {
    const { scrollViewRef, handleScroll } = useChatScrollContext();
    return (
        <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className={cn("p-4", className)}
            {...props}
        />
    )
};

export type ConversationEmptyStateProps = ViewProps & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <View
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <View className="text-muted-foreground">{icon}</View>}
        <View className="space-y-1">
          <Text className="font-medium text-sm">{title}</Text>
          {description && (
            <Text className="text-muted-foreground text-sm">{description}</Text>
          )}
        </View>
      </>
    )}
  </View>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useChatScrollContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full",
          className
        )}
        onPress={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};