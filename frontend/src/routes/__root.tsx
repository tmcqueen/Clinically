import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MantineProvider, createTheme, AppShell, NavLink } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Link, useLocation } from "@tanstack/react-router";
import { IconCalendar, IconHome, IconUsers, IconClock, IconSettings } from "@tabler/icons-react";

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

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    
    return (
      <MantineProvider theme={theme}>
        <AppShell
          navbar={{ width: 60, breakpoint: "sm" }}
          padding={0}
        >
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

          <AppShell.Main style={{ width: "100vw" }}>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    );
  },
});
