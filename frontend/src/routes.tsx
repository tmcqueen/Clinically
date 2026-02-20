import { createRootRoute, createRoute, Outlet, createRouter } from "@tanstack/react-router";
import { MantineProvider, createTheme, AppShell, Group, Button, Title } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Text } from "@mantine/core";
import { ScheduleCalendar, type CalendarEvent } from "./components/ScheduleCalendar";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "system-ui, -apple-system, sans-serif",
});

const RootComponent = () => {
  return (
    <MantineProvider theme={theme}>
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header>
          <Group h="100%" px="md">
            <Title order={3}>Practice Management</Title>
            <Group ml="auto">
              <Button component={Link} to="/" variant="subtle">
                Home
              </Button>
              <Button component={Link} to="/calendar" variant="subtle">
                Calendar
              </Button>
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
};

const IndexComponent = () => {
  return (
    <Container size="xl" py="xl">
      <Title order={1}>Practice Management</Title>
      <Text c="dimmed">Welcome to the Practice Management System</Text>
    </Container>
  );
};

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

const CalendarComponent = () => {
  const [events] = useState<CalendarEvent[]>(mockEvents);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xs">
        Schedule
      </Title>
      <Text c="dimmed" mb="xl">
        View and manage appointments
      </Text>
      <ScheduleCalendar
        events={events}
        clinicians={clinicians}
        onEventClick={handleEventClick}
      />
    </Container>
  );
};

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexComponent,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calendar",
  component: CalendarComponent,
});

const routeTree = rootRoute.addChildren([indexRoute, calendarRoute]);

const router = createRouter({ routeTree });

export { router, routeTree };
