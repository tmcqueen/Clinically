import { describe, it, expect } from "vitest";
import {
  snapToQuarterHour,
  timeToMinutes,
  minutesToTime,
  getAppointmentDuration,
  calculateDropZones,
  TOTAL_HOURS,
  type CalendarEvent,
} from "../TimeLineBase";

describe("snapToQuarterHour", () => {
  it("rounds down when below quarter", () => {
    expect(snapToQuarterHour(7)).toBe(0);
  });

  it("rounds up when above quarter", () => {
    expect(snapToQuarterHour(8)).toBe(15);
  });

  it("rounds to exact quarter hour", () => {
    expect(snapToQuarterHour(15)).toBe(15);
    expect(snapToQuarterHour(30)).toBe(30);
    expect(snapToQuarterHour(45)).toBe(45);
  });

  it("rounds to nearest quarter hour using Math.round", () => {
    expect(snapToQuarterHour(50)).toBe(45);
    expect(snapToQuarterHour(55)).toBe(60);
  });

  it("handles edge cases", () => {
    expect(snapToQuarterHour(0)).toBe(0);
    expect(snapToQuarterHour(59)).toBe(60);
  });
});

describe("timeToMinutes", () => {
  it("converts time string to minutes", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("handles times with seconds", () => {
    expect(timeToMinutes("09:00:00")).toBe(540);
    expect(timeToMinutes("09:30:30")).toBe(570);
  });

  it("returns 0 for invalid input", () => {
    expect(timeToMinutes("")).toBe(0);
    expect(timeToMinutes("invalid")).toBe(0);
  });
});

describe("minutesToTime", () => {
  it("converts minutes to time string", () => {
    expect(minutesToTime(540)).toBe("09:00:00");
    expect(minutesToTime(570)).toBe("09:30:00");
    expect(minutesToTime(0)).toBe("00:00:00");
    expect(minutesToTime(1439)).toBe("23:59:00");
  });

  it("handles minutes beyond an hour", () => {
    expect(minutesToTime(61)).toBe("01:01:00");
    expect(minutesToTime(90)).toBe("01:30:00");
  });
});

describe("getAppointmentDuration", () => {
  it("calculates duration in minutes", () => {
    expect(getAppointmentDuration("09:00", "09:30")).toBe(30);
    expect(getAppointmentDuration("09:00", "10:00")).toBe(60);
    expect(getAppointmentDuration("09:00", "11:30")).toBe(150);
  });

  it("returns 0 for same start and end", () => {
    expect(getAppointmentDuration("09:00", "09:00")).toBe(0);
  });

  it("handles times with seconds", () => {
    expect(getAppointmentDuration("09:00:00", "09:30:00")).toBe(30);
  });
});

describe("calculateDropZones", () => {
  const createEvent = (
    start: string,
    end: string,
    clinicianId: string = "dr-smith"
  ): CalendarEvent => ({
    id: "1",
    title: "Test",
    patientName: "Patient",
    clinicianId,
    visitType: "checkup",
    start,
    end,
    status: "scheduled",
    colorBy: "clinician",
  });

  it("returns full day when no appointments", () => {
    const result = calculateDropZones([], "dr-smith", "2026-02-20");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      providerId: "dr-smith",
      startMinutes: 0,
      endMinutes: TOTAL_HOURS * 60,
      isValid: true,
    });
  });

  it("creates drop zones before and after appointment", () => {
    const appointments = [createEvent("2026-02-20T10:00:00", "2026-02-20T11:00:00")];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    expect(result).toHaveLength(2);
    // Before first appointment
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(600); // 10:00 = 600 minutes
    // After last appointment
    expect(result[1].startMinutes).toBe(660); // 11:00 = 660 minutes
    expect(result[1].endMinutes).toBe(TOTAL_HOURS * 60);
  });

  it("creates drop zones before and after appointment (same times)", () => {
    const appointments = [createEvent("2026-02-20T09:00:00", "2026-02-20T10:00:00")];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    expect(result).toHaveLength(2);
    // Before first appointment
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(540); // 09:00 = 540 minutes
    // After last appointment
    expect(result[1].startMinutes).toBe(600); // 10:00 = 600 minutes
    expect(result[1].endMinutes).toBe(TOTAL_HOURS * 60);
  });

  it("creates drop zones between appointments plus edges", () => {
    const appointments = [
      createEvent("2026-02-20T09:00:00", "2026-02-20T10:00:00"),
      createEvent("2026-02-20T12:00:00", "2026-02-20T13:00:00"),
    ];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    expect(result).toHaveLength(3);
    // Before first appointment
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(540);
    // Between appointments
    expect(result[1].startMinutes).toBe(600); // 10:00
    expect(result[1].endMinutes).toBe(720); // 12:00
    // After last appointment
    expect(result[2].startMinutes).toBe(780); // 13:00
    expect(result[2].endMinutes).toBe(TOTAL_HOURS * 60);
  });

  it("creates multiple drop zones for multiple gaps", () => {
    const appointments = [
      createEvent("2026-02-20T09:00:00", "2026-02-20T09:30:00"),
      createEvent("2026-02-20T10:00:00", "2026-02-20T10:30:00"),
      createEvent("2026-02-20T12:00:00", "2026-02-20T13:00:00"),
    ];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    expect(result).toHaveLength(4);
    // Before first
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(540);
    // Gap between 09:30 and 10:00
    expect(result[1].startMinutes).toBe(570);
    expect(result[1].endMinutes).toBe(600);
    // Gap between 10:30 and 12:00
    expect(result[2].startMinutes).toBe(630);
    expect(result[2].endMinutes).toBe(720);
    // After 13:00
    expect(result[3].startMinutes).toBe(780);
    expect(result[3].endMinutes).toBe(TOTAL_HOURS * 60);
  });

  it("filters by provider id", () => {
    const appointments = [
      createEvent("2026-02-20T09:00:00", "2026-02-20T10:00:00", "dr-smith"),
      createEvent("2026-02-20T09:00:00", "2026-02-20T10:00:00", "dr-jones"),
    ];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    // Should only see dr-smith's appointment, so full day available except that slot
    expect(result).toHaveLength(2);
    // Before dr-smith's appointment
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(540);
    // After dr-smith's appointment
    expect(result[1].startMinutes).toBe(600);
    expect(result[1].endMinutes).toBe(TOTAL_HOURS * 60);
  });

  it("filters by date", () => {
    const appointments = [
      createEvent("2026-02-20T09:00:00", "2026-02-20T10:00:00"),
      createEvent("2026-02-21T09:00:00", "2026-02-21T10:00:00"),
    ];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    // Should only see 2026-02-20 appointment - full day except that slot
    expect(result).toHaveLength(2);
    expect(result[0].startMinutes).toBe(0);
    expect(result[0].endMinutes).toBe(540);
    expect(result[1].startMinutes).toBe(600);
  });

  it("returns empty array when appointments fill entire day", () => {
    const appointments = [
      createEvent("2026-02-20T00:00:00", "2026-02-20T23:59:00"),
    ];
    const result = calculateDropZones(appointments, "dr-smith", "2026-02-20");

    expect(result).toHaveLength(1);
    expect(result[0].startMinutes).toBe(1439);
    expect(result[0].endMinutes).toBe(1440);
  });
});
