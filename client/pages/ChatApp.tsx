import React, { useRef, useState, useEffect } from "react";
import { MessageClusterGraph } from "@/components/MessageClusterGraph";
import { ChatPanel } from "@/components/ChatPanel";
import { WordHighlightOverlay } from "@/components/WordHighlightOverlay";
import { deleteUserMessages } from "@/utils/supabaseClient";
import { AlertCircle, Zap } from "lucide-react";

async function importSharedData() {
  const { useSharedData, SharedDataProvider } = await import("@/context/SharedDataProvider");
  return { useSharedData, SharedDataProvider };
}

function ChatAppContent() {
  const { useSharedData } = require("@/context/SharedDataProvider");

  const {
    messages,
    clusterGraph,
    activeWordInfo,
    setActiveWord,
    addMessage,
    isLoading,
    error,
  } = useSharedData();
  const {
    messages,
    clusterGraph,
    activeWordInfo,
    setActiveWord,
    addMessage,
    isLoading,
    error,
  } = useSharedData();

  const chatPanelRef = useRef<{ scrollToMessage: (id: string) => void }>(null);
  const [userId, setUserId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("chatUserId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsInitialized(true);
    } else {
      const newUserId = `user-${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("chatUserId", newUserId);
      setUserId(newUserId);
      setIsInitialized(true);
    }
  }, []);

  const handleNodeClick = (nodeData: {
    word: string;
    firstMessageId: string;
    allMessageIds: string[];
  }) => {
    setActiveWord(nodeData);
    // Scroll to the first message
    chatPanelRef.current?.scrollToMessage(nodeData.firstMessageId);
  };

  const handleLogout = async () => {
    await deleteUserMessages(userId);
    // Refresh localStorage and reset user
    localStorage.removeItem("chatUserId");
    const newUserId = `user-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("chatUserId", newUserId);
    setUserId(newUserId);
    setActiveWord(null);
  };

  if (!isInitialized) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin inline-block mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center gap-2">
          <div className="animate-spin inline-block">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700">Loading messages and clustering...</p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        {/* Left: Graph */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              Message Clusters
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Click on nodes to highlight messages containing that word
            </p>
          </div>
          <div className="flex-1 min-h-0 rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            {clusterGraph && clusterGraph.nodes.length > 0 ? (
              <MessageClusterGraph
                graphData={clusterGraph}
                onNodeClick={handleNodeClick}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                  <p className="text-gray-500 font-medium">No data to visualize yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start chatting to create clusters
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="w-80 min-w-0 flex flex-col rounded-lg border border-gray-200 shadow-lg overflow-hidden bg-white">
          <ChatPanel
            ref={chatPanelRef}
            messages={messages}
            userId={userId}
            activeWord={activeWordInfo?.word}
            activeIds={activeWordInfo?.allMessageIds}
            onMessageAdded={addMessage}
            onLogout={handleLogout}
          />
          {/* Word highlight overlay */}
          {activeWordInfo && (
            <WordHighlightOverlay
              activeWordInfo={activeWordInfo}
              messages={messages}
              onMarkerClick={(messageId) => {
                chatPanelRef.current?.scrollToMessage(messageId);
              }}
            />
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="border-t border-gray-200 bg-white px-4 py-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>User ID: <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code></span>
          <span>Messages: <span className="font-semibold text-gray-800">{messages.length}</span></span>
          <span>Clusters: <span className="font-semibold text-gray-800">{clusterGraph?.nodes.length || 0}</span></span>
        </div>
      </div>
    </div>
  );
}
