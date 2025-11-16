import React, { useRef, useEffect, ReactNode } from "react";
import { Message } from "@/utils/supabaseClient";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  activeWord?: string;
  activeIds?: string[];
  onMessageClick?: (messageId: string) => void;
}

interface MessageListRef {
  scrollToMessage: (id: string) => void;
}

const MessageListComponent = React.forwardRef<
  MessageListRef,
  MessageListProps
>(({ messages, activeWord, activeIds = [] }, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToMessage = (id: string) => {
    const messageEl = messageRefs.current.get(id);
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  React.useImperativeHandle(ref, () => ({
    scrollToMessage,
  }));

  const highlightText = (text: string): ReactNode[] => {
    if (!activeWord || activeWord.trim().length === 0) {
      return [text];
    }

    const wordRegex = new RegExp(`\\b${activeWord}\\b`, "gi");
    const parts: ReactNode[] = [];
    let lastIndex = 0;

    let match;
    while ((match = wordRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={`${match.index}-highlight`} className="bg-yellow-300 font-semibold">
          {match[0]}
        </span>
      );
      lastIndex = wordRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation to begin</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isHighlighted = activeIds.includes(message.id);
            return (
              <div
                key={message.id}
                ref={(el) => {
                  if (el) messageRefs.current.set(message.id, el);
                }}
                className={cn(
                  "p-3 rounded-lg transition-colors",
                  isHighlighted
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : "bg-gray-100 hover:bg-gray-150"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      {message.userId}
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed break-words">
                      {highlightText(message.text)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageListComponent.displayName = "MessageList";
export const MessageList = MessageListComponent;
