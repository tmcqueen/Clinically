import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { PatientIntakeWizard } from "../PatientIntakeWizard";

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("PatientIntakeWizard", () => {
  it("renders wizard with title", () => {
    renderWithMantine(
      <PatientIntakeWizard
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("New Patient Intake")).toBeDefined();
  });

  it("renders personal info step first", () => {
    renderWithMantine(
      <PatientIntakeWizard
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("First Name")).toBeDefined();
    expect(screen.getByText("Last Name")).toBeDefined();
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = vi.fn();
    renderWithMantine(
      <PatientIntakeWizard
        onSubmit={() => {}}
        onCancel={onCancel}
      />
    );
    screen.getByText("Cancel").click();
    expect(onCancel).toHaveBeenCalled();
  });
});
