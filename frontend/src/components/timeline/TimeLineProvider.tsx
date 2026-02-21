import { createContext, useContext } from "react";

interface TimeLineContextValue {
  selectedDate: string;
}

const TimeLineContext = createContext<TimeLineContextValue | null>(null);

export function TimeLineProvider({ children }: { children: React.ReactNode }) {
  return (
    <TimeLineContext.Provider value={{ selectedDate: "" }}>
      {children}
    </TimeLineContext.Provider>
  );
}

export function useTimeLine() {
  const context = useContext(TimeLineContext);
  if (!context) {
    return { selectedDate: "" };
  }
  return context;
}
