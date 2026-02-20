import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScheduleCalendar, type CalendarEvent } from "../components/ScheduleCalendar";

export const Route = createFileRoute("/calendar")({
  component: Calendar,
});

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Annual Checkup",
    patientName: "John Smith",
    clinicianName: "dr-smith",
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
    clinicianName: "dr-jones",
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
    clinicianName: "dr-smith",
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
    clinicianName: "dr-jones",
    visitType: "checkup",
    start: "2026-02-21T14:00:00",
    end: "2026-02-21T15:00:00",
    status: "scheduled",
    colorBy: "clinician",
  },
];

const clinicians = [
  { id: "dr-smith", name: "Dr. Smith" },
  { id: "dr-jones", name: "Dr. Jones" },
  { id: "nurse-brown", name: "Nurse Brown" },
  { id: "nurse-davis", name: "Nurse Davis" },
];

function Calendar() {
  const [events] = useState<CalendarEvent[]>(mockEvents);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  return (
    <ScheduleCalendar
      events={events}
      clinicians={clinicians}
      onEventClick={handleEventClick}
    />
  );
}
