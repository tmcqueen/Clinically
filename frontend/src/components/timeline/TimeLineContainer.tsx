import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Box, ActionIcon } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
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
  calculateDropZones,
  timeToMinutes,
  getAppointmentDuration,
  type CalendarEvent,
  type Employee,
  type DragState,
} from "./TimeLineBase";
import { TimeLineProvider, useTimeLine } from "./TimeLineProvider";
import { TimeLineRuler, TimeLineRulerHeader } from "./TimeLineRuler";
import { TimeLineSchedulesContainer, TimeLineSchedulesHeader } from "./TimeLineSchedulesContainer";
import { AvailableSlotsOverlay } from "./AvailableSlotsOverlay";
import { ConflictResolutionModal, type ConflictResolutionOption, type ConflictInfo } from "./ConflictResolutionModal";

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
  useTimeLine(); // Initialize provider
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
  const [validDropZones, setValidDropZones] = useState<Map<string, { start: number; end: number }[]>>(new Map());
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    event: CalendarEvent;
    providerId: string;
    startMinutes: number;
    endMinutes: number;
  } | null>(null);
  const [conflictingEvent, setConflictingEvent] = useState<ConflictInfo | null>(null);

  const minutesToTimeStr = (minutes: number): string => {
    return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:00`;
  };

  useHotkeys([
    ["alt+o", () => setShowAvailableSlots((prev) => !prev)],
  ]);

  useEffect(() => {
    if (!showAvailableSlots) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAvailableSlots(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAvailableSlots]);

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

  // Calculate drop zones for all providers
  useEffect(() => {
    const zones = new Map<string, { start: number; end: number }[]>();
    for (const emp of filteredEmployees) {
      const empEvents = getEmployeeEvents(emp.id);
      const dropZones = calculateDropZones(empEvents, emp.id, selectedDate);
      zones.set(emp.id, dropZones.map((z) => ({ start: z.startMinutes, end: z.endMinutes })));
    }
    setValidDropZones(zones);
  }, [events, selectedDate, filteredEmployees, selectedDate]);

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
      const dropTargetMinutes = Number(over.data.current?.minutes) || 0;

      const snappedMinutes = snapToQuarterHour(dropTargetMinutes);
      const duration = getAppointmentDuration(draggedEvent.start, draggedEvent.end);
      const newStartMinutes = snappedMinutes;
      const newEndMinutes = snappedMinutes + duration;

      const minutesToTimeStr = (minutes: number): string => {
        return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:00`;
      };

      // Check if drop is valid
      const providerZones = validDropZones.get(dropTargetProviderId) || [];
      const isValidDrop = providerZones.some(
        (zone) => newStartMinutes >= zone.start && newEndMinutes <= zone.end
      );

      // Check for conflicts (appointments at same time)
      const targetEvents = getEmployeeEvents(dropTargetProviderId).filter(
        (e) => e.id !== draggedEvent.id
      );
      const conflictingEventInfo = targetEvents.find((e) => {
        const eStart = timeToMinutes(e.start);
        const eEnd = timeToMinutes(e.end);
        return newStartMinutes < eEnd && newEndMinutes > eStart;
      });

      const hasConflict = !!conflictingEventInfo;
      const isValid = isValidDrop && !hasConflict;

      if (!isValid && conflictingEventInfo) {
        // Get clinician name for the conflicting event
        const clinician = filteredEmployees.find((emp) => emp.id === conflictingEventInfo.clinicianId);
        
        setConflictingEvent({
          eventId: conflictingEventInfo.id,
          patientName: conflictingEventInfo.patientName,
          visitType: conflictingEventInfo.visitType,
          start: conflictingEventInfo.start,
          end: conflictingEventInfo.end,
          clinicianName: clinician?.displayName || "Unknown",
        });
        
        setPendingDrop({
          event: draggedEvent,
          providerId: dropTargetProviderId,
          startMinutes: newStartMinutes,
          endMinutes: newEndMinutes,
        });
        
        setConflictModalOpen(true);
        
        // Reset drag state but don't complete the drop yet
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
    [dragState.activeEvent, validDropZones, getEmployeeEvents, onEventDrop, filteredEmployees]
  );

  const handleConflictResolve = useCallback(
    (option: ConflictResolutionOption) => {
      if (!pendingDrop || !conflictingEvent || !onEventDrop) {
        setConflictModalOpen(false);
        setPendingDrop(null);
        setConflictingEvent(null);
        return;
      }

      const { event, providerId, startMinutes, endMinutes } = pendingDrop;

      if (option === "cancel") {
        // Do nothing - just close modal
        setConflictModalOpen(false);
        setPendingDrop(null);
        setConflictingEvent(null);
        return;
      }

      if (option === "force") {
        // Force drop - overwrite conflicting appointment
        const newStart = minutesToTimeStr(startMinutes);
        const newEnd = minutesToTimeStr(endMinutes);
        onEventDrop(event.id, providerId, newStart, newEnd);
      } else if (option === "swap") {
        // Swap - dragged goes to target, conflicting goes to dragged's original position
        // Move dragged to new position
        const newStart = minutesToTimeStr(startMinutes);
        const newEnd = minutesToTimeStr(endMinutes);
        onEventDrop(event.id, providerId, newStart, newEnd);
        
        // TODO: Move conflicting to original position (need to find where original was)
        // This would require knowing the original provider and time
      } else if (option === "move-next") {
        // Move conflicting to next available slot
        // TODO: Find next available slot for the conflicting event
        // For now, treat as force drop
        const newStart = minutesToTimeStr(startMinutes);
        const newEnd = minutesToTimeStr(endMinutes);
        onEventDrop(event.id, providerId, newStart, newEnd);
      }

      setConflictModalOpen(false);
      setPendingDrop(null);
      setConflictingEvent(null);
    },
    [pendingDrop, conflictingEvent, onEventDrop]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* HEADER ROW - Sticky at top */}
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
          {/* Left Scroll Arrow */}
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

          {/* Left Spacer */}
          <Box
            style={{
              width: SCROLL_ARROW_WIDTH,
              flexShrink: 0,
              backgroundColor: "#e8e8e8",
              borderRight: "1px solid #ccc",
            }}
          />

          {/* Time Header */}
          <TimeLineRulerHeader />

          {/* Provider Headers */}
          <Box style={{ display: "flex", overflow: "hidden" }}>
            {visibleEmployees.map((emp) => (
              <TimeLineSchedulesHeader key={emp.id} employee={emp} columnWidth={columnWidth} />
            ))}
            {unassignedEvents.length > 0 && <TimeLineSchedulesHeader employee={null} columnWidth={columnWidth} />}
          </Box>

          {/* Right Scroll Arrow */}
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

        {/* SCROLLABLE BODY */}
        <Box ref={scrollRef} style={{ flex: 1, overflow: "auto", display: "flex" }}>
          {/* Left Spacer */}
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

          {/* Time Ruler */}
          <TimeLineRuler showCurrentTime={isToday} currentTimePosition={currentTimePosition} />

          {/* Provider Columns */}
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
            {/* Available Slots Overlay */}
            {showAvailableSlots && (
              <AvailableSlotsOverlay
                events={events}
                employees={filteredEmployees}
                selectedDate={selectedDate}
                columnWidth={columnWidth}
                visibleEmployeeIds={visibleEmployees.map((e) => e.id)}
              />
            )}
          </Box>

          {/* Right Spacer */}
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

      {/* Drag Overlay for ghost at original position */}
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
            {/* Ghost will be rendered at original position */}
          </Box>
        )}
      </DragOverlay>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        opened={conflictModalOpen}
        onClose={() => {
          setConflictModalOpen(false);
          setPendingDrop(null);
          setConflictingEvent(null);
        }}
        onResolve={handleConflictResolve}
        draggedEvent={
          pendingDrop
            ? {
                patientName: pendingDrop.event.patientName,
                visitType: pendingDrop.event.visitType,
                start: minutesToTimeStr(pendingDrop.startMinutes),
                end: minutesToTimeStr(pendingDrop.endMinutes),
              }
            : { patientName: "", visitType: "", start: "", end: "" }
        }
        conflictingEvent={
          conflictingEvent || {
            eventId: "",
            patientName: "",
            visitType: "",
            start: "",
            end: "",
            clinicianName: "",
          }
        }
      />
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
