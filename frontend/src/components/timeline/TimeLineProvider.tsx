import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

export interface TimeLineProviderValue {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollToTime: (hour: number) => void;
  registerColumn: (id: string, ref: React.RefObject<HTMLDivElement | null>) => void;
  unregisterColumn: (id: string) => void;
  currentTimePosition: number;
  hourHeight: number;
  totalHours: number;
}

const TimeLineContext = createContext<TimeLineProviderValue | null>(null);

const HOUR_HEIGHT = 120;
const TOTAL_HOURS = 24;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

function getCurrentTimePosition(): number {
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) * MINUTE_HEIGHT;
}

interface TimeLineProviderProps {
  children: ReactNode;
}

export function TimeLineProvider({ children }: TimeLineProviderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());
  const [currentTimePosition] = useState(getCurrentTimePosition);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update current time position every minute
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTime = useCallback((hour: number) => {
    const scrollPosition = hour * HOUR_HEIGHT - 100;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  const registerColumn = useCallback((id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    columnRefs.current.set(id, ref);
  }, []);

  const unregisterColumn = useCallback((id: string) => {
    columnRefs.current.delete(id);
  }, []);

  const value: TimeLineProviderValue = {
    scrollContainerRef,
    scrollToTime,
    registerColumn,
    unregisterColumn,
    currentTimePosition,
    hourHeight: HOUR_HEIGHT,
    totalHours: TOTAL_HOURS,
  };

  return (
    <TimeLineContext.Provider value={value}>
      {children}
    </TimeLineContext.Provider>
  );
}

export function useTimeLine(): TimeLineProviderValue {
  const context = useContext(TimeLineContext);
  if (!context) {
    throw new Error("useTimeLine must be used within a TimeLineProvider");
  }
  return context;
}
