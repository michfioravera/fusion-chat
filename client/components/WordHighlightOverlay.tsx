import React, { useState, useEffect, useRef } from "react";
import { Message } from "@/utils/supabaseClient";
import { cn } from "@/lib/utils";

interface WordHighlightOverlayProps {
  activeWordInfo: {
    word: string;
    firstMessageId: string;
    allMessageIds: string[];
  } | null;
  messages: Message[];
  onMarkerClick?: (messageId: string) => void;
}

interface MarkerPosition {
  messageId: string;
  position: number; // 0-100, percentage from top
}

export const WordHighlightOverlay: React.FC<WordHighlightOverlayProps> = ({
  activeWordInfo,
  messages,
  onMarkerClick,
}) => {
  const [markers, setMarkers] = useState<MarkerPosition[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeWordInfo || activeWordInfo.allMessageIds.length === 0) {
      setMarkers([]);
      return;
    }

    if (!scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const totalHeight = container.scrollHeight;

    // Calculate marker positions based on message order
    const markerPositions: MarkerPosition[] = activeWordInfo.allMessageIds
      .map((messageId) => {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) {
          return null;
        }

        // Estimate position based on message index
        const estimatedPosition = (messageIndex / Math.max(messages.length - 1, 1)) * 100;

        return {
          messageId,
          position: Math.max(0, Math.min(100, estimatedPosition)),
        };
      })
      .filter((m): m is MarkerPosition => m !== null);

    setMarkers(markerPositions);
  }, [activeWordInfo, messages]);

  if (!activeWordInfo || markers.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="absolute right-0 top-0 w-8 h-full bg-gradient-to-r from-transparent to-gray-100 border-l border-gray-200"
    >
      {markers.map((marker) => (
        <div
          key={marker.messageId}
          className="absolute left-0 right-0 w-full transform -translate-y-1/2 cursor-pointer group"
          style={{
            top: `${marker.position}%`,
          }}
          onClick={() => onMarkerClick?.(marker.messageId)}
          title={`Jump to message containing "${activeWordInfo.word}"`}
        >
          {/* Marker dot */}
          <div
            className={cn(
              "absolute right-1.5 w-3 h-3 rounded-full transition-all",
              marker.messageId === activeWordInfo.firstMessageId
                ? "bg-blue-600 ring-2 ring-blue-300 scale-125"
                : "bg-blue-400 hover:bg-blue-500 hover:scale-110"
            )}
            style={{
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {/* Tooltip */}
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
            {marker.messageId === activeWordInfo.firstMessageId
              ? "First occurrence"
              : `Message ${markers.indexOf(marker) + 1}`}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap pointer-events-none hidden group-hover:block">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span>First</span>
        </div>
      </div>
    </div>
  );
};
