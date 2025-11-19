import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  computeClusterGraph,
  ClusterGraph,
  Message,
} from "@/utils/nlpInMemory";

// Simple ID generator without external dependencies
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

interface InMemoryContextType {
  messages: Message[];
  clusterGraph: ClusterGraph;
  activeUsers: string[];
  addMessage: (user: string, text: string) => void;
  removeUserMessages: (user: string) => void;
  clearAllMessages: () => void;
  registerUser: (user: string) => void;
}

const InMemoryContext = createContext<InMemoryContextType | undefined>(
  undefined,
);

export function InMemoryDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [clusterGraph, setClusterGraph] = useState<ClusterGraph>({
    nodes: [],
    edges: [],
  });

  // Recompute graph whenever messages change
  useEffect(() => {
    const graph = computeClusterGraph(messages, 3);
    setClusterGraph(graph);
  }, [messages]);

  const addMessage = useCallback((user: string, text: string) => {
    const newMessage: Message = {
      id: generateId(),
      user,
      text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const removeUserMessages = useCallback((user: string) => {
    setMessages((prev) => prev.filter((msg) => msg.user !== user));
  }, []);

  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const registerUser = useCallback((user: string) => {
    setActiveUsers((prev) => {
      if (!prev.includes(user)) {
        return [...prev, user];
      }
      return prev;
    });
  }, []);

  const value: InMemoryContextType = {
    messages,
    clusterGraph,
    activeUsers,
    addMessage,
    removeUserMessages,
    clearAllMessages,
    registerUser,
  };

  return (
    <InMemoryContext.Provider value={value}>
      {children}
    </InMemoryContext.Provider>
  );
}

export function useInMemoryData(): InMemoryContextType {
  const context = useContext(InMemoryContext);
  if (context === undefined) {
    throw new Error("useInMemoryData must be used within InMemoryDataProvider");
  }
  return context;
}
