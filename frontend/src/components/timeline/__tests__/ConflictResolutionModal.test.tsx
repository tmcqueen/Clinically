import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { ConflictResolutionModal } from "../ConflictResolutionModal";

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe("ConflictResolutionModal", () => {
  const defaultProps = {
    opened: true,
    onClose: vi.fn(),
    onResolve: vi.fn(),
    draggedEvent: {
      patientName: "John Doe",
      visitType: "Checkup",
      start: "2026-02-20T09:00:00",
      end: "2026-02-20T09:30:00",
    },
    conflictingEvent: {
      eventId: "2",
      patientName: "Jane Smith",
      visitType: "Follow-up",
      start: "2026-02-20T09:15:00",
      end: "2026-02-20T09:45:00",
      clinicianName: "Dr. Jones",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when opened", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    expect(screen.getByText("Scheduling Conflict")).toBeInTheDocument();
  });

  it("shows dragged and conflicting event details", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("calls onResolve with 'cancel' when Cancel button is clicked", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onResolve).toHaveBeenCalledWith("cancel");
  });

  it("calls onResolve with 'force' when Force Drop button is clicked", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Force Drop"));
    expect(defaultProps.onResolve).toHaveBeenCalledWith("force");
  });

  it("calls onResolve with 'swap' when Swap button is clicked", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Swap"));
    expect(defaultProps.onResolve).toHaveBeenCalledWith("swap");
  });

  it("calls onResolve with 'move-next' when Move Conflicting Next button is clicked", () => {
    renderWithMantine(<ConflictResolutionModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Move Conflicting Next"));
    expect(defaultProps.onResolve).toHaveBeenCalledWith("move-next");
  });
});
