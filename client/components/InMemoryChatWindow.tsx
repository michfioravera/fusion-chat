import React, { useEffect, useRef } from "react";
import { useInMemoryData } from "@/context/InMemoryDataProvider";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  currentUser: string;
  onWordClick?: (word: string) => void;
  highlightedWord?: string;
  highlightedMessageId?: string;
}

/**
 * ChatWindow Component
 * - Displays all messages in real-time
 * - Auto-scrolls to latest message
 * - Shows user names and timestamps
 * - Highlights specific words when clicked in graph
 * - Supports message highlighting for clicked nodes
 */
export const InMemoryChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  highlightedWord,
  highlightedMessageId,
  onWordClick,
}) => {
  const { messages } = useInMemoryData();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const highlightText = (text: string) => {
    if (!highlightedWord) {
      return text;
    }

    const regex = new RegExp(`\\b(${highlightedWord})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.toLowerCase() === highlightedWord.toLowerCase()) {
        return (
          <span
            key={idx}
            className="bg-yellow-300 font-bold cursor-pointer hover:bg-yellow-400"
            onClick={() => onWordClick?.(highlightedWord)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <h2 className="text-lg font-bold text-gray-800">Messages</h2>
        <p className="text-sm text-gray-600">
          {messages.length} message{messages.length !== 1 ? "s" : ""} • You are{" "}
          <span className="font-semibold text-blue-600">{currentUser}</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            <div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">
                Start typing to see messages appear
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.user === currentUser;
            const isHighlighted = message.id === highlightedMessageId;

            return (
              <div
                key={message.id}
                className={cn(
                  "p-3 rounded-lg transition-all",
                  isHighlighted
                    ? "bg-blue-100 border-l-4 border-blue-500 shadow-md"
                    : isCurrentUser
                      ? "bg-blue-50 border-l-4 border-blue-400"
                      : "bg-gray-100 border-l-4 border-gray-300",
                  "hover:shadow-sm",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      isCurrentUser ? "text-blue-700" : "text-gray-700",
                    )}
                  >
                    {message.user}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-800 break-words leading-relaxed">
                  {highlightText(message.text)}
                </p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
