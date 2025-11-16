import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Message,
  fetchMessages,
  subscribeToMessages,
} from "@/utils/supabaseClient";
import { ClusterGraph } from "@/utils/nlp";

export interface ActiveWordInfo {
  word: string;
  firstMessageId: string;
  allMessageIds: string[];
}

interface SharedDataContextType {
  messages: Message[];
  clusterGraph: ClusterGraph | null;
  activeWordInfo: ActiveWordInfo | null;
  setActiveWord: (wordInfo: ActiveWordInfo | null) => void;
  addMessage: (message: Message) => void;
  refreshMessages: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(
  undefined
);

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [clusterGraph, setClusterGraph] = useState<ClusterGraph | null>(null);
  const [activeWordInfo, setActiveWordInfo] = useState<ActiveWordInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and fetch messages
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const initialMessages = await fetchMessages();
        setMessages(initialMessages);

        // Compute initial clusters (lazy import NLP)
        try {
          const { computeClusterGraph } = await import("@/utils/nlp");
          const graph = await computeClusterGraph(initialMessages, 3);
          setClusterGraph(graph);
        } catch (nlpError) {
          console.error("Error computing clusters:", nlpError);
          // Continue without clusters if NLP fails
          setClusterGraph(null);
        }

        setError(null);
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to initialize data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMessages(async (newMessage: Message) => {
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Recompute clusters when messages change
  useEffect(() => {
    const recomputeClusters = async () => {
      try {
        const { computeClusterGraph } = await import("@/utils/nlp");
        const graph = await computeClusterGraph(messages, 3);
        setClusterGraph(graph);
      } catch (err) {
        console.error("Error computing clusters:", err);
        // Keep previous graph if recomputation fails
      }
    };

    if (messages.length > 0) {
      recomputeClusters();
    } else {
      setClusterGraph(null);
    }
  }, [messages]);

  const handleAddMessage = (message: Message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) {
        return prev;
      }
      return [...prev, message];
    });
  };

  const handleRefreshMessages = async () => {
    try {
      setIsLoading(true);
      const updatedMessages = await fetchMessages();
      setMessages(updatedMessages);
      setError(null);
    } catch (err) {
      console.error("Error refreshing messages:", err);
      setError("Failed to refresh messages");
    } finally {
      setIsLoading(false);
    }
  };

  const value: SharedDataContextType = {
    messages,
    clusterGraph,
    activeWordInfo,
    setActiveWord: setActiveWordInfo,
    addMessage: handleAddMessage,
    refreshMessages: handleRefreshMessages,
    isLoading,
    error,
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData(): SharedDataContextType {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error("useSharedData must be used within SharedDataProvider");
  }
  return context;
}
