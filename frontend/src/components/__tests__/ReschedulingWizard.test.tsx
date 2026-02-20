import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ReschedulingWizard } from "../ReschedulingWizard";

const appointment = {
  id: "1",
  patientName: "John Doe",
  clinicianName: "Dr. Smith",
  visitType: "Checkup",
  visitDuration: 30,
  scheduledStart: "2026-02-20T09:00:00",
  scheduledEnd: "2026-02-20T09:30:00",
};

const clinicians = [
  { id: "dr-smith", name: "Dr. Smith" },
  { id: "dr-jones", name: "Dr. Jones" },
];

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("ReschedulingWizard", () => {
  it("renders wizard with title", () => {
    renderWithMantine(
      <ReschedulingWizard
        appointment={appointment}
        clinicians={clinicians}
        onReschedule={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("Reschedule Appointment")).toBeDefined();
  });

  it("shows current appointment info", () => {
    renderWithMantine(
      <ReschedulingWizard
        appointment={appointment}
        clinicians={clinicians}
        onReschedule={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("Checkup")).toBeDefined();
  });

  it("shows wizard and drag-drop mode buttons", () => {
    renderWithMantine(
      <ReschedulingWizard
        appointment={appointment}
        clinicians={clinicians}
        onReschedule={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("Wizard")).toBeDefined();
    expect(screen.getByText("Drag & Drop")).toBeDefined();
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    renderWithMantine(
      <ReschedulingWizard
        appointment={appointment}
        clinicians={clinicians}
        onReschedule={() => {}}
        onCancel={onCancel}
      />
    );
    screen.getByText("Cancel").click();
    expect(onCancel).toHaveBeenCalled();
  });
});
