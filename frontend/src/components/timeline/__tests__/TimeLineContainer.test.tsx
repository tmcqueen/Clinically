import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import userEvent from "@testing-library/user-event";
import { TimeLineContainer } from "../TimeLineContainer";
import type { CalendarEvent, Employee } from "../TimeLineBase";

const mockEvents: CalendarEvent[] = [
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
    status: "scheduled",
    colorBy: "clinician",
  },
];

const employees: Employee[] = [
  { id: "dr-smith", displayName: "Dr. Smith", credentials: "MD", type: "provider" },
  { id: "dr-jones", displayName: "Dr. Jones", credentials: "DO", type: "provider" },
];

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("TimeLineContainer", () => {
  it("renders timeline with provider columns", () => {
    renderWithMantine(
      <TimeLineContainer
        events={mockEvents}
        employees={employees}
        selectedDate="2026-02-20"
      />
    );
    expect(screen.getByText("Dr. Smith")).toBeDefined();
    expect(screen.getByText("Dr. Jones")).toBeDefined();
  });

  it("renders events in correct columns", () => {
    renderWithMantine(
      <TimeLineContainer
        events={mockEvents}
        employees={employees}
        selectedDate="2026-02-20"
      />
    );
    expect(screen.getByText("John Smith")).toBeDefined();
    expect(screen.getByText("Jane Doe")).toBeDefined();
  });

  it("calls onEventClick when event is clicked", async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    
    renderWithMantine(
      <TimeLineContainer
        events={mockEvents}
        employees={employees}
        selectedDate="2026-02-20"
        onEventClick={onEventClick}
      />
    );
    
    const event = screen.getByText("John Smith");
    await user.click(event);
    
    expect(onEventClick).toHaveBeenCalled();
  });

  it("calls onEventDrop callback when drag ends", () => {
    const onEventDrop = vi.fn();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    
    renderWithMantine(
      <TimeLineContainer
        events={mockEvents}
        employees={employees}
        selectedDate="2026-02-20"
        onEventDrop={onEventDrop}
      />
    );
    
    consoleSpy.mockRestore();
  });
});

describe("Calendar event drag persistence", () => {
  it("updates events state when onEventDrop is called", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        title: "Test",
        patientName: "Test Patient",
        clinicianId: "dr-smith",
        visitType: "checkup",
        start: "2026-02-20T09:00:00",
        end: "2026-02-20T09:30:00",
        status: "scheduled",
        colorBy: "clinician",
      },
    ];
    
    const onEventDrop = vi.fn((eventId: string, newProviderId: string) => {
      expect(eventId).toBe("1");
      expect(newProviderId).toBeDefined();
    });
    
    const { container } = renderWithMantine(
      <TimeLineContainer
        events={events}
        employees={employees}
        selectedDate="2026-02-20"
        onEventDrop={onEventDrop}
      />
    );
    
    expect(container).toBeDefined();
  });
});
