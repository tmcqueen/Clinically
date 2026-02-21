import { useRef } from "react";
import { Box, Text, Paper } from "@mantine/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import {
  HOUR_HEIGHT,
  TOTAL_HOURS,
  QUARTER_HOURS,
  clinicianColors,
  type CalendarEvent,
  type Employee,
} from "./TimeLineBase";

interface TimeLineSchedulesContainerProps {
  events: CalendarEvent[];
  columnWidth: number;
  showCurrentTime?: boolean;
  currentTimePosition?: number;
  onEventClick?: (event: CalendarEvent) => void;
  providerId?: string;
}

function getEventColor(event: CalendarEvent): string {
  return clinicianColors[event.clinicianId] || "gray";
}

interface DraggableAppointmentProps {
  event: CalendarEvent;
  onClick?: () => void;
}

function DraggableAppointment({ event, onClick }: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: {
      event,
    type: "appointment",
    },
  });

  const start = dayjs(event.start);
  const end = dayjs(event.end);
  const durationMinutes = end.diff(start, "minute");
  const top = (start.hour() * 60 + start.minute()) * (HOUR_HEIGHT / 60);
  const height = Math.max(durationMinutes * (HOUR_HEIGHT / 60) - 4, 20);

  const style: React.CSSProperties = {
    position: "absolute",
    top: top + 2,
    left: 4,
    right: 4,
    height,
    backgroundColor: getEventColor(event),
    cursor: "grab",
    zIndex: isDragging ? 60 : 5,
    overflow: "hidden",
    opacity: isDragging ? 0.3 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    touchAction: "none",
  };

  return (
    <Paper
      ref={setNodeRef}
      p="xs"
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <Text size="xs" c="white" fw={500} lineClamp={1}>
        {start.format("h:mm A")} - {event.patientName}
      </Text>
      <Text size="xs" c="white" opacity={0.8} lineClamp={1}>
        {event.visitType}
      </Text>
    </Paper>
  );
}

export function TimeLineSchedulesContainer({
  events,
  columnWidth,
  showCurrentTime = false,
  currentTimePosition = 0,
  onEventClick,
  providerId,
}: TimeLineSchedulesContainerProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);
  const columnRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: providerId || "unassigned",
    data: {
      type: "provider",
      providerId: providerId || "unassigned",
    },
  });

  return (
    <Box
      ref={(node) => {
        columnRef.current = node;
        setNodeRef(node);
      }}
      style={{
        width: columnWidth,
        flexShrink: 0,
        position: "relative",
        borderRight: "1px solid #ddd",
        backgroundColor: isOver ? "rgba(34, 197, 94, 0.1)" : "transparent",
        transition: "background-color 0.2s",
      }}
    >
      {hours.map((hour) => (
        <Box
          key={hour}
          style={{
            height: HOUR_HEIGHT,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {QUARTER_HOURS.slice(1).map((q) => (
            <Box
              key={q}
              style={{
                height: HOUR_HEIGHT / 4,
                backgroundColor: q === 15 || q === 45 ? "rgba(33, 102, 204, 0.08)" : "transparent",
                borderBottom: q === 30 ? "1px solid #eee" : "1px dashed #f0f0f0",
              }}
            />
          ))}
        </Box>
      ))}

      {showCurrentTime && (
        <Box
          style={{
            position: "absolute",
            top: currentTimePosition,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "rgba(255, 0, 0, 0.4)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}

      {events.map((event) => {
        return (
          <DraggableAppointment
            key={event.id}
            event={event}
            onClick={() => onEventClick?.(event)}
          />
        );
      })}
    </Box>
  );
}

interface TimeLineSchedulesHeaderProps {
  employee: Employee | null;
  columnWidth: number;
}

export function TimeLineSchedulesHeader({ employee, columnWidth }: TimeLineSchedulesHeaderProps) {
  if (!employee) {
    return (
      <Box
        style={{
          width: columnWidth,
          flexShrink: 0,
          padding: "4px 8px",
          textAlign: "center",
          borderRight: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 40,
        }}
      >
        <Text size="xs" fw={600}>Unassigned</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: columnWidth,
        flexShrink: 0,
        padding: "4px 8px",
        textAlign: "center",
        borderRight: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 40,
      }}
    >
      <Text size="xs" fw={600}>{employee.displayName}</Text>
      <Text size="xs" c="dimmed">{employee.credentials}</Text>
    </Box>
  );
}
