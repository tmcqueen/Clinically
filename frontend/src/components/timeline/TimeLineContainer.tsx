import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Box, ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import dayjs from "dayjs";
import {
  MIN_COLUMN_WIDTH,
  MAX_VISIBLE_COLUMNS,
  SCROLL_ARROW_WIDTH,
  HOUR_HEIGHT,
  snapToQuarterHour,
  timeToMinutes,
  getAppointmentDuration,
  type CalendarEvent,
  type Employee,
  type DragState,
} from "./TimeLineBase";
import { TimeLineProvider, useTimeLine } from "./TimeLineProvider";
import { TimeLineRuler, TimeLineRulerHeader } from "./TimeLineRuler";
import { TimeLineSchedulesContainer, TimeLineSchedulesHeader } from "./TimeLineSchedulesContainer";

interface TimeLineContainerProps {
  events: CalendarEvent[];
  employees: Employee[];
  selectedDate: string;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (eventId: string, newProviderId: string, newStart: string, newEnd: string) => void;
}

function TimeLineContainerInner({
  events,
  employees,
  selectedDate,
  onEventClick,
  onEventDrop,
}: TimeLineContainerProps) {
  useTimeLine();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    activeEvent: null,
    snapPosition: null,
    targetProviderId: null,
    originalProviderId: null,
    originalStartMinutes: null,
    originalEndMinutes: null,
  });

  const minutesToTimeStr = (minutes: number): string => {
    return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:00`;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollPosition = currentHour * HOUR_HEIGHT - 100;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimePosition((now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedDay = dayjs(selectedDate);
  const isToday = selectedDay.isSame(dayjs(), "day");

  const filteredEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [employees]);

  const visibleEmployees = filteredEmployees.slice(scrollOffset, scrollOffset + MAX_VISIBLE_COLUMNS);
  const showScrollArrows = filteredEmployees.length > MAX_VISIBLE_COLUMNS;

  const columnWidth = Math.max(
    MIN_COLUMN_WIDTH,
    (containerWidth - SCROLL_ARROW_WIDTH * 2 - (showScrollArrows ? SCROLL_ARROW_WIDTH * 2 : 0)) / MAX_VISIBLE_COLUMNS
  );

  const getEmployeeEvents = (employeeId: string): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(selectedDay, "day") && event.clinicianId === employeeId;
    });
  };

  const getUnassignedEvents = (): CalendarEvent[] => {
    const assignedIds = new Set(filteredEmployees.map((e) => e.id));
    return events.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(selectedDay, "day") && !assignedIds.has(event.clinicianId);
    });
  };

  const unassignedEvents = getUnassignedEvents();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeEvent = event.active.data.current?.event as CalendarEvent | undefined;
    if (activeEvent) {
      const startMinutes = timeToMinutes(activeEvent.start);
      const endMinutes = timeToMinutes(activeEvent.end);
      setDragState({
        isDragging: true,
        activeEvent,
        snapPosition: startMinutes,
        targetProviderId: activeEvent.clinicianId,
        originalProviderId: activeEvent.clinicianId,
        originalStartMinutes: startMinutes,
        originalEndMinutes: endMinutes,
      });
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !dragState.activeEvent) {
        setDragState({
          isDragging: false,
          activeEvent: null,
          snapPosition: null,
          targetProviderId: null,
          originalProviderId: null,
          originalStartMinutes: null,
          originalEndMinutes: null,
        });
        return;
      }

      const activeData = active.data.current;
      if (!activeData || activeData.type !== "appointment") {
        setDragState({
          isDragging: false,
          activeEvent: null,
          snapPosition: null,
          targetProviderId: null,
          originalProviderId: null,
          originalStartMinutes: null,
          originalEndMinutes: null,
        });
        return;
      }

      const draggedEvent = activeData.event as CalendarEvent;
      const dropTargetProviderId = over.id as string;

      let dropTargetMinutes = 0;
      if (over.data.current?.minutes !== undefined) {
        dropTargetMinutes = Number(over.data.current.minutes);
      } else if (over.data.current?.type === "provider") {
        dropTargetMinutes = timeToMinutes(draggedEvent.start);
      }

      const snappedMinutes = snapToQuarterHour(dropTargetMinutes);
      const duration = getAppointmentDuration(draggedEvent.start, draggedEvent.end);
      const newStartMinutes = snappedMinutes;
      const newEndMinutes = snappedMinutes + duration;

      console.log("Dropping appointment:", {
        eventId: draggedEvent.id,
        newProviderId: dropTargetProviderId,
        newStartMinutes,
        newEndMinutes,
      });

      if (onEventDrop) {
        const newStart = minutesToTimeStr(newStartMinutes);
        const newEnd = minutesToTimeStr(newEndMinutes);
        onEventDrop(draggedEvent.id, dropTargetProviderId, newStart, newEnd);
      }

      setDragState({
        isDragging: false,
        activeEvent: null,
        snapPosition: null,
        targetProviderId: null,
        originalProviderId: null,
        originalStartMinutes: null,
        originalEndMinutes: null,
      });
    },
    [dragState.activeEvent, onEventDrop]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box 
          style={{ 
            display: "flex", 
            borderBottom: "1px solid #ccc", 
            flexShrink: 0, 
            height: 40,
            position: "sticky",
            top: 0,
            zIndex: 20,
            backgroundColor: "white",
          }} 
        >
          {showScrollArrows && (
            <Box
              style={{
                width: SCROLL_ARROW_WIDTH,
                flexShrink: 0,
                backgroundColor: "white",
                borderRight: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActionIcon variant="subtle" size="sm" onClick={() => setScrollOffset(Math.max(0, scrollOffset - 1))}>
                <IconChevronLeft size={16} />
              </ActionIcon>
            </Box>
          )}

          <Box
            style={{
              width: SCROLL_ARROW_WIDTH,
              flexShrink: 0,
              backgroundColor: "#e8e8e8",
              borderRight: "1px solid #ccc",
            }}
          />

          <TimeLineRulerHeader />

          <Box style={{ display: "flex", overflow: "hidden" }}>
            {visibleEmployees.map((emp) => (
              <TimeLineSchedulesHeader key={emp.id} employee={emp} columnWidth={columnWidth} />
            ))}
            {unassignedEvents.length > 0 && <TimeLineSchedulesHeader employee={null} columnWidth={columnWidth} />}
          </Box>

          {showScrollArrows && (
            <Box
              style={{
                width: SCROLL_ARROW_WIDTH,
                flexShrink: 0,
                backgroundColor: "white",
                borderLeft: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActionIcon variant="subtle" size="sm" onClick={() => setScrollOffset(scrollOffset + 1)}>
                <IconChevronRight size={16} />
              </ActionIcon>
            </Box>
          )}
        </Box>

        <Box ref={scrollRef} style={{ flex: 1, overflow: "auto", display: "flex" }}>
          <Box
            style={{
              width: SCROLL_ARROW_WIDTH,
              flexShrink: 0,
              backgroundColor: "#e8e8e8",
              position: "sticky",
              left: 0,
              zIndex: 5,
            }}
          />

          <TimeLineRuler showCurrentTime={isToday} currentTimePosition={currentTimePosition} />

          <Box style={{ display: "flex", flexShrink: 0, position: "relative" }}>
            {visibleEmployees.map((emp) => (
              <TimeLineSchedulesContainer
                key={emp.id}
                providerId={emp.id}
                events={getEmployeeEvents(emp.id)}
                columnWidth={columnWidth}
                showCurrentTime={isToday}
                currentTimePosition={currentTimePosition}
                onEventClick={onEventClick}
              />
            ))}
            {unassignedEvents.length > 0 && (
              <TimeLineSchedulesContainer
                providerId="unassigned"
                events={unassignedEvents}
                columnWidth={columnWidth}
                showCurrentTime={isToday}
                currentTimePosition={currentTimePosition}
                onEventClick={onEventClick}
              />
            )}
          </Box>

          {showScrollArrows && (
            <Box
              style={{
                width: SCROLL_ARROW_WIDTH,
                flexShrink: 0,
                backgroundColor: "#e8e8e8",
                borderLeft: "1px solid #ccc",
              }}
            />
          )}
        </Box>
      </Box>

      <DragOverlay>
        {dragState.isDragging && dragState.activeEvent && (
          <Box
            style={{
              position: "fixed",
              pointerEvents: "none",
              zIndex: 1000,
              opacity: 0.5,
            }}
          >
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export function TimeLineContainer(props: TimeLineContainerProps) {
  return (
    <TimeLineProvider>
      <TimeLineContainerInner {...props} />
    </TimeLineProvider>
  );
}
