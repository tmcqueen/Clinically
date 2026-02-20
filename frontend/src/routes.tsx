import { createRootRoute, createRoute, Outlet, createRouter } from "@tanstack/react-router";
import { MantineProvider, createTheme, AppShell, NavLink, Group, Title, Avatar } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Text as MantineText } from "@mantine/core";
import { ScheduleCalendar, type CalendarEvent } from "./components/ScheduleCalendar";
import { IconCalendar, IconHome, IconUsers, IconClock, IconSettings, IconUser } from "@tabler/icons-react";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "system-ui, -apple-system, sans-serif",
});

const navItems = [
  { label: "Home", icon: IconHome, path: "/" },
  { label: "Calendar", icon: IconCalendar, path: "/calendar" },
  { label: "Patients", icon: IconUsers, path: "/patients", disabled: true },
  { label: "Appointments", icon: IconClock, path: "/appointments", disabled: true },
  { label: "Settings", icon: IconSettings, path: "/settings", disabled: true },
];

const RootComponent = () => {
  const location = useLocation();
  
  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 50 }}
        navbar={{ width: 60, breakpoint: "sm" }}
        padding={0}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Title order={4}>Practice Management</Title>
            <Group gap="sm">
              <Avatar size="sm" radius="xl" color="blue">
                <IconUser size={16} />
              </Avatar>
              <MantineText size="sm">Dr. Smith</MantineText>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p={4}>
          <AppShell.Section>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                leftSection={<item.icon size={20} />}
                active={location.pathname === item.path}
                disabled={item.disabled}
                variant="light"
                style={{ borderRadius: 8, justifyContent: "center", padding: "10px" }}
              />
            ))}
          </AppShell.Section>
          
          <AppShell.Section grow mt="auto">
            <NavLink
              leftSection={<IconSettings size={20} />}
              variant="light"
              style={{ borderRadius: 8, justifyContent: "center", padding: "10px" }}
            />
          </AppShell.Section>
        </AppShell.Navbar>

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
      <MantineText c="dimmed">Welcome to the Practice Management System</MantineText>
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

const CalendarComponent = () => {
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
