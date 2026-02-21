import { Box } from "@mantine/core";
import dayjs from "dayjs";
import {
  HOUR_HEIGHT,
  calculateDropZones,
  type CalendarEvent,
  type Employee,
} from "./TimeLineBase";

interface AvailableSlotsOverlayProps {
  events: CalendarEvent[];
  employees: Employee[];
  selectedDate: string;
  columnWidth: number;
  leftOffset: number;
  visibleEmployeeIds: string[];
}

export function AvailableSlotsOverlay({
  events,
  employees,
  selectedDate,
  columnWidth,
  leftOffset,
  visibleEmployeeIds,
}: AvailableSlotsOverlayProps) {
  const visibleEmployees = employees.filter((emp) =>
    visibleEmployeeIds.includes(emp.id)
  );

  const getEmployeeEvents = (employeeId: string): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(dayjs(selectedDate), "day") && event.clinicianId === employeeId;
    });
  };

  return (
    <Box
      style={{
        position: "absolute",
        top: 0,
        left: leftOffset,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {visibleEmployees.map((emp, index) => {
        const empEvents = getEmployeeEvents(emp.id);
        const dropZones = calculateDropZones(empEvents, emp.id, selectedDate);

        const left = index * columnWidth;

        return (
          <Box
            key={emp.id}
            style={{
              position: "absolute",
              left,
              top: 0,
              width: columnWidth,
              height: "100%",
            }}
          >
            {dropZones.map((zone, zoneIndex) => {
              const top = zone.startMinutes * (HOUR_HEIGHT / 60);
              const height = (zone.endMinutes - zone.startMinutes) * (HOUR_HEIGHT / 60);

              if (height < 15) return null;

              return (
                <Box
                  key={zoneIndex}
                  style={{
                    position: "absolute",
                    top,
                    left: 2,
                    right: 2,
                    height: height - 4,
                    border: "2px solid rgba(34, 197, 94, 0.6)",
                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                    borderRadius: 4,
                  }}
                />
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}
