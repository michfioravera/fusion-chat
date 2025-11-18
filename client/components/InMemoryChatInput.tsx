import React, { useState } from "react";
import { useInMemoryData } from "@/context/InMemoryDataProvider";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  currentUser: string;
}

/**
 * ChatInput Component
 * - Text input field for composing messages
 * - Send button that adds message to shared state
 * - Clears input after successful send
 * - Displays character count
 */
export const InMemoryChatInput: React.FC<ChatInputProps> = ({
  currentUser,
}) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { addMessage } = useInMemoryData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    setIsSending(true);

    // Simulate slight delay for UX
    setTimeout(() => {
      addMessage(currentUser, input);
      setInput("");
      setIsSending(false);
    }, 50);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 space-y-2"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Type a message as ${currentUser}...`}
          disabled={isSending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className={cn(
            "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors",
            input.trim() && !isSending
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
      <div className="text-xs text-gray-500 text-right">
        {input.length} characters
      </div>
    </form>
  );
};
