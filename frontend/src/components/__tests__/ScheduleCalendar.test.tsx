import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ScheduleCalendar } from "../ScheduleCalendar";

const mockEvents = [
  {
    id: "1",
    title: "Annual Checkup",
    patientName: "John Smith",
    clinicianName: "dr-smith",
    visitType: "checkup",
    start: "2026-02-20T09:00:00",
    end: "2026-02-20T09:30:00",
    status: "scheduled" as const,
    colorBy: "clinician" as const,
  },
];

const clinicians = [
  { id: "dr-smith", name: "Dr. Smith" },
  { id: "dr-jones", name: "Dr. Jones" },
];

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("ScheduleCalendar", () => {
  it("renders calendar with title", () => {
    renderWithMantine(
      <ScheduleCalendar
        events={mockEvents}
        clinicians={clinicians}
      />
    );
    expect(screen.getByText("Schedule")).toBeDefined();
  });

  it("renders clinician filter", () => {
    renderWithMantine(
      <ScheduleCalendar
        events={mockEvents}
        clinicians={clinicians}
      />
    );
    expect(screen.getByText("Filter by Clinician")).toBeDefined();
  });

  it("renders view selector", () => {
    renderWithMantine(
      <ScheduleCalendar
        events={mockEvents}
        clinicians={clinicians}
      />
    );
    expect(screen.getByText("Day")).toBeDefined();
    expect(screen.getByText("Week")).toBeDefined();
    expect(screen.getByText("Month")).toBeDefined();
  });

  it("renders color by selector", () => {
    renderWithMantine(
      <ScheduleCalendar
        events={mockEvents}
        clinicians={clinicians}
      />
    );
    expect(screen.getByText("Color By")).toBeDefined();
  });
});
