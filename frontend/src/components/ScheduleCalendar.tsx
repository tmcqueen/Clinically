import { useState, useEffect, useRef } from "react";
import {
  Paper,
  Group,
  Select,
  SegmentedControl,
  Button,
  Box,
  TextInput,
  Title,
  Text,
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

const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const TOTAL_HOURS = 24;
const TIME_RULER_WIDTH = 60;

function useCurrentTime(updateInterval: number = 300000) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);
  
  return currentTime;
}

function DayView({
  events,
  selectedDate,
  filters,
  onEventClick,
  currentTime,
}: {
  events: CalendarEvent[];
  selectedDate: string;
  filters: CalendarFilters;
  onEventClick?: (event: CalendarEvent) => void;
  currentTime: Date;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeRulerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = dayjs().hour();
      const scrollPosition = currentHour * HOUR_HEIGHT - 100;
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);
  
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
    return events.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(date, "day");
    });
  };
  
  const selectedDay = dayjs(selectedDate);
  const dayEvents = getDayEvents(selectedDay);
  const isToday = selectedDay.isSame(dayjs(), "day");
  
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimePosition = (currentHour * 60 + currentMinute) * MINUTE_HEIGHT;
  
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);
  const quarterHours = [0, 15, 30, 45];
  
  return (
    <Box style={{ display: "flex", height: "calc(100vh - 180px)", overflow: "hidden" }}>
      <Box
        ref={timeRulerRef}
        style={{
          width: TIME_RULER_WIDTH,
          flexShrink: 0,
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
          overflow: "hidden",
        }}
      >
        {hours.map((hour) => (
          <Box
            key={hour}
            style={{
              height: HOUR_HEIGHT,
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              paddingRight: 8,
              paddingTop: 2,
            }}
          >
            <Text size="xs" c="dimmed">
              {hour.toString().padStart(2, "0")}:00
            </Text>
          </Box>
        ))}
      </Box>
      
      <Box
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <Box style={{ position: "relative", height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {hours.map((hour) => (
            <Box
              key={hour}
              style={{
                height: HOUR_HEIGHT,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              {quarterHours.slice(1).map((q) => (
                <Box
                  key={q}
                  style={{
                    height: HOUR_HEIGHT / 4,
                    borderBottom: q === 30 ? "1px solid #eee" : "1px dashed #f5f5f5",
                  }}
                />
              ))}
            </Box>
          ))}
          
          {isToday && (
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
            >
              <Box
                style={{
                  position: "absolute",
                  left: -4,
                  top: -4,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "red",
                }}
              />
            </Box>
          )}
          
          {dayEvents.map((event) => {
            const start = dayjs(event.start);
            const end = dayjs(event.end);
            const durationMinutes = end.diff(start, "minute");
            const topPosition = (start.hour() * 60 + start.minute()) * MINUTE_HEIGHT;
            const height = durationMinutes * MINUTE_HEIGHT;
            
            return (
              <Paper
                key={event.id}
                p="xs"
                style={{
                  position: "absolute",
                  top: topPosition,
                  left: 4,
                  right: 4,
                  height: height - 4,
                  backgroundColor: getEventColor(event),
                  cursor: "pointer",
                  zIndex: 5,
                  overflow: "hidden",
                }}
                onClick={() => onEventClick?.(event)}
              >
                <Text size="xs" c="white" fw={500}>
                  {start.format("h:mm A")} - {event.patientName}
                </Text>
                <Text size="xs" c="white" opacity={0.8}>
                  {event.visitType}
                </Text>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export function ScheduleCalendar({
  events,
  clinicians,
  onEventClick,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [filters, setFilters] = useState<CalendarFilters>({
    clinicianId: null,
    patientName: "",
    view: "day",
    colorBy: "clinician",
  });
  
  const currentTime = useCurrentTime(300000);
  
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

  const getDayEvents = (date: dayjs.Dayjs): CalendarEvent[] => {
    return filteredEvents.filter((event) => {
      const eventDay = dayjs(event.start);
      return eventDay.isSame(date, "day");
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const unit = filters.view === "month" ? "month" : filters.view === "week" ? "week" : "day";
    setSelectedDate(dayjs(selectedDate).add(direction === "next" ? 1 : -1, unit).format("YYYY-MM-DD"));
  };

  return (
    <Paper p="xs" style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      <Group mb="xs" align="center" gap="xs">
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
        
        <Group ml="auto" gap="xs">
          <Select
            placeholder="Clinician"
            data={[
              { value: "", label: "All" },
              ...clinicians.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={filters.clinicianId || ""}
            onChange={(value) => setFilters({ ...filters, clinicianId: value || null })}
            size="xs"
            style={{ width: 120 }}
          />
          
          <TextInput
            placeholder="Patient"
            value={filters.patientName}
            onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
            size="xs"
            style={{ width: 100 }}
          />
          
          <Select
            data={[
              { value: "clinician", label: "Clinician" },
              { value: "visit-type", label: "Visit" },
              { value: "status", label: "Status" },
            ]}
            value={filters.colorBy}
            onChange={(value) => setFilters({ ...filters, colorBy: (value as CalendarFilters["colorBy"]) || "clinician" })}
            size="xs"
            style={{ width: 80 }}
          />
          
          <SegmentedControl
            size="xs"
            value={filters.view}
            onChange={(value) => setFilters({ ...filters, view: value as CalendarFilters["view"] })}
            data={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
        </Group>
      </Group>

      <Box style={{ flex: 1, overflow: "hidden" }}>
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
          <Box style={{ height: "100%", overflowY: "auto" }}>
            <Group grow gap={4}>
              {Array.from({ length: 7 }, (_, i) => {
                const day = dayjs(selectedDate).startOf("week").add(i, "day");
                const dayEvents = getDayEvents(day);
                const isToday = day.isSame(dayjs(), "day");
                
                return (
                  <Paper key={i} p={4} withBorder style={{ minHeight: 200 }}>
                    <Text size="xs" fw={isToday ? 700 : 500} ta="center" mb="xs">
                      {day.format("ddd MMM D")}
                    </Text>
                    {dayEvents.map((event) => {
                      const color = filters.colorBy === "clinician" 
                        ? clinicianColors[event.clinicianName] || "gray"
                        : filters.colorBy === "visit-type"
                        ? visitTypeColors[event.visitType] || "gray"
                        : statusColors[event.status] || "gray";
                      
                      return (
                        <Paper
                          key={event.id}
                          p={2}
                          mb={2}
                          bg={color}
                          style={{ cursor: "pointer" }}
                          onClick={() => onEventClick?.(event)}
                        >
                          <Text size="xs" c="white">{dayjs(event.start).format("h:mm")}</Text>
                          <Text size="xs" c="white" lineClamp={1}>{event.patientName}</Text>
                        </Paper>
                      );
                    })}
                  </Paper>
                );
              })}
            </Group>
          </Box>
        )}

        {filters.view === "day" && (
          <DayView
            events={filteredEvents}
            selectedDate={selectedDate}
            filters={filters}
            onEventClick={onEventClick}
            currentTime={currentTime}
          />
        )}
      </Box>
    </Paper>
  );
}
