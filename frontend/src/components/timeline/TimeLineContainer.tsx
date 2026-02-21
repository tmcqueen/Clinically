import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Box, ActionIcon, Paper, Text } from "@mantine/core";
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
  clinicianColors,
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
    originalProviderId: string;
    originalStartMinutes: number;
    originalEndMinutes: number;
  } | null>(null);
  const [conflictingEvent, setConflictingEvent] = useState<ConflictInfo | null>(null);

  const minutesToTimeStr = (minutes: number): string => {
    return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:00`;
  };

  useHotkeys([
    ["alt+o", () => setShowAvailableSlots((prev) => !prev)],
  ]);

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

      if (!isValid) {
        // Drop is invalid - either doesn't fit in zone or has conflict
        setDragState({
          isDragging: false,
          activeEvent: null,
          snapPosition: null,
          targetProviderId: null,
          originalProviderId: null,
          originalStartMinutes: null,
          originalEndMinutes: null,
        });
        
        if (conflictingEventInfo) {
          // Show conflict modal
          const clinician = filteredEmployees.find((emp) => emp.id === conflictingEventInfo.clinicianId);
          
          setConflictingEvent({
            eventId: conflictingEventInfo.id,
            patientName: conflictingEventInfo.patientName,
            visitType: conflictingEventInfo.visitType,
            start: conflictingEventInfo.start,
            end: conflictingEventInfo.end,
            clinicianName: clinician?.displayName || "Unknown",
            clinicianId: conflictingEventInfo.clinicianId,
          });
          
          setPendingDrop({
            event: draggedEvent,
            providerId: dropTargetProviderId,
            startMinutes: newStartMinutes,
            endMinutes: newEndMinutes,
            originalProviderId: dragState.originalProviderId,
            originalStartMinutes: dragState.originalStartMinutes,
            originalEndMinutes: dragState.originalEndMinutes,
          });
          
          setConflictModalOpen(true);
        }
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

        // Move conflicting to original position
        const { originalProviderId, originalStartMinutes, originalEndMinutes } = pendingDrop;
        if (originalProviderId && originalStartMinutes !== null && originalEndMinutes !== null) {
          const origStart = minutesToTimeStr(originalStartMinutes);
          const origEnd = minutesToTimeStr(originalEndMinutes);
          onEventDrop(conflictingEvent.eventId, originalProviderId, origStart, origEnd);
        }
      } else if (option === "move-next") {
        // Move conflicting to next available slot on its current provider
        const conflictingProviderId = conflictingEvent.clinicianId;
        const conflictingDuration = timeToMinutes(conflictingEvent.end) - timeToMinutes(conflictingEvent.start);
        const conflictingCurrentEndMinutes = timeToMinutes(conflictingEvent.end);

        // Get events for this provider on the selected date
        const providerEvents = events.filter(
          (e) => e.clinicianId === conflictingProviderId && e.start.startsWith(selectedDate)
        ).sort((a, b) => a.start.localeCompare(b.start));

        // Find next available slot after the conflicting event
        let nextStartMinutes = snapToQuarterHour(conflictingCurrentEndMinutes);
        let foundSlot = false;

        // Sort by start time and find gap after conflicting event
        const sortedEvents = [...providerEvents].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        
        for (const evt of sortedEvents) {
          const evtStart = timeToMinutes(evt.start);
          const evtEnd = timeToMinutes(evt.end);
          
          // Skip the conflicting event itself
          if (evt.id === conflictingEvent.eventId) continue;

          // If this event starts after our proposed start time
          if (evtStart >= nextStartMinutes) {
            // Check if there's enough gap
            if (evtStart >= nextStartMinutes + conflictingDuration) {
              foundSlot = true;
              break;
            } else {
              // Move past this event
              nextStartMinutes = snapToQuarterHour(evtEnd);
            }
          }
        }

        // If no slot found in existing events, check if it fits until end of day (5 PM = 1020 minutes)
        if (!foundSlot) {
          const dayEndMinutes = 17 * 60; // 5 PM
          if (nextStartMinutes + conflictingDuration <= dayEndMinutes) {
            foundSlot = true;
          } else {
            // Try earlier in the day - find first gap from start
            nextStartMinutes = 0;
            for (const evt of sortedEvents) {
              if (evt.id === conflictingEvent.eventId) continue;
              const evtStart = timeToMinutes(evt.start);
              const evtEnd = timeToMinutes(evt.end);
              
              if (evtStart >= nextStartMinutes + conflictingDuration) {
                foundSlot = true;
                break;
              }
              nextStartMinutes = snapToQuarterHour(evtEnd);
            }
          }
        }

        if (foundSlot) {
          const nextStart = minutesToTimeStr(nextStartMinutes);
          const nextEnd = minutesToTimeStr(nextStartMinutes + conflictingDuration);
          onEventDrop(conflictingEvent.eventId, conflictingProviderId, nextStart, nextEnd);
        }

        // Also move the dragged event to the target
        const draggedStart = minutesToTimeStr(startMinutes);
        const draggedEnd = minutesToTimeStr(endMinutes);
        onEventDrop(event.id, providerId, draggedStart, draggedEnd);
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
            }}
          >
            <Paper
              p="xs"
              style={{
                width: 150,
                height: 60,
                backgroundColor: clinicianColors[dragState.activeEvent.clinicianId] || "gray",
                opacity: 0.8,
              }}
            >
              <Text size="xs" c="white" fw={500} lineClamp={1}>
                {dayjs(dragState.activeEvent.start).format("h:mm A")} - {dragState.activeEvent.patientName}
              </Text>
              <Text size="xs" c="white" opacity={0.8} lineClamp={1}>
                {dragState.activeEvent.visitType}
              </Text>
            </Paper>
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
            clinicianId: "",
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
