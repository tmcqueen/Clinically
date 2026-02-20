import { useState } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  SegmentedControl,
  Button,
  Badge,
  Box,
  TextInput,
} from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";

export interface CalendarEvent {
  id: string;
  title: string;
  patientName: string;
  clinicianName: string;
  visitType: string;
  start: string;
  end: string;
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled";
  colorBy: "clinician" | "visit-type" | "status";
}

export interface CalendarFilters {
  clinicianId: string | null;
  patientName: string;
  view: "day" | "week" | "month";
  colorBy: "clinician" | "visit-type" | "status";
}

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  clinicians: { id: string; name: string }[];
  onEventClick?: (event: CalendarEvent) => void;
}

const statusColors: Record<string, string> = {
  scheduled: "blue",
  "checked-in": "yellow",
  "in-progress": "orange",
  completed: "green",
  cancelled: "red",
};

const clinicianColors: Record<string, string> = {
  "dr-smith": "blue",
  "dr-jones": "teal",
  "nurse-brown": "grape",
  "nurse-davis": "pink",
};

const visitTypeColors: Record<string, string> = {
  checkup: "blue",
  followup: "cyan",
  procedure: "orange",
  consultation: "violet",
};

export function ScheduleCalendar({
  events,
  clinicians,
  onEventClick,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [filters, setFilters] = useState<CalendarFilters>({
    clinicianId: null,
    patientName: "",
    view: "week",
    colorBy: "clinician",
  });

  const filteredEvents = events.filter((event) => {
    if (filters.clinicianId && event.clinicianName !== filters.clinicianId) {
      return false;
    }
    if (
      filters.patientName &&
      !event.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getEventColor = (event: CalendarEvent): string => {
    switch (filters.colorBy) {
      case "clinician":
        return clinicianColors[event.clinicianName] || "gray";
      case "visit-type":
        return visitTypeColors[event.visitType] || "gray";
      case "status":
        return statusColors[event.status] || "gray";
      default:
        return "gray";
    }
  };

  const getDayEvents = (date: dayjs.Dayjs): CalendarEvent[] => {
    return filteredEvents.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(date, "day");
    });
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <Paper p="md">
      <Title order={2} mb="md">
        Schedule
      </Title>

      <Group mb="md" align="flex-end">
        <Select
          label="Filter by Clinician"
          placeholder="All Clinicians"
          data={[
            { value: "", label: "All Clinicians" },
            ...clinicians.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={filters.clinicianId || ""}
          onChange={(value) =>
            setFilters({ ...filters, clinicianId: value || null })
          }
          style={{ width: 200 }}
        />

        <TextInput
          label="Patient Name"
          placeholder="Search..."
          value={filters.patientName}
          onChange={(e) =>
            setFilters({ ...filters, patientName: e.target.value })
          }
          style={{ width: 150 }}
        />

        <Select
          label="Color By"
          data={[
            { value: "clinician", label: "Clinician" },
            { value: "visit-type", label: "Visit Type" },
            { value: "status", label: "Status" },
          ]}
          value={filters.colorBy}
          onChange={(value) =>
            setFilters({
              ...filters,
              colorBy: (value as CalendarFilters["colorBy"]) || "clinician",
            })
          }
          style={{ width: 150 }}
        />

        <SegmentedControl
          value={filters.view}
          onChange={(value) =>
            setFilters({ ...filters, view: value as CalendarFilters["view"] })
          }
          data={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />

        <Group>
          <Button variant="outline" onClick={() => setSelectedDate(dayjs().format("YYYY-MM-DD"))}>
            Today
          </Button>
        </Group>
      </Group>

      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => setSelectedDate(dayjs(selectedDate).subtract(1, "week").format("YYYY-MM-DD"))}
        >
          Previous
        </Button>
        <Button
          variant="subtle"
          onClick={() => setSelectedDate(dayjs(selectedDate).add(1, "week").format("YYYY-MM-DD"))}
        >
          Next
        </Button>
        <Title order={4}>{dayjs(selectedDate).format("MMMM YYYY")}</Title>
      </Group>

      {filters.view === "month" && (
        <Calendar
          date={selectedDate}
          onDateChange={setSelectedDate}
          getDayProps={(date) => ({
            selected: dayjs(date).isSame(selectedDate, "day"),
          })}
        />
      )}

      {filters.view === "week" && (
        <Box>
          <Group grow>
            {Array.from({ length: 7 }, (_, i) => {
              const day = dayjs(selectedDate).startOf("week").add(i, "day");
              const dayEvents = getDayEvents(day);
              return (
                <Paper key={i} p="xs" withBorder>
                  <Title order={5}>{day.format("ddd MMM D")}</Title>
                  {dayEvents.map((event) => (
                    <Paper
                      key={event.id}
                      p="xs"
                      my="xs"
                      bg={getEventColor(event)}
                      style={{ cursor: "pointer" }}
                      onClick={() => onEventClick?.(event)}
                    >
                      <Group gap="xs">
                        <Badge size="xs" variant="white" color="dark">
                          {dayjs(event.start).format("h:mm A")}
                        </Badge>
                        <span style={{ color: "white", fontSize: "12px" }}>
                          {event.patientName}
                        </span>
                      </Group>
                      <Badge size="xs" variant="white" color="dark">
                        {event.visitType}
                      </Badge>
                    </Paper>
                  ))}
                </Paper>
              );
            })}
          </Group>
        </Box>
      )}

      {filters.view === "day" && (
        <Box>
          {timeSlots.map((hour) => {
            const hourEvents = filteredEvents.filter((event) => {
              const eventHour = dayjs(event.start).hour();
              return eventHour === hour;
            });
            return (
              <Paper key={hour} p="xs" withBorder my="xs">
                <Group gap="md">
                  <Badge variant="outline" style={{ width: 60 }}>
                    {hour}:00
                  </Badge>
                  {hourEvents.length === 0 ? (
                    <span style={{ color: "gray" }}>No appointments</span>
                  ) : (
                    hourEvents.map((event) => (
                      <Paper
                        key={event.id}
                        p="xs"
                        bg={getEventColor(event)}
                        style={{ cursor: "pointer" }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <span style={{ color: "white" }}>
                          {event.patientName} - {event.visitType}
                        </span>
                      </Paper>
                    ))
                  )}
                </Group>
              </Paper>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
