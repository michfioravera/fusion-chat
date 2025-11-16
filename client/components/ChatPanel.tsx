import React, { useState, useRef } from "react";
import { Message, insertMessage } from "@/utils/supabaseClient";
import { MessageList } from "./MessageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: Message[];
  userId: string;
  activeWord?: string;
  activeIds?: string[];
  onMessageAdded?: (message: Message) => void;
  onLogout?: () => void;
}

export const ChatPanel = React.forwardRef<
  { scrollToMessage: (id: string) => void },
  ChatPanelProps
>(
  (
    {
      messages,
      userId,
      activeWord,
      activeIds = [],
      onMessageAdded,
      onLogout,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messageListRef = useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
      scrollToMessage: (id: string) => {
        messageListRef.current?.scrollToMessage(id);
      },
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!inputValue.trim()) {
        return;
      }

      try {
        setIsSending(true);
        const newMessage = await insertMessage(userId, inputValue);
        if (newMessage) {
          onMessageAdded?.(newMessage);
          setInputValue("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsSending(false);
      }
    };

    const handleLogout = () => {
      setInputValue("");
      onLogout?.();
    };

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Chat Messages
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Messages */}
        <MessageList
          ref={messageListRef}
          messages={messages}
          activeWord={activeWord}
          activeIds={activeIds}
        />

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 bg-white space-y-2"
        >
          <div className="flex items-end gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            {inputValue.length > 0 && `${inputValue.length} characters`}
          </p>
        </form>
      </div>
    );
  }
);

ChatPanel.displayName = "ChatPanel";
