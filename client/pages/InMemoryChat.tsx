import React, { useState, useEffect } from "react";
import { useInMemoryData } from "@/context/InMemoryDataProvider";
import { InMemoryGraphVisualizer } from "@/components/InMemoryGraphVisualizer";
import { InMemoryChatWindow } from "@/components/InMemoryChatWindow";
import { InMemoryChatInput } from "@/components/InMemoryChatInput";
import { ClusterNode } from "@/utils/nlpInMemory";
import { LogOut, MessageCircle, Zap, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * InMemoryChat Page
 *
 * Features:
 * - Left half: Interactive D3 graph of word clusters
 * - Right half: Real-time chat window + input
 * - Click graph nodes to highlight messages containing that word
 * - User-based message management (logout removes user's messages)
 * - Session-only in-memory storage
 * - Responsive layout
 */
export default function InMemoryChat() {
  const navigate = useNavigate();
  const { messages, removeUserMessages, clearAllMessages } = useInMemoryData();

  // Current user state
  const [currentUser, setCurrentUser] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Graph interaction state
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);

  // Initialize user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("inMemoryChatUser");
    if (storedUser) {
      setCurrentUser(storedUser);
    } else {
      const newUser = `User_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      localStorage.setItem("inMemoryChatUser", newUser);
      setCurrentUser(newUser);
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin inline-block mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <p className="font-medium">Initializing chat...</p>
        </div>
      </div>
    );
  }

  const handleNodeClick = (node: ClusterNode) => {
    setSelectedNode(node);
  };

  const handleLogout = () => {
    localStorage.removeItem("inMemoryChatUser");
    setCurrentUser("");
    navigate("/");
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all messages? This cannot be undone.")) {
      clearAllMessages();
      setSelectedNode(null);
    }
  };

  const handleChangeUser = () => {
    const newUser = `User_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    localStorage.setItem("inMemoryChatUser", newUser);
    setCurrentUser(newUser);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">In-Memory Chat</h1>
              <p className="text-xs text-gray-400">
                {currentUser} • {messages.length} message
                {messages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleChangeUser}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
            >
              Switch User
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main content - split layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        {/* Left: Graph Visualizer */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              Word Clusters
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Click nodes to highlight messages containing that word
            </p>
          </div>
          <div className="flex-1 min-h-0 rounded-lg border border-white/10 shadow-2xl overflow-hidden">
            <InMemoryGraphVisualizer
              onNodeClick={handleNodeClick}
              highlightedNodeId={selectedNode?.id}
            />
          </div>
        </div>

        {/* Right: Chat Window + Input */}
        <div className="w-96 min-w-0 flex flex-col rounded-lg border border-white/10 shadow-2xl overflow-hidden bg-white">
          <InMemoryChatWindow
            currentUser={currentUser}
            highlightedWord={selectedNode?.label}
            highlightedMessageId={selectedNode?.messageIds[0]}
          />
          <InMemoryChatInput currentUser={currentUser} />
        </div>
      </div>

      {/* Footer - Info */}
      {selectedNode && (
        <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-md px-6 py-3 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>
              Selected:{" "}
              <span className="font-bold text-blue-400">
                {selectedNode.label}
              </span>{" "}
              ({selectedNode.frequency} occurrences across{" "}
              {selectedNode.messageIds.length} message
              {selectedNode.messageIds.length !== 1 ? "s" : ""})
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
