import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { SchedulingWizard } from "../SchedulingWizard";

const visitDefinitions = [
  { id: "1", name: "Checkup", description: "Regular checkup", defaultDurationMinutes: 30, color: "blue" },
  { id: "2", name: "Follow-up", description: "Follow-up visit", defaultDurationMinutes: 15, color: "green" },
];

const clinicians = [
  { id: "dr-smith", name: "Dr. Smith" },
  { id: "dr-jones", name: "Dr. Jones" },
];

const patients = [
  { id: "p1", name: "John Doe" },
  { id: "p2", name: "Jane Doe" },
];

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("SchedulingWizard", () => {
  it("renders wizard with title", () => {
    renderWithMantine(
      <SchedulingWizard
        visitDefinitions={visitDefinitions}
        clinicians={clinicians}
        patients={patients}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("Schedule Appointment")).toBeDefined();
  });

  it("renders patient step first", () => {
    renderWithMantine(
      <SchedulingWizard
        visitDefinitions={visitDefinitions}
        clinicians={clinicians}
        patients={patients}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByPlaceholderText("Select patient")).toBeDefined();
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    renderWithMantine(
      <SchedulingWizard
        visitDefinitions={visitDefinitions}
        clinicians={clinicians}
        patients={patients}
        onSubmit={() => {}}
        onCancel={onCancel}
      />
    );
    screen.getByText("Cancel").click();
    expect(onCancel).toHaveBeenCalled();
  });
});
