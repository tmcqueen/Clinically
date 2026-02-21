import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Group, Button, Title, Box, Paper } from "@mantine/core";
import { TimeLineContainer, type CalendarEvent, type Employee } from "../components/timeline";
import dayjs from "dayjs";

export const Route = createFileRoute("/calendar")({
  component: Calendar,
});

const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Annual Checkup",
    patientName: "John Smith",
    clinicianId: "dr-smith",
    visitType: "checkup",
    start: "2026-02-20T09:00:00",
    end: "2026-02-20T09:30:00",
    status: "scheduled",
    colorBy: "clinician",
  },
  {
    id: "2",
    title: "Follow-up",
    patientName: "Jane Doe",
    clinicianId: "dr-jones",
    visitType: "followup",
    start: "2026-02-20T10:00:00",
    end: "2026-02-20T10:30:00",
    status: "checked-in",
    colorBy: "clinician",
  },
  {
    id: "3",
    title: "Consultation",
    patientName: "Bob Wilson",
    clinicianId: "dr-smith",
    visitType: "consultation",
    start: "2026-02-20T09:15:00",
    end: "2026-02-20T09:45:00",
    status: "scheduled",
    colorBy: "clinician",
  },
  {
    id: "4",
    title: "Annual Checkup",
    patientName: "Alice Johnson",
    clinicianId: "dr-jones",
    visitType: "checkup",
    start: "2026-02-21T14:00:00",
    end: "2026-02-21T15:00:00",
    status: "scheduled",
    colorBy: "clinician",
  },
];

const employees: Employee[] = [
  { id: "dr-smith", displayName: "Dr. Smith", credentials: "MD", type: "provider" },
  { id: "dr-jones", displayName: "Dr. Jones", credentials: "DO", type: "provider" },
  { id: "nurse-brown", displayName: "Nurse Brown", credentials: "RN", type: "nurse" },
  { id: "nurse-davis", displayName: "Nurse Davis", credentials: "RN", type: "nurse" },
];

function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  const handleEventDrop = useCallback(
    (eventId: string, newProviderId: string, newStart: string, newEnd: string) => {
      console.log("Event dropped:", { eventId, newProviderId, newStart, newEnd });
      
      setEvents((prevEvents) => {
        return prevEvents.map((event) => {
          if (event.id === eventId) {
            const newStartDateTime = dayjs(selectedDate).format("YYYY-MM-DD") + "T" + newStart;
            const newEndDateTime = dayjs(selectedDate).format("YYYY-MM-DD") + "T" + newEnd;
            
            console.log("Updating event:", {
              id: event.id,
              patientName: event.patientName,
              oldStart: event.start,
              oldEnd: event.end,
              oldClinicianId: event.clinicianId,
              newStart: newStartDateTime,
              newEnd: newEndDateTime,
              newClinicianId: newProviderId,
            });
            
            return {
              ...event,
              clinicianId: newProviderId,
              start: newStartDateTime,
              end: newEndDateTime,
            };
          }
          return event;
        });
      });
    },
    [selectedDate]
  );

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      dayjs(prev).add(direction === "next" ? 1 : -1, "day").format("YYYY-MM-DD")
    );
  };

  return (
    <Paper style={{ height: "100vh", display: "flex", flexDirection: "column", margin: 0, padding: 0, borderRadius: 0 }}>
      <Group mb="xs" align="center" gap="xs" p="xs" style={{ borderBottom: "1px solid #eee" }}>
        <Button variant="subtle" size="xs" onClick={() => navigateDate("prev")}>
          Previous
        </Button>
        <Button variant="subtle" size="xs" onClick={() => navigateDate("next")}>
          Next
        </Button>
        <Button variant="outline" size="xs" onClick={() => setSelectedDate(dayjs().format("YYYY-MM-DD"))}>
          Today
        </Button>
        <Title order={4} ml="sm">
          {dayjs(selectedDate).format("MMMM D, YYYY")}
        </Title>
      </Group>

      <Box style={{ flex: 1, overflow: "hidden" }}>
        <TimeLineContainer
          events={events}
          employees={employees}
          selectedDate={selectedDate}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      </Box>
    </Paper>
  );
}
