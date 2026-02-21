import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MantineProvider } from "@mantine/core";
import { AvailableSlotsOverlay } from "../AvailableSlotsOverlay";
import type { CalendarEvent, Employee } from "../TimeLineBase";

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

const mockEmployees: Employee[] = [
  { id: "dr-smith", displayName: "Dr. Smith", credentials: "MD", type: "Physician" },
  { id: "dr-jones", displayName: "Dr. Jones", credentials: "MD", type: "Physician" },
];

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Appointment 1",
    patientName: "John Doe",
    clinicianId: "dr-smith",
    visitType: "checkup",
    start: "2026-02-20T09:00:00",
    end: "2026-02-20T09:30:00",
    status: "scheduled",
    colorBy: "clinician",
  },
];

describe("AvailableSlotsOverlay", () => {
  it("renders without crashing", () => {
    renderWithMantine(
      <AvailableSlotsOverlay
        events={mockEvents}
        employees={mockEmployees}
        selectedDate="2026-02-20"
        columnWidth={180}
        visibleEmployeeIds={["dr-smith", "dr-jones"]}
      />
    );
    // Just verify it renders - the overlay uses pointerEvents: none so nothing is interactive
    expect(document.querySelector("[style*='position: absolute']")).toBeInTheDocument();
  });

  it("renders overlay boxes for each visible employee", () => {
    renderWithMantine(
      <AvailableSlotsOverlay
        events={mockEvents}
        employees={mockEmployees}
        selectedDate="2026-02-20"
        columnWidth={180}
        visibleEmployeeIds={["dr-smith", "dr-jones"]}
      />
    );
    // The overlay should create boxes with green borders
    const boxes = document.querySelectorAll("[style*='border']");
    expect(boxes.length).toBeGreaterThan(0);
  });
});
